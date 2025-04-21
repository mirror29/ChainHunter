import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from openai.types.beta.threads import Run
from agents import OpenAIChatCompletionsModel, Agent, Runner, set_default_openai_client, ModelSettings
from agents.mcp import MCPServer, MCPServerStdio
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

async def main():
    await mcp_run_multi(
    servers_params=[
        # {"name": "cryptoc-prices", "command": "python", "args": ["./mcp/CryptocPrices/main.py"]},
        {"name": "cryptoc-prices", "command": "python", "args": ["./mcp/CryptocPrices/run.py"]},
        # {"name": "coincap-mcp","command":"npx", "args": ["coincap-mcp"]},
        # {"name": "coincap-mcp","command":"./mcp/coincap-mcp/build/index.js", "args": [""]},
        # {"name": "webresearch","command":"npx", "args": ["-y", "@mzxrai/mcp-webresearch@latest"]},
    ],
    message="比特币的走势图如何，应该买入还是卖出"
    )

async def mcp_run_multi(servers_params, message):
    # 使用 AsyncExitStack 自动管理多个上下文退出
    async with AsyncExitStack() as stack:
        servers = []
        # 创建并进入所有 server 上下文
        for p in servers_params:
            server = MCPServerStdio(
                name=p.get("name", "Unnamed Server"),
                cache_tools_list=True,
                params={
                    "command": p["command"],
                    "args": p["args"],
                },
            )
            entered_server = await stack.enter_async_context(server)
            servers.append(entered_server)
            print(f"Server {p['name']} started")

        # 循环结束后创建agent，传入所有servers
        agent = Agent(
            name="加密货币助手",
            instructions="你是一个加密货币信息助手，使用工具来获取加密货币的价格和其他信息。",
            mcp_servers=servers,
            model_settings=ModelSettings(tool_choice="required"),
            model=deepseek_model
        )

        try:
            print(f"Running: {message}")
            result = await Runner.run(starting_agent=agent, input=message)
            print(result.final_output)
            return result
        except Exception as e:
            print(f"Error running agent: {e}")
            return None

if __name__ == "__main__":
    asyncio.run(main())
