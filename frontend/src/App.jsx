import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home";
import TopTracks from "./pages/Tracks";
import TopArtists from "./pages/Artists";


function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="/tracks">Top Tracks</Link> |{" "}
        <Link to="/artists">Top Artists</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracks" element={<Tracks  />} />
        <Route path="/artists" element={<Artists />} />
      </Routes>
    </div>
  );
}

export default App;