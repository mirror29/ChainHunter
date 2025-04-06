from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import os
import json
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse
from agents import OpenAIChatCompletionsModel, Agent, Runner, set_default_openai_client,ModelSettings
from openai import AsyncOpenAI
from openai.types.responses import ResponseTextDeltaEvent
from agents.mcp import MCPServerStdio
from contextlib import AsyncExitStack

load_dotenv()

# Initialize OpenAI client
external_client = AsyncOpenAI(
    base_url=os.getenv("DEEPSEEK_API_BASE"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
)

set_default_openai_client(external_client)

# Initialize models and agents
deepseek_model = OpenAIChatCompletionsModel(
    model="deepseek-chat", openai_client=external_client
)

chinese_agent = Agent(
    name="Chinese agent",
    instructions="你是一个专业的区块链行业助手ChainHunte，你只能用中文进行回复。",
    handoff_description="当用户输入文时，调用该智能体来回答用户问题。",
    model=deepseek_model,
)

english_agent = Agent(
    name="English agent",
    instructions="你是一个专业的区块链行业助手ChainHunter，你只能用英文进行回复。",
    handoff_description="当用户输入非英文时，调用该智能体来回答用户问题。",
    model=deepseek_model,
)

triage_agent = Agent(
    name="分诊智能体",
    instructions="""你是一个专业的区块链行业助手ChainHunter，
    可以帮助用户进行合约自动化交易，市场机会发现套利和量化交易，
    还有币圈项目背调（包括项目背景，融资情况，投资建议等），链上监控等相关功能，
    根据请求的语言将其交接给合适的智能体。""",
    handoffs=[chinese_agent, english_agent],
    model=deepseek_model,
)

# Create FastAPI app
app = FastAPI(title="ChainHunter API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request and response
class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None
    chatId: Optional[str] = None
    chatHash: Optional[str] = None
    stream: Optional[bool] = False


class ChatResponse(BaseModel):
    message: str
    chatId: Optional[str] = None
    success: bool = True

# 创建全局exit stack和MCP服务器实例
global_exit_stack = AsyncExitStack()
global_servers = {}
global_mcp_agent = None

# 初始化MCP服务器的函数
async def init_mcp_servers():
    global global_exit_stack, global_servers, global_mcp_agent

    try:
        if not global_servers:
            print("初始化MCP服务器...")
            # 确保exit_stack被初始化
            if not isinstance(global_exit_stack, AsyncExitStack):
                global_exit_stack = AsyncExitStack()
                await global_exit_stack.__aenter__()

            # MCP服务器参数
            servers_params = [
                {"name": "coincap-mcp", "command": "npx", "args": ["coincap-mcp"]},
                {"name": "webresearch", "command": "npx", "args": ["-y", "@mzxrai/mcp-webresearch@latest"]},
            ]

            # 创建并连接所有服务器
            for p in servers_params:
                try:
                    server = MCPServerStdio(
                        name=p.get("name", "Unnamed Server"),
                        cache_tools_list=True,
                        params={
                            "command": p["command"],
                            "args": p["args"],
                        },
                    )
                    entered_server = await global_exit_stack.enter_async_context(server)
                    global_servers[p["name"]] = entered_server
                    print(f"服务器 {p['name']} 启动并连接成功")
                except Exception as e:
                    print(f"启动服务器 {p['name']} 失败: {str(e)}")
                    raise

            # 创建agent，传入所有servers
            agent_config = {
                "name": "ChainHunter区块链助手",
                "instructions":"""你是一个专业的区块链行业助手ChainHunter，
                可以帮助用户进行合约自动化交易，市场机会发现套利和量化交易，
                还有币圈项目背调（包括项目背景，融资情况，投资建议等），链上监控等相关功能，
                根据请求的语言将其交接给合适的智能体。""",
                "handoffs":[chinese_agent, english_agent],
            }

            global_mcp_agent = Agent(
                name=agent_config.get("name"),
                instructions=agent_config.get("instructions"),
                mcp_servers=list(global_servers.values()),
                model_settings=ModelSettings(tool_choice="required"),
                model=deepseek_model,
                handoffs=agent_config.get("handoffs", []),
            )

            print("MCP Agent创建成功，已连接所有服务器")

        return global_mcp_agent
    except Exception as e:
        print(f"初始化MCP服务器时出错: {str(e)}")
        # 尝试清理资源
        if global_servers:
            global_servers.clear()
        if global_mcp_agent:
            global_mcp_agent = None
        # 关闭并重新创建exit_stack
        try:
            if isinstance(global_exit_stack, AsyncExitStack):
                await global_exit_stack.aclose()
        except:
            pass
        global_exit_stack = AsyncExitStack()
        raise


# 在后台初始化MCP服务器
async def background_init():
    try:
        await init_mcp_servers()
        print("MCP服务器后台初始化完成")
    except Exception as e:
        print(f"MCP服务器后台初始化失败: {str(e)}")

# 应用启动时初始化MCP服务器
@app.on_event("startup")
async def startup_event():
    print("应用启动，开始后台初始化MCP服务器...")
    # 在后台初始化，不阻塞应用启动
    asyncio.create_task(background_init())

# 应用关闭时关闭所有服务器
@app.on_event("shutdown")
async def shutdown_event():
    global global_exit_stack, global_servers, global_mcp_agent

    print("应用关闭，清理资源...")
    try:
        # 清理agent引用
        global_mcp_agent = None

        # 清理服务器引用
        if global_servers:
            global_servers.clear()

        # 关闭exit_stack，这将关闭所有服务器连接
        if isinstance(global_exit_stack, AsyncExitStack):
            await global_exit_stack.aclose()
            print("所有MCP服务器已关闭")
    except Exception as e:
        print(f"关闭资源时出错: {str(e)}")
    finally:
        # 重置全局变量
        global_exit_stack = AsyncExitStack()
        global_servers = {}


# 获取或初始化MCP agent
async def get_mcp_agent():
    global global_mcp_agent

    # 如果agent已初始化，直接返回
    if global_mcp_agent is not None:
            return global_mcp_agent


async def stream_response(agent, input_items, chat_id):
    """Generate streaming response from the agent using proper streaming API."""
    try:
        # 使用流式API
        result = Runner.run_streamed(agent, input_items)

        # 初始化序列ID和完整消息
        sequence_id = 0
        full_message = ""

        async for event in result.stream_events():
            # 处理文本增量事件
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                delta = event.data.delta
                if delta:
                    full_message += delta
                    # 使用json库序列化确保JSON格式正确
                    payload = {
                        "delta": delta,
                        "chatId": chat_id,
                        "sequence": sequence_id
                    }
                    yield json.dumps(payload) + "\n"
                    sequence_id += 1

        # 发送完成信号
        payload = {
            "done": True,
            "message": full_message,
            "chatId": chat_id,
            "sequence": sequence_id
        }
        yield json.dumps(payload) + "\n"

    except Exception as e:
        # 记录错误详情
        print(f"流式响应错误: {str(e)}")
        # 发送错误信号
        error_payload = {
            "error": True,
            "message": f"Error: {str(e)}"
        }
        yield json.dumps(error_payload) + "\n"


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest = Body(...)):
    try:
        # 准备Agent的输入
        input_items = [{"content": request.message, "role": "user"}]

        # 获取已初始化的MCP Agent
        mcp_agent = await get_mcp_agent()

        # 检查是否请求流式响应
        if request.stream:
            # 返回流式响应
            return StreamingResponse(
                stream_response(mcp_agent, input_items, request.chatId),
                media_type="application/json"
            )
        else:
            # 非流式响应处理
            result = await Runner.run(mcp_agent, input_items)

            # 提取结果
            markdown_text = (
                result.final_output.data
                if hasattr(result.final_output, "data")
                else str(result.final_output)
            )

            # 返回响应 - 数据库操作由前端处理
            return ChatResponse(message=markdown_text, chatId=request.chatId, success=True)

    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
