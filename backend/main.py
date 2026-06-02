from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class CodeRequest(BaseModel):
    code: str
    code_verifier: str


@app.get("/")
def home():
    return {"message": "FastAPI backend is running"}


@app.get("/test")
def test():
    return {"message": "React successfully connected to FastAPI"}


@app.post("/callback")
async def callback(data: CodeRequest):
    if not all([CLIENT_ID, CLIENT_SECRET, REDIRECT_URI]):
        raise HTTPException(status_code=500, detail="Missing Spotify env variables")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            data={
                "grant_type": "authorization_code",
                "code": data.code,
                "redirect_uri": REDIRECT_URI,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "code_verifier": data.code_verifier,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return response.json()