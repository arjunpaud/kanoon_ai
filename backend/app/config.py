from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    chainlit_auth_secret: str
    openai_api_key: str
    qdrant_url: str
    qdrant_api_key: str
    database_uri: str
    asyncpg_database_uri: str
    allowed_origins: str | None = None

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
