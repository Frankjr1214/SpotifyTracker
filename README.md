# Spotify Tracker

A personal Spotify dashboard that displays your top tracks and artists in a Billboard chart-inspired UI, with an AI-powered music chat feature that generates playlists from natural language prompts. Built with a React frontend and a FastAPI Python backend.

---

## Features

- **OAuth 2.0 + PKCE authentication** — secure Spotify login flow with no client secret exposed to the frontend
- **Top Tracks** — your top 100 most played songs ranked by listening frequency, with album art, artist, album name, and duration
- **Top Artists** — your top 100 most listened-to artists ranked with genre tags and popularity scores
- **Time range toggle** — filter charts by This Month (4 weeks), 6 Months, or All Time
- **User profile** — displays your Spotify display name, avatar, follower count, and country on the home page
- **AI Music Chat** — describe a vibe in natural language and get a playlist back. Claude recommends specific tracks, retrieves them via Spotify search, and responds conversationally. Supports follow-up requests to refine the playlist
- **Billboard aesthetic** — dark theme with Spotify green accents, editorial typography, and hover animations

---

## Tech Stack

**Frontend**
- React + Vite
- React Router DOM
- Plain CSS (no UI library)

**Backend**
- Python 3
- FastAPI
- httpx (async HTTP client)
- python-dotenv
- anthropic (Anthropic Python SDK)

---

## Project Structure

```
SpotifyTracker/
├── backend/
│   ├── chatbot/
│   │   ├── __init__.py      # Package init
│   │   ├── claude.py        # Anthropic API calls (track recommendations + response generation)
│   │   ├── spotify.py       # Spotify search wrapper (Client Credentials flow)
│   │   └── models.py        # Pydantic models for chat requests
│   ├── main.py              # FastAPI app — OAuth token exchange + /chat endpoint
│   └── .env                 # Backend environment variables (not committed)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page with user profile and chart links
│   │   │   ├── Tracks.jsx     # Top 100 tracks chart
│   │   │   ├── Artists.jsx    # Top 100 artists chart
│   │   │   ├── Chat.jsx       # AI music chat interface
│   │   │   └── Callback.jsx   # Handles OAuth redirect and token exchange
│   │   ├── App.jsx            # Router and nav
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles
│   └── .env                   # Frontend environment variables (not committed)
└── README.md
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Spotify Developer](https://developer.spotify.com/dashboard) account and app
- An [Anthropic](https://console.anthropic.com) account with API credits

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SpotifyTracker.git
cd SpotifyTracker
```

### 2. Spotify Developer Dashboard

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Under **Redirect URIs**, add: `http://127.0.0.1:5173/callback`
4. Save your **Client ID** and **Client Secret**

### 3. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows
# or
source .venv/bin/activate       # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/callback
```

---

## Running the App

Start the backend first, then the frontend in a separate terminal.

**Backend:**
```bash
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://127.0.0.1:5173` in your browser.

---

## How the Auth Flow Works

1. User clicks **Log in with Spotify** on the home page
2. A PKCE code verifier and challenge are generated — the verifier is stored in localStorage, the challenge is sent to Spotify
3. User is redirected to Spotify's login/permission page
4. After approving, Spotify redirects back to `/callback` with a short-lived authorization code in the URL
5. The callback page sends the code and verifier to the FastAPI backend
6. The backend adds the client secret and exchanges everything with Spotify's token endpoint
7. Spotify returns an `access_token`, `refresh_token`, and `expires_in` — these are saved to localStorage
8. The user is redirected to the Top Tracks page

The client secret never touches the frontend — all token exchange happens server-side.

---

## How the AI Chat Works

1. User types a natural language prompt ("something chill for late night coding")
2. The frontend sends the message and conversation history to the `/chat` endpoint
3. Claude receives the prompt and recommends 12-15 specific tracks as structured JSON
4. The backend searches Spotify for each track — any that aren't found are silently skipped
5. Claude receives the found tracks and writes a short conversational response describing the playlist
6. The frontend renders Claude's reply and the track cards with album art linking to Spotify

Conversation history is passed with every request, enabling follow-up prompts like "make it more upbeat" to work correctly. The Anthropic API key and Spotify credentials never touch the frontend.

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | backend `.env` | Your Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | backend `.env` | Your Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | backend `.env` | Must match Spotify Dashboard setting |
| `ANTHROPIC_API_KEY` | backend `.env` | Your Anthropic API key |
| `VITE_SPOTIFY_CLIENT_ID` | frontend `.env` | Your Spotify app client ID |
| `VITE_REDIRECT_URI` | frontend `.env` | Must match Spotify Dashboard setting |

---

## Notes

- Spotify access tokens expire after 1 hour. The app stores the refresh token but token refresh is not yet automated — you will need to log in again after expiry.
- Spotify's API returns a maximum of 50 results per request. The app makes two requests (offset 0 and offset 50) and combines them for up to 100 results. Actual results depend on your listening history.
- The `user-top-read`, `user-read-private`, and `user-read-email` scopes are required.
- The AI chat uses Spotify's public search endpoint with Client Credentials — no user login is required for that feature.
- Claude occasionally recommends tracks that don't exist or gets titles slightly wrong. These are silently skipped, which is why 12-15 tracks are requested to reliably return ~10 results.

---

## Screenshots

<img width="2555" height="1271" alt="image" src="https://github.com/user-attachments/assets/62d917d7-31d5-4ac8-afbc-cd05c4f0c859" />
<img width="2559" height="1116" alt="image" src="https://github.com/user-attachments/assets/03c35caa-06e6-4936-b44f-380ca98fdc03" />
<img width="2540" height="1062" alt="image" src="https://github.com/user-attachments/assets/53762253-ee9b-4a4e-987b-e8eac9123951" />


---

## License

MIT
