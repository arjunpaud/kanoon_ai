import json
from langchain_core.documents import Document

def load_documents(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        act = json.load(f)

    act_title = "घरेलु हिंसा ऐन, २०६६"
    docs = []

    for sec in act["sections"]:
        section_num   = sec["section_num"]
        section_title = sec["title"].strip()
        section_text  = (sec.get("section_text") or "").strip("–-:। \n")

        # ✅ Definitions
        if section_title.startswith("परिभाषा"):
            for d in sec.get("definitions", []):
                term = d["term"].strip()
                definition = d["definition"].strip()
                page_content = f"{term} भनेको {definition}"
                docs.append(Document(
                    page_content=page_content,
                    metadata={"act": act_title, "section_num": section_num,
                              "section_title": section_title, "level": "definition",
                              "term": term}
                ))
            continue

        # ✅ Subsections + Clauses
        for ss in sec.get("subsections", []):
            subsection_text = (ss.get("text") or "").strip()
            clause_list = ss.get("clauses", [])

            if clause_list:
                for cl in clause_list:
                    clause_text = cl.get("text")
                    clause_id = cl.get("clause_id")
                    if clause_text:
                        parts = [section_title]
                        if section_text: parts.append(section_text)
                        if subsection_text: parts.append(subsection_text)
                        parts.append(clause_text.strip())
                        page_content = " ".join(parts).strip()

                        docs.append(Document(
                            page_content=page_content,
                            metadata={"act": act_title, "section_num": section_num,
                                      "section_title": section_title,
                                      "subsection_num": ss.get("subsection_num"),
                                      "clause_id": clause_id, "level": "clause"}
                        ))
            elif subsection_text:
                docs.append(Document(
                    page_content="\n".join([section_title, section_text, subsection_text]).strip(),
                    metadata={"act": act_title, "section_num": section_num,
                              "section_title": section_title,
                              "subsection_num": ss.get("subsection_num"),
                              "level": "subsection_text"}
                ))

        if not sec.get("subsections") and section_text:
            docs.append(Document(
                page_content=f"{section_title} {section_text}",
                metadata={"act": act_title, "section_num": section_num,
                          "section_title": section_title, "level": "section_text"}
            ))

    return docs
