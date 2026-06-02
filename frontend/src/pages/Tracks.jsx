import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopTracks() {
      const token = localStorage.getItem("spotify_access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setError("Failed to fetch top tracks.");
          return;
        }

        const data = await response.json();
        setTracks(data.items);
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      }
    }

    fetchTopTracks();
  }, []);

  if (error) return <p>{error}</p>;
  if (tracks.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <h1>Your Top Tracks</h1>
      {tracks.map((track, index) => (
        <div key={track.id}>
          <p>{index + 1}. {track.name} — {track.artists.map(a => a.name).join(", ")}</p>
          <img src={track.album.images[1]?.url} alt={track.album.name} width={100} />
        </div>
      ))}
    </div>
  );
}

export default Tracks;