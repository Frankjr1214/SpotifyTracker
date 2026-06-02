import { useEffect, useState, useRef  } from "react";
import { useNavigate } from "react-router-dom";

function Callback() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    async function exchangeCodeForToken() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (hasRun.current) return; // ← block second run
      hasRun.current = true;

      if (!code) {
        setError("No authorization code found in URL.");
        return;
      }

      const codeVerifier = localStorage.getItem("spotify_code_verifier");

      if (!codeVerifier) {
        setError("No code verifier found. Please try logging in again.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, code_verifier: codeVerifier }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.detail || "Failed to get access token.");
          return;
        }

        // Store tokens
        localStorage.setItem("spotify_access_token", data.access_token);
        localStorage.setItem("spotify_refresh_token", data.refresh_token);
        localStorage.setItem(
          "spotify_token_expiry",
          Date.now() + data.expires_in * 1000
        );

        // Clean up verifier
        localStorage.removeItem("spotify_code_verifier");

        navigate("/tracks");
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    }

    exchangeCodeForToken();
  }, []);

  if (error) {
    return (
      <div>
        <h1>Login Failed</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Logging in...</h1>
      <p>Please wait while we connect your Spotify account.</p>
    </div>
  );
}

export default Callback;