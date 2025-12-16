#!/usr/bin/env python3
"""
Ingestion CLI tool for RAG Chatbot.
Scans docs/ directory, parses markdown files, extracts frontmatter,
and chunks content for embedding generation.
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

import nltk
import tiktoken
from nltk.tokenize import sent_tokenize

# Download NLTK data if needed
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from backend.src.config import config
from backend.src.models import Chapter


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class BookIngester:
    """
    Ingest book content from markdown files and chunk for RAG.
    """

    def __init__(
        self,
        docs_dir: Path,
        chunk_size: int = 512,
        chunk_overlap: int = 128,
    ):
        """
        Initialize book ingester.

        Args:
            docs_dir: Path to docs/ directory containing markdown files
            chunk_size: Target token count per chunk
            chunk_overlap: Number of overlapping tokens between chunks
        """
        self.docs_dir = docs_dir
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.tokenizer = tiktoken.get_encoding("cl100k_base")  # GPT-4 tokenizer

    def extract_frontmatter(self, content: str) -> Dict[str, Any]:
        """
        Extract YAML frontmatter from markdown content.

        Args:
            content: Full markdown file content

        Returns:
            Dictionary of frontmatter fields
        """
        frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n'
        match = re.match(frontmatter_pattern, content, re.DOTALL)

        if not match:
            return {}

        frontmatter_text = match.group(1)
        frontmatter = {}

        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()

                # Parse chapter number
                if key == 'chapter':
                    try:
                        frontmatter['chapter_number'] = int(value)
                    except ValueError:
                        logger.warning(f"Invalid chapter number: {value}")

                # Parse title
                elif key == 'title':
                    frontmatter['title'] = value.strip('"\'')

                # Store all other fields
                else:
                    frontmatter[key] = value.strip('"\'')

        return frontmatter

    def remove_frontmatter(self, content: str) -> str:
        """
        Remove YAML frontmatter from markdown content.

        Args:
            content: Full markdown file content

        Returns:
            Content without frontmatter
        """
        frontmatter_pattern = r'^---\s*\n.*?\n---\s*\n'
        return re.sub(frontmatter_pattern, '', content, flags=re.DOTALL)

    def count_tokens(self, text: str) -> int:
        """
        Count tokens in text using tiktoken.

        Args:
            text: Text to tokenize

        Returns:
            Number of tokens
        """
        return len(self.tokenizer.encode(text))

    def chunk_text(
        self,
        text: str,
        chapter_id: str,
        chapter_number: int,
    ) -> List[Dict[str, Any]]:
        """
        Chunk text into overlapping segments at sentence boundaries.

        Args:
            text: Text to chunk
            chapter_id: Chapter identifier
            chapter_number: Chapter number

        Returns:
            List of chunk dictionaries with metadata
        """
        # Split into sentences
        sentences = sent_tokenize(text)

        chunks = []
        current_chunk = []
        current_token_count = 0
        position = 0

        for sentence in sentences:
            sentence_tokens = self.count_tokens(sentence)

            # If adding this sentence would exceed chunk_size, save current chunk
            if current_token_count + sentence_tokens > self.chunk_size and current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append({
                    'id': f"{chapter_id}-chunk-{position:03d}",
                    'chapter_id': chapter_id,
                    'chapter_number': chapter_number,
                    'chunk_text': chunk_text,
                    'position': position,
                    'token_count': current_token_count,
                })

                # Start new chunk with overlap
                # Keep last few sentences for overlap
                overlap_tokens = 0
                overlap_sentences = []

                for sent in reversed(current_chunk):
                    sent_tokens = self.count_tokens(sent)
                    if overlap_tokens + sent_tokens <= self.chunk_overlap:
                        overlap_sentences.insert(0, sent)
                        overlap_tokens += sent_tokens
                    else:
                        break

                current_chunk = overlap_sentences
                current_token_count = overlap_tokens
                position += 1

            # Add sentence to current chunk
            current_chunk.append(sentence)
            current_token_count += sentence_tokens

        # Save final chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            chunks.append({
                'id': f"{chapter_id}-chunk-{position:03d}",
                'chapter_id': chapter_id,
                'chapter_number': chapter_number,
                'chunk_text': chunk_text,
                'position': position,
                'token_count': current_token_count,
            })

        return chunks

    def ingest_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """
        Ingest a single markdown file.

        Args:
            file_path: Path to markdown file

        Returns:
            Dictionary with chapter and chunks data
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract frontmatter
            frontmatter = self.extract_frontmatter(content)

            if 'chapter_number' not in frontmatter or 'title' not in frontmatter:
                logger.warning(f"Skipping {file_path.name}: missing chapter number or title in frontmatter")
                return None

            # Remove frontmatter from content
            body_content = self.remove_frontmatter(content)

            # Create chapter object
            chapter_id = f"chapter-{frontmatter['chapter_number']:02d}"
            chapter_url = f"/docs/{file_path.stem}"

            word_count = len(body_content.split())

            chapter = Chapter(
                id=chapter_id,
                number=frontmatter['chapter_number'],
                title=frontmatter['title'],
                content=body_content,
                url=chapter_url,
                word_count=word_count,
                metadata=frontmatter,
            )

            # Chunk content
            chunks = self.chunk_text(
                body_content,
                chapter_id,
                frontmatter['chapter_number'],
            )

            logger.info(
                f"Ingested {file_path.name}: "
                f"Chapter {chapter.number} ({chapter.word_count} words, {len(chunks)} chunks)"
            )

            return {
                'chapter': chapter.dict(),
                'chunks': chunks,
            }

        except Exception as e:
            logger.error(f"Failed to ingest {file_path.name}: {e}")
            return None

    def ingest_directory(self) -> Dict[str, Any]:
        """
        Ingest all markdown files from docs directory.

        Returns:
            Dictionary with chapters and chunks lists
        """
        if not self.docs_dir.exists():
            logger.error(f"Docs directory not found: {self.docs_dir}")
            return {'chapters': [], 'chunks': []}

        # Find both .md and .mdx files
        md_files = list(self.docs_dir.glob('**/*.md'))
        mdx_files = list(self.docs_dir.glob('**/*.mdx'))
        markdown_files = sorted(md_files + mdx_files)

        if not markdown_files:
            logger.warning(f"No markdown files found in {self.docs_dir}")
            return {'chapters': [], 'chunks': []}

        logger.info(f"Found {len(markdown_files)} markdown files")

        all_chapters = []
        all_chunks = []

        for file_path in markdown_files:
            result = self.ingest_file(file_path)

            if result:
                all_chapters.append(result['chapter'])
                all_chunks.extend(result['chunks'])

        logger.info(
            f"Ingestion complete: {len(all_chapters)} chapters, {len(all_chunks)} total chunks"
        )

        return {
            'chapters': all_chapters,
            'chunks': all_chunks,
        }


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Ingest book content from markdown files and chunk for RAG"
    )
    parser.add_argument(
        '--docs-dir',
        type=Path,
        default=Path('docs'),
        help='Path to docs directory (default: docs/)',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=Path('backend/data/ingested_chunks.json'),
        help='Output JSON file path (default: backend/data/ingested_chunks.json)',
    )
    parser.add_argument(
        '--chunk-size',
        type=int,
        default=config.chunk_size,
        help=f'Target token count per chunk (default: {config.chunk_size})',
    )
    parser.add_argument(
        '--chunk-overlap',
        type=int,
        default=config.chunk_overlap,
        help=f'Overlapping tokens between chunks (default: {config.chunk_overlap})',
    )
    parser.add_argument(
        '--full-rebuild',
        action='store_true',
        help='Force full rebuild (ignore existing data)',
    )

    args = parser.parse_args()

    # Create output directory if needed
    args.output.parent.mkdir(parents=True, exist_ok=True)

    # Initialize ingester
    ingester = BookIngester(
        docs_dir=args.docs_dir,
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
    )

    # Ingest content
    result = ingester.ingest_directory()

    # Save to JSON
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    logger.info(f"Saved ingested data to: {args.output}")

    # Print summary
    print("\n" + "="*50)
    print("Ingestion Summary")
    print("="*50)
    print(f"Chapters ingested: {len(result['chapters'])}")
    print(f"Total chunks: {len(result['chunks'])}")
    print(f"Output file: {args.output}")
    print("="*50)

    return 0


if __name__ == '__main__':
    sys.exit(main())
