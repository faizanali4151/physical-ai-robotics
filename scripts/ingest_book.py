import os
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams

# LangChain import
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import VertexAIEmbeddings  # Gemini embeddings

# --- Config ---
QDRANT_URL = os.getenv(
    "QDRANT_URL",
    "https://c793b077-b46d-4f37-b38b-a572f2362704.us-east-1-1.aws.cloud.qdrant.io"
)
QDRANT_API_KEY = os.getenv(
    "QDRANT_API_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.rX6vEg6XOSDtUuK9iXi3AKsP4JweBtgGHG_MNwgWVwU"
)
COLLECTION_NAME = "physical_ai_book_chunks"
BOOK_DIR = Path(__file__).parent.parent / "book/chapters"

# --- Connect to Qdrant ---
client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

# --- Create collection if not exists ---
if not client.collection_exists(collection_name=COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors=VectorParams(size=1536, distance="Cosine")
    )
    print(f"✅ Collection '{COLLECTION_NAME}' created.")
else:
    print(f"ℹ️ Collection '{COLLECTION_NAME}' already exists.")

# --- Read all chapters ---
all_texts = []
for md_file in BOOK_DIR.glob("*.md"):
    with open(md_file, "r", encoding="utf-8") as f:
        all_texts.append(f.read())

# --- Split into chunks ---
splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_text(" ".join(all_texts))
print(f"ℹ️ Total chunks to insert: {len(chunks)}")

# --- Generate embeddings using Gemini ---
embeddings = VertexAIEmbeddings(model_name="textembedding-gecko-001")  # Gemini embeddings
points = [
    PointStruct(id=i, vector=embeddings.embed(chunk), payload={"text": chunk})
    for i, chunk in enumerate(chunks)
]

# --- Upload to Qdrant ---
client.upsert(collection_name=COLLECTION_NAME, points=points)
print(f"✅ Book ingestion complete! {len(points)} chunks inserted into {COLLECTION_NAME}.")
