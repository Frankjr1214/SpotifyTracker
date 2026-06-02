import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Artists() {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopArtists() {
      const token = localStorage.getItem("spotify_access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setError("Failed to fetch top artists.");
          return;
        }

        const data = await response.json();
        setArtists(data.items);
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      }
    }

    fetchTopArtists();
  }, []);

  if (error) return <p>{error}</p>;
  if (artists.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <h1>Your Top Artists</h1>
      {artists.map((artist, index) => (
        <div key={artist.id}>
          <p>{index + 1}. {artist.name}</p>
          <img src={artist.images[1]?.url} alt={artist.name} width={100} />
          <p>Genres: {artist.genres.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

export default Artists;