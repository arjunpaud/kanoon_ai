import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI

# Import your RAG + Precedent modules
from acts.vectorstore import access_vectorstore as avs_act
from precedent.vectorstore import access_vectorstore as avs_precedent
from constitution.vectorstore import access_vectorstore as avs_constitution
from ordinaces.vectorstore import access_vectorstore as avs_ordinaces
from orders.vectorstore import access_vectorstore as avs_orders
from regulations.vectorstore import access_vectorstore as avs_regulations
from composite.vectorstore import access_vectorstore as avs_all

from qa_chain import build_qa_chain

# -------------------
# Load environment variables
# -------------------
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# -------------------
# FastAPI App
# -------------------
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust to frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Preload vectorstores + qa_chains (once at startup)
# -------------------
# Initialize vectorstores
qdrant_rag = avs_act()
qdrant_precedent = avs_precedent()
qdrant_constitution = avs_constitution()
qdrant_ordinaces = avs_ordinaces()
qdrant_orders = avs_orders()
qdrant_regulations = avs_regulations()
qdrant_all = avs_all()

# Build QA chains
qa_chain_rag = build_qa_chain(qdrant_rag)
qa_chain_precedent = build_qa_chain(qdrant_precedent)
qa_chain_constitution = build_qa_chain(qdrant_constitution)
qa_chain_ordinances = build_qa_chain(qdrant_ordinaces)
qa_chain_orders = build_qa_chain(qdrant_orders)
qa_chain_regulations = build_qa_chain(qdrant_regulations)
qa_chain_all = build_qa_chain(qdrant_all)


# -------------------
# Request Body Schema
# -------------------
class Query(BaseModel):
    model: str  # "rag" or "precedent"
    message: str  # <-- changed from "query" to "message"


# -------------------
# Routes
# -------------------
@app.post("/ask")
def ask(query: Query):
    """
    Accepts a message and model type ("rag" or "precedent"),
    runs it through the appropriate QA chain, and returns the result.
    """
    try:
        if query.model == "act":
            # result = qa_chain_rag.invoke({"query": query.message})

            expansion_prompt = PromptTemplate(
                input_variables=["query"],
                template="""
            तपाईंको काम तल दिइएको प्रयोगकर्ताको प्रश्नलाई कानुनी रूपमा स्पष्ट, विस्तारित र पुनःलेखिएको एकल प्रश्नमा रूपान्तरण गर्नु हो।

            तपाईंले निम्न निर्देशन पालना गर्नुपर्छ:
            - केवल प्रश्न पुनःलेखन गर्नुहोस् — कुनै स्पष्टीकरण, उत्तर, वा ऐनको नाम नथप्नुहोस्
            - प्रश्न कानुनी खण्डहरूको खोजका लागि उपयुक्त हुनुपर्छ
            - पुनःलेखिएको प्रश्न केवल एक लाइनको, संक्षिप्त, र कानुनी रूपले सटीक हुनुपर्छ

            प्रश्न: {query}
            पुनःलेखिएको प्रश्न:""",
            )

            llm = ChatOpenAI(
                model="gpt-4o", temperature=0  # You can also use "gpt-3.5-turbo"
            )

            # Step 2: Create the LLMChain for expansion
            query_expander = LLMChain(prompt=expansion_prompt, llm=llm)

            # query = "Attempt to murder (हत्या प्रयास) को सजाय कस्तो हुन्छ?”"
            query = query_expander.invoke({"query": query.message})["text"]
            result = qa_chain_all.invoke({"query": query})
        # elif query.model == "all":
        #     result = qa_chain_all.invoke({"query": query.message})
        elif query.model == "precedent":
            result = qa_chain_precedent.invoke({"query": query.message})
        elif query.model == "constitution":
            result = qa_chain_constitution.invoke({"query": query.message})
        elif query.model == "ordinances":
            result = qa_chain_ordinances.invoke({"query": query.message})
        elif query.model == "orders":
            result = qa_chain_orders.invoke({"query": query.message})
        elif query.model == "regulations":
            result = qa_chain_regulations.invoke({"query": query.message})
        else:
            return {
                "error": f"Invalid model '{query.model}', use 'rag' or 'precedent'."
            }

        return {"result": result["result"]}

    except Exception as e:
        return {"error": str(e)}
