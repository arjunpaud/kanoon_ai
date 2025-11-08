from fastapi import FastAPI
from chainlit.utils import mount_chainlit
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth
from .config import settings
from .database import create_db_and_tables

app = FastAPI()

allowed_origins = settings.allowed_origins
if allowed_origins:
    origins = allowed_origins.split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {
        "message": "The Kanoon AI API is functional! All functional routes are under `/api`. To access the chat, go to `/chat`"
    }


app.include_router(auth.router)

mount_chainlit(app=app, target="chainlit_app.py", path="/chat")
