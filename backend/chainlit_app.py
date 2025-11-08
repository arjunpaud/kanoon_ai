from app.models import Account
from app.config import settings
from app.database import get_session
from app.passutils import verify_password

from dataclasses import dataclass, field

import asyncio
import chainlit as cl
from sqlmodel import Session, select
from chainlit.types import ThreadDict
from qdrant_client import QdrantClient
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from chainlit.data.sql_alchemy import SQLAlchemyDataLayer
from langchain.agents.middleware import dynamic_prompt, ModelRequest


llm = ChatOpenAI(model="gpt-4o", temperature=0, api_key=settings.openai_api_key)

embedding_model = HuggingFaceEmbeddings(model_name="Yunika/sentence-transformer-nepali")
client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
vector_store = QdrantVectorStore(
    client=client,
    collection_name="nepali_law_ai",
    embedding=embedding_model,
)


@dynamic_prompt
def prompt_with_context(request: ModelRequest) -> str:
    """Inject context into state messages."""
    last_query = request.state["messages"][-1].text
    retrieved_docs = vector_store.similarity_search(last_query)
    docs_content = "\n\n".join(doc.page_content for doc in retrieved_docs)
    system_message = f"Use the following context for your response:\n\n{docs_content}"
    return system_message


SYSTEM_PROMPT = (
    "- You are a legal assistant specialized in Nepali law.\n"
    "- Answer in Nepali and be as accurate as possible.\n"
    "- If you don't know the answer, just say that you don't know, don't try to make up an answer.\n"
    "- प्रयोगकर्ताको प्रश्नलाई कानुनी रूपमा स्पष्ट, विस्तारित र पुनःलेखिएको प्रश्नका रूपमा बुझ्नुहोस्।\n"
    "- कुनै स्पष्टीकरण, उत्तर, वा ऐनको नाम नथप्नुहोस्।\n"
    "- उत्तर कानुनी खण्डहरूको खोजका लागि उपयुक्त हुनुपर्छ।"
)


@dataclass
class ResponseFormat:
    """Response schema for the agent."""

    # An answer/response (always required)
    response: str
    # Act name if available
    act_name: str | None = None
    # Section number if available
    section_number: str | None = None
    # Sub-section number if available
    sub_section_number: str | None = None
    # List of clauses if available
    clauses: list[str] = field(default_factory=lambda: [])


agent = create_agent(
    model=llm,
    tools=[],
    middleware=[prompt_with_context],
    system_prompt=SYSTEM_PROMPT,
    # response_format=ResponseFormat,
)


@cl.password_auth_callback
def auth_callback(email: str, password: str):
    gen = get_session()
    session: Session = next(gen)
    try:
        existing_account: Account = session.exec(
            select(Account).where(Account.email == email)
        ).first()
    finally:
        gen.close()
    if not existing_account:
        return None
    if not verify_password(password, existing_account.password):
        return None
    return cl.User(
        identifier=email, metadata={"role": "user", "provider": "credentials"}
    )


@cl.on_chat_start
def on_chat_start():
    cl.user_session.set("state", {"messages": []})


@cl.on_message
async def main(message: cl.Message):
    msg = cl.Message(
        content="",
    )
    await msg.send()

    state = cl.user_session.get("state")
    state["messages"].append({"role": "user", "content": message.content})

    content = ""
    try:
        async for token, metadata in agent.astream(state, stream_mode="messages"):
            if len(token.content_blocks) > 0:
                item = token.content_blocks[-1]
                await msg.stream_token(item["text"])
                content += item["text"]
    except asyncio.CancelledError:
        pass

    await msg.update()

    state["messages"].append({"role": "assistant", "content": content})
    new_state = await agent.ainvoke(state)
    cl.user_session.set("state", new_state)

    # structured_response = new_state["structured_response"]


@cl.on_stop
def on_stop():
    pass


@cl.on_chat_end
def on_chat_end():
    pass


@cl.data_layer
def get_data_layer():
    try:
        return SQLAlchemyDataLayer(conninfo=settings.asyncpg_database_uri)
    except Exception as e:
        print("Error connecting to Chainlit data layer:")
        print(e)


@cl.on_chat_resume
async def on_chat_resume(thread: ThreadDict):
    try:
        messages = []
        steps = thread.get("steps", [])
        for step in steps:
            step_type = step.get("type")
            content = (step.get("output") or "").strip()
            if not content:
                continue
            if step_type == "user_message":
                messages.append({"role": "user", "content": content})
            elif step_type == "assistant_message":
                messages.append({"role": "assistant", "content": content})
        cl.user_session.set("state", {"messages": messages})
    except Exception as e:
        print("Error resuming Chainlit chat:")
        print(e)
