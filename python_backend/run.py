from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel, Agent, Runner, set_default_openai_client
from agents.model_settings import ModelSettings
import os
from dotenv import load_dotenv
from IPython.display import display, Code, Markdown, Image

load_dotenv()

external_client = AsyncOpenAI(
    base_url=os.getenv("DEEPSEEK_API_BASE"),
    api_key=os.getenv("DEEPSEEK_API_KEY"),
)

set_default_openai_client(external_client)

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


async def chat(Agent):
    input_items = []
    while True:
        user_input = input("💬 请输入你的消息（输入quit退出）：")
        if user_input.lower() in ["exit", "quit"]:
            print("✅ 对话已结束")
            break

        input_items.append({"content": user_input, "role": "user"})
        result = await Runner.run(Agent, input_items)

        # display(Markdown(result.final_output))
        # 提取 Markdown 对象中的文本内容并打印
        markdown_text = result.final_output.data if hasattr(result.final_output, 'data') else str(result.final_output)
        print(markdown_text)


        input_items = result.to_input_list()


async def main():
    await chat(triage_agent)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
