import os
import hashlib
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def get_resume_hash(resume_text: str):
    return hashlib.md5(resume_text.encode()).hexdigest()


def create_or_load_vector_store(chunks, resume_text):
    resume_hash = get_resume_hash(resume_text)

    persist_dir = os.path.join("vector_cache", resume_hash)

    vectordb = Chroma(
        persist_directory=persist_dir,
        embedding_function=embedding_model
    )
    print("Vector count:", vectordb._collection.count())
    if vectordb._collection.count() == 0:
        print("Creating new embeddings...")
        vectordb.add_texts(chunks)
    else:
        print("Loaded cached embeddings.")

    return vectordb


def retrieve_relevant_chunks(vectordb, query):
    docs = vectordb.similarity_search(query, k=4)
    return "\n\n".join([doc.page_content for doc in docs])