from app.models import Account
from app.config import settings
from app.database import get_session
from app.passutils import verify_password

import io
import wave
from dataclasses import dataclass, field

import asyncio
import numpy as np
import chainlit as cl
from openai import OpenAI
from sqlmodel import Session, select
from chainlit.types import ThreadDict
from qdrant_client import QdrantClient
from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from chainlit.data.sql_alchemy import SQLAlchemyDataLayer
from langchain.agents.middleware import dynamic_prompt, ModelRequest

openai_client = OpenAI(api_key=settings.openai_api_key)
llm = ChatOpenAI(model="gpt-4o", temperature=0, api_key=settings.openai_api_key)

qd_client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
embedding_model = HuggingFaceEmbeddings(model_name="Yunika/sentence-transformer-nepali")


@dataclass
class Context:
    vs_collection_name: str


@dynamic_prompt
def prompt_with_context(request: ModelRequest) -> str:
    """Inject context into state messages."""
    last_query = request.state["messages"][-1].text

    context = getattr(request.runtime, "context", None)
    if context and hasattr(context, "vs_collection_name"):
        vs_collection_name = context.vs_collection_name
    else:
        vs_collection_name = "nepali_law_ai"

    vector_store = QdrantVectorStore(
        client=qd_client,
        collection_name=vs_collection_name,
        embedding=embedding_model,
    )

    retrieved_docs = vector_store.similarity_search(last_query)

    sources = ""
    page_contents = []
    for doc in retrieved_docs:
        page_contents.append(doc.page_content)
        metadata = doc.metadata

        act = metadata.get("act", None)
        section_num = metadata.get("section_num", None)
        section_title = metadata.get("section_title", None)
        subsection_num = metadata.get("subsection_num", None)

        doc_source = ""
        if act:
            doc_source += f"Act: {act}"
        if section_num:
            doc_source += f", Section No. {section_num}"
        if section_title:
            doc_source += f", Section Title: {section_title}"
        if subsection_num:
            doc_source += f", Sub-Section No. {subsection_num}"
        doc_source = doc_source.strip(", ")

        if doc_source != "":
            sources += f"- {doc_source}\n"

    docs_context = "\n\n".join(page_contents)
    system_message = (
        "You are not ChatGPT. You are called Kanoon AI.\n"
        "Use only the following context for your response in Nepali "
        f"without including your own separate knowledge:\n\n{docs_context}"
    )

    if sources != "":
        system_message += f'\n\nAdd these sources at the end of your response under section called "Sources":\n\n{sources}'

    return system_message


SYSTEM_PROMPT = (
    "- You are a legal assistant specialized in Nepali law.\n"
    "- You are not ChatGPT. You are called Kanoon AI.\n"
    "- Answer in Nepali language only and be as accurate as possible.\n"
    "- If you don't know the answer, just say that you don't know, don't try to make up an answer.\n"
    "- प्रयोगकर्ताको प्रश्नलाई कानुनी रूपमा स्पष्ट, विस्तारित र पुनःलेखिएको प्रश्नका रूपमा बुझ्नुहोस्।\n"
    "- कुनै स्पष्टीकरण, उत्तर, वा ऐनको नाम नथप्नुहोस्।\n"
    "- उत्तर कानुनी खण्डहरूको खोजका लागि उपयुक्त हुनुपर्छ।"
)


agent = create_agent(
    model=llm,
    tools=[],
    middleware=[prompt_with_context],
    system_prompt=SYSTEM_PROMPT,
    # response_format=ResponseFormat,
)


def transcribe_audio(audio_chunks: list):
    concatenated = np.concatenate(audio_chunks)

    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, "wb") as wav_file:
        wav_file.setnchannels(1)  # mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(24000)  # sample rate (24kHz PCM)
        wav_file.writeframes(concatenated.tobytes())
    wav_buffer.seek(0)

    audio_buffer = wav_buffer.getvalue()
    whisper_input = ("audio.wav", audio_buffer, "audio/wav")
    transcript = openai_client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=whisper_input,
        language="ne",  # Nepali
        response_format="text",
    )

    return transcript


@cl.set_chat_profiles
async def chat_profile(current_user: cl.User):
    return [
        cl.ChatProfile(
            name="Lawyer",
            markdown_description="This model particularly focuses on **legal precedent** setting cases. Useful for **law professionals**.",
        ),
        cl.ChatProfile(
            name="General",
            markdown_description="This model gives **general answers** in regards to **Nepali Law**.",
        ),
    ]


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
    chat_profile = cl.user_session.get("chat_profile")
    vs_collection_name = (
        "nepali_precedent_rag" if chat_profile == "Lawyer" else "nepali_law_ai"
    )

    msg = cl.Message(
        content="",
    )
    await msg.send()

    state = cl.user_session.get("state")
    state["messages"].append({"role": "user", "content": message.content})

    content = ""
    try:
        async for token, metadata in agent.astream(
            state,
            stream_mode="messages",
            context=Context(vs_collection_name=vs_collection_name),
        ):
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


@cl.on_audio_start
async def on_audio_start():
    cl.user_session.set("audio_chunks", [])
    return True


@cl.on_audio_chunk
async def on_audio_chunk(chunk: cl.InputAudioChunk):
    audio_chunks = cl.user_session.get("audio_chunks")

    if audio_chunks is not None:
        audio_chunk = np.frombuffer(chunk.data, dtype=np.int16)
        audio_chunks.append(audio_chunk)
        cl.user_session.set("audio_chunks", audio_chunks)


@cl.on_audio_end
async def on_audio_end():
    try:
        audio_chunks = cl.user_session.get("audio_chunks")
        if audio_chunks:
            transcript = transcribe_audio(audio_chunks)
            cl.user_session.set("audio_chunks", [])

            msg = cl.Message(
                content="",
            )
            await msg.send()

            state = cl.user_session.get("state")
            state["messages"].append({"role": "user", "content": transcript})

            content = ""
            try:
                async for token, metadata in agent.astream(
                    state, stream_mode="messages"
                ):
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
            # await cl.Message(content=f"Audio understood as: {transcript}").send()
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        await cl.Message(content="Error transcribing audio").send()


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
