import httpx
import os
import base64


async def get_spotify_token() -> str:
    credentials = f"{os.getenv('SPOTIFY_CLIENT_ID')}:{os.getenv('SPOTIFY_CLIENT_SECRET')}"
    encoded = base64.b64encode(credentials.encode()).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://accounts.spotify.com/api/token",
            headers={"Authorization": f"Basic {encoded}"},
            data={"grant_type": "client_credentials"}
        )
        response.raise_for_status()
        return response.json()["access_token"]

async def search_track(client: httpx.AsyncClient, token: str, artist: str, track_name: str) -> dict | None:
    try:
        response = await client.get(
            "https://api.spotify.com/v1/search",
            headers={"Authorization": f"Bearer {token}"},
            params={
                "q": f"track:{track_name} artist:{artist}",
                "type": "track",
                "limit": 1
            }
        )
        response.raise_for_status()
        items=response.json()["tracks"]["items"]

        if not items:
            return None 

        track =items[0]
        return {
            "name": track["name"],
            "artist": track["artists"][0]["name"],
            "uri": track["uri"],
            "preview_url": track["preview_url"],
            "album_art": track["album"]["images"][0]["url"] if track["album"]["images"] else None,
            "external_url": track["external_urls"]["spotify"]
        }
    except Exception:
        return None  

async def get_tracks(recommendations: list[dict]) -> list[dict]:
    token =await get_spotify_token()
    results = []

    async with httpx.AsyncClient() as client:
        for rec in recommendations:
            track = await search_track(client, token, rec["artist"], rec["track_name"])
            if track is not None: 
                results.append(track)

    return results


