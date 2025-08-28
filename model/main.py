import os
import sys
import json
from dotenv import load_dotenv
from pathlib import Path
from rag.vectorstore import access_vectorstore as avs_rag
from precedent.vectorstore import access_vectorstore as avs_precedent
from rag.qa_chain import build_qa_chain

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

# Set OpenAI API key
os.environ["OPENAI_API_KEY"] = api_key

# Decide which vectorstore to use
# qdrant_index = avs_rag()  # default

if len(sys.argv) > 0:
    if sys.argv[1] == "precedent":
        qdrant_index = avs_precedent()
else:
    qdrant_index = avs_rag()

# Build QA chain
qa_chain = build_qa_chain(qdrant_index)

# Check if a question/query is passed as an argument
if len(sys.argv) > 1:
    query = sys.argv[2]
    result = qa_chain.invoke({"query": query})
    print(result['result'])

# If no query passed, enter interactive mode
# print("Nepali Legal RAG Assistant Ready. Ask your questions (type 'exit' to quit).")
# while True:
#     query = input("\nQuestion: ")
#     if query.lower() in ["exit", "quit"]:
#         print("Exiting...")
#         break
#     result = qa_chain.invoke({"query": query})
#     print("Answer:", result['result'])
