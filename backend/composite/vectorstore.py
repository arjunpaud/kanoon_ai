import os

from dotenv import load_dotenv
from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()


def access_vectorstore():
    # Embedding model (Nepali sentence transformer)
    embedding_model = HuggingFaceEmbeddings(
        model_name="Yunika/sentence-transformer-nepali"
    )

    # Connect to Qdrant Cloud (replace with your own URL + key)
    # qdrant_index = Qdrant.from_documents(
    #     documents=docs,
    #     embedding=embedding_model,
    #     url="",
    #     api_key="",
    #     collection_name="nepali_law_rag"
    # )
    # 1. Create Qdrant client
    client = QdrantClient(
        url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY")
    )

    # 2. Load existing collection
    vector_store = QdrantVectorStore(
        client=client,
        collection_name="nepali_law_ai",
        embedding=embedding_model,  # ✅ here it's `embedding`, not `embedding_function`
    )

    return vector_store
