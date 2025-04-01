from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import os
from dotenv import load_dotenv
from agents import OpenAIChatCompletionsModel, Agent, Runner, set_default_openai_client
from openai import AsyncOpenAI

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


class ChatResponse(BaseModel):
    message: str
    chatId: Optional[str] = None
    success: bool = True


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest = Body(...)):
    try:
        # Prepare input for Runner
        input_items = [{"content": request.message, "role": "user"}]

        # Run the triage agent
        result = await Runner.run(triage_agent, input_items)

        # Extract the result
        markdown_text = (
            result.final_output.data
            if hasattr(result.final_output, "data")
            else str(result.final_output)
        )

        # Return the response - database operations will be handled by the frontend
        return ChatResponse(message=markdown_text, chatId=request.chatId, success=True)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
