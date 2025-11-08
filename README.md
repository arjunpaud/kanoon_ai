# Kanoon AI

Requires `Python >=3.9,<3.14` to run. `Python 3.13` is preferred.

Install the required dependencies:

```
cd backend
pip install -r requirements.txt
```

Configure environment variables in `backend/.env`:

```.env
# Use ($ chainlit create-secret) for creation of CHAINLIT_AUTH_SECRET
CHAINLIT_AUTH_SECRET=''
OPENAI_API_KEY=''
QDRANT_URL=''
QDRANT_API_KEY=''
DATABASE_URI=''
ASYNCPG_DATABASE_URI=''
ALLOWED_ORIGINS=''
```

Run the production server:

```
fastapi run app/main.py
```
