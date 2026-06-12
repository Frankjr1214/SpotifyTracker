import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

RECOMMENDATION_SYSTEM_PROMPT = """
You are a music recommender. 
Given a user's natural language music request, return ONLY a valid JSON object with this structure:

{
  "tracks": [
    {"artist": "artist name", "track_name": "track name"},
    {"artist": "artist name", "track_name": "track name"}
  ]
}

Return 12-15 tracks that fit the vibe. 
Be specific and accurate with artist and track names. Return ONLY the JSON, no explanation, no markdown. 
Do NOT wrap the JSON in markdown code blocks or backticks of any kind.
"""

RESPONSE_SYSTEM_PROMPT = """
You are a friendly music curator assistant. 
Given a user's request and a list of tracks that were found, write a short natural 2-3 sentence response describing the playlist and why it fits their vibe. 
Be conversational, not robotic. Don't list the tracks, just describe the feel.
"""

def generate_track_recommendations(user_message: str) -> list[dict]:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        system=RECOMMENDATION_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )
    raw=response.content[0].text.strip() 
    if raw.startswith("```"):
        raw= raw.split("\n", 1)[1]  
        raw = raw.rsplit("```", 1)[0]  
    parsed =json.loads(raw)
    return parsed["tracks"]  

def generate_response(user_message: str, tracks: list[dict], history: list[dict]) -> str:
    track_list ="\n".join([f"- {t['name']} by {t['artist']}" for t in tracks])

    prompt=f"""User request: "{user_message}"

Tracks found:
{track_list}

Write a short response describing this playlist."""

    messages =history + [{"role": "user", "content": prompt}]

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        system=RESPONSE_SYSTEM_PROMPT,
        messages=messages
    )
    return response.content[0].text


