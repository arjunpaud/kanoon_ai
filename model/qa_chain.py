from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

def build_qa_chain(qdrant_index):
    custom_prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
    You are a legal assistant specialized in Nepali law. Use the following context to answer the question.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    Context:
    {context}

    Question:
    {question}

    Answer in Nepali and be as accurate and concise as possible.
    Provide the answer strictly in a single line without any extra line breaks.
    Cite the sources in details format: act_name, section no., sub_section no and clauses

    """

    )

    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=qdrant_index.as_retriever(search_kwargs={"k": 3}),
        chain_type="stuff",
        chain_type_kwargs={"prompt": custom_prompt},
        return_source_documents=True
    )
    return qa_chain
