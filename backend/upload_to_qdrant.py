#!/usr/bin/env python3
"""Quick script to upload already-generated embeddings to Qdrant."""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.services import QdrantService, LLMService
from src.models import ChunkEmbedding

# Load chunks with embeddings
with open('data/ingested_chunks.json', 'r') as f:
    data = json.load(f)
    chunks = data.get('chunks', [])

print(f"Loaded {len(chunks)} chunks")

# Initialize services
qdrant = QdrantService()
qdrant.connect()
llm = LLMService()

# Generate embeddings and upload in batches
chunk_embeddings = []
batch_size = 10

for i, chunk in enumerate(chunks):
    print(f"Processing {i+1}/{len(chunks)}: {chunk['id']}")
    
    # Generate embedding
    embedding = llm.generate_embedding(chunk['chunk_text'])
    
    # Create ChunkEmbedding
    chunk_emb = ChunkEmbedding(
        id=chunk['id'],
        chapter_id=chunk['chapter_id'],
        chapter_number=chunk['chapter_number'],
        chunk_text=chunk['chunk_text'],
        embedding=embedding,
        position=chunk['position'],
        token_count=chunk['token_count'],
    )
    chunk_embeddings.append(chunk_emb)
    
    # Upload in batches
    if len(chunk_embeddings) >= batch_size:
        print(f"Uploading batch to Qdrant...")
        qdrant.upsert_chunks(chunk_embeddings)
        chunk_embeddings = []

# Upload remaining
if chunk_embeddings:
    print(f"Uploading final batch to Qdrant...")
    qdrant.upsert_chunks(chunk_embeddings)

print(f"✓ Successfully uploaded all {len(chunks)} chunks to Qdrant!")
