import { useEffect, useState } from "react";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/test")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>Spotify Dashboard</h1>
      <p>View your top tracks and artists.</p>
      <p>{message}</p>
    </div>
  );
}

export default Home;