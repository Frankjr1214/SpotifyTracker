import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home";
import Tracks from "./pages/Tracks";
import Artists from "./pages/Artists";
import Callback from "./pages/Callback";

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
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </div>
  );
}

export default App;