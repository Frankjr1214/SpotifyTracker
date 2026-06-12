import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home";
import Tracks from "./pages/Tracks";
import Artists from "./pages/Artists";
import Callback from "./pages/Callback";
import Chat from "./pages/Chat";

function App() {
  return (
    <div>
      <nav style={{ background: '#0a0a0a', borderBottom: '1px solid #1f1f1f', padding: '8px 16px' }}>
        <Link to="/">Home</Link> |{" "}
        <Link to="/tracks">Top Tracks</Link> |{" "}
        <Link to="/artists">Top Artists</Link>
        <Link to="/chat">Music Chat</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracks" element={<Tracks  />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </div>
  );
}

export default App;