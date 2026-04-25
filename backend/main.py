from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from utils.pdf_parser import extract_text_from_pdf
from utils.chunker import chunk_text
from rag_pipeline import (
    create_or_load_vector_store,
    retrieve_relevant_chunks
)
from prompts import ANALYSIS_PROMPT
from llm import query_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_desc: str = Form(...)
):
    print("Analyze endpoint hit")
    resume_text = extract_text_from_pdf(resume.file)

    chunks = chunk_text(resume_text)

    vectordb = create_or_load_vector_store(
    chunks,
    resume_text
)

    relevant_context = retrieve_relevant_chunks(vectordb, job_desc)

    prompt = ANALYSIS_PROMPT.format(
        resume_context=relevant_context,
        job_desc=job_desc
    )

    result = query_llm(prompt)

    return {"analysis": result}