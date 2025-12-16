"""
Configuration module for RAG Chatbot backend.
Loads environment variables from .env file and validates required settings.
"""

import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


class ConfigurationError(Exception):
    """Raised when required configuration is missing or invalid."""
    pass


class Config:
    """
    Application configuration loaded from environment variables.

    Required environment variables:
    - LLM_PROVIDER: LLM provider selection (gemini or chatkit)
    - GEMINI_API_KEY: Gemini API key (if LLM_PROVIDER=gemini)
    - QDRANT_URL: Qdrant cluster URL
    - QDRANT_API_KEY: Qdrant API key
    - NEON_CONNECTION_STRING: Neon Postgres connection string
    - BACKEND_PORT: Backend server port (default: 8000)
    - CORS_ORIGINS: Comma-separated list of allowed CORS origins
    """

    def __init__(self):
        """Load and validate configuration from environment variables."""
        # Load .env file from backend directory
        env_path = Path(__file__).parent.parent / ".env"
        load_dotenv(dotenv_path=env_path)

        # Load required configuration
        self.llm_provider = self._get_required("LLM_PROVIDER")
        self.gemini_api_key = self._get_optional("GEMINI_API_KEY")
        self.chatkit_api_key = self._get_optional("CHATKIT_API_KEY")
        self.qdrant_url = self._get_required("QDRANT_URL")
        self.qdrant_api_key = self._get_required("QDRANT_API_KEY")
        self.neon_connection_string = self._get_required("NEON_CONNECTION_STRING")

        # Load optional configuration with defaults
        self.backend_port = int(self._get_optional("BACKEND_PORT", "8000"))
        cors_origins_str = self._get_optional(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:8000"
        )
        self.cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

        # Logging configuration
        self.log_level = self._get_optional("LOG_LEVEL", "INFO")

        # RAG configuration
        self.chunk_size = int(self._get_optional("CHUNK_SIZE", "512"))
        self.chunk_overlap = int(self._get_optional("CHUNK_OVERLAP", "128"))
        self.top_k_results = int(self._get_optional("TOP_K_RESULTS", "5"))
        self.similarity_threshold = float(self._get_optional("SIMILARITY_THRESHOLD", "0.7"))

        # Validate provider-specific keys
        self._validate_provider_keys()

    def _get_required(self, key: str) -> str:
        """Get required environment variable or raise ConfigurationError."""
        value = os.getenv(key)
        if not value:
            raise ConfigurationError(
                f"Required environment variable '{key}' is not set. "
                f"Please create a .env file based on .env.example"
            )
        return value

    def _get_optional(self, key: str, default: str = "") -> str:
        """Get optional environment variable with default value."""
        return os.getenv(key, default)

    def _validate_provider_keys(self):
        """Validate that required API keys are present for selected LLM provider."""
        if self.llm_provider.lower() == "gemini":
            if not self.gemini_api_key:
                raise ConfigurationError(
                    "GEMINI_API_KEY is required when LLM_PROVIDER=gemini"
                )
        elif self.llm_provider.lower() == "chatkit":
            if not self.chatkit_api_key:
                raise ConfigurationError(
                    "CHATKIT_API_KEY is required when LLM_PROVIDER=chatkit"
                )
        else:
            raise ConfigurationError(
                f"Invalid LLM_PROVIDER '{self.llm_provider}'. "
                f"Must be 'gemini' or 'chatkit'"
            )


# Global configuration instance
# Will raise ConfigurationError on import if required variables are missing
config = Config()
