from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

def build_qa_chain(qdrant_index):
    custom_prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""
    You are a legal assistant specialized in Nepali law. Use the following context to answer the question.
    If you don't know the answer, just say that you don't know; do not make up an answer.

    Context:
    {context}

    Question:
    {question}

    Answer in Nepali and be as accurate and concise as possible.

    Format the answer in HTML as follows:

    - **Title**: If there is a relevant section title from the context, bold it using <b>.
    - **Explanation**: Use <ul> and <li> for bullet points if multiple points.
    - **Source**: Provide the citation as clickable link or formatted text, in the format: act_name, section no., sub_section no., clauses.

    Example output:

    <b>बालबालिकालाई काममा लगाउन नहुने:</b>
    <ul>
    <li>कसैले पनि बालबालिकालाई कानून विपरीत हुने गरी कुनै काममा लगाउनु हुँदैन।</li>
    <li>स्रोत: श्रम ऐन, २०७४, दफा ५</li>
    </ul>
    <a href="link_to_act_or_source">Source: श्रम ऐन, २०७४</a>

    Provide your answer strictly in a single HTML block without extra text outside the structure.
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
