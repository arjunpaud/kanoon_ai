import json
from langchain_core.documents import Document

def load_documents(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        decisions = json.load(f)  # list of court decisions
        docs = []

    for dec in decisions:
        title   = (dec.get("title") or "").strip()
        summary = (dec.get("summary") or "").strip()
        views   = (dec.get("views") or "").strip()

        page_content = f"शीर्षक: {title}\nसारांश: {summary}"

        docs.append(Document(
            page_content=page_content,
            metadata={
                "date": dec.get("decision_date"),
                "bench": dec.get("bench_type"),
                "views": views,
                "link": dec.get("link"),
                "title": title
            }
        ))
