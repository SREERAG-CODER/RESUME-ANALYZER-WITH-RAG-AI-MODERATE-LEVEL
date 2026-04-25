# AI Resume Analyzer

An intelligent full-stack Resume Analyzer that evaluates resumes against job descriptions using Retrieval-Augmented Generation (RAG), vector embeddings, and Large Language Models.

<img width="1504" height="1426" alt="image" src="https://github.com/user-attachments/assets/221c6c9c-3fd4-4267-b40c-dbeaf2a06f27" />


## Features

* Upload PDF resumes for analysis
* Compare resume against any job description
* Retrieve semantically relevant resume sections using vector search
* Generate ATS-style feedback and improvement suggestions
* Embedding cache for repeated resume analysis optimization
* Modern responsive frontend UI

## Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS

### Backend

* FastAPI
* Python

### AI / ML

* LangChain
* ChromaDB
* HuggingFace Embeddings
* Ollama (Llama 3.2)

## Architecture

1. User uploads resume PDF and job description
2. Backend extracts text from PDF
3. Resume text is chunked into semantic segments
4. Chunks are converted into vector embeddings
5. Embeddings are cached using content hashing
6. Relevant chunks are retrieved via similarity search
7. LLM analyzes retrieved context against job description
8. Feedback is returned to frontend

## Performance Optimization

Implemented embedding caching to avoid redundant vector generation when the same resume is analyzed multiple times.

## Project Structure

```bash
resume-analyzer/
│
├── backend/
│   ├── main.py
│   ├── rag_pipeline.py
│   ├── llm.py
│   ├── prompts.py
│   ├── requirements.txt
│   └── utils/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── package.json
│
└── README.md
```

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Future Improvements

* Deterministic ATS scoring algorithm
* User authentication and saved resumes
* Cloud deployment
* Multi-format resume support
* Historical analysis dashboard

## Author

Built by SREERAG T C
