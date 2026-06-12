import { useState, useRef, useEffect } from "react";

const GREEN = "#1DB954";
const DARK_BG = "#0a0a0a";
const CARD_BG = "#111111";
const BORDER = "#1f1f1f";
const MUTED = "#555555";
const TEXT = "#e8e8e8";

const styles = {
  page: {
    background: DARK_BG,
    minHeight: "100vh",
    padding: "0 0 4rem 0",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  header: {
    borderBottom: `3px solid ${GREEN}`,
    padding: "2.5rem 3rem 1.5rem",
    marginBottom: "0",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  issueDate: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    letterSpacing: "2px",
    color: MUTED,
  },
  title: {
    fontSize: "clamp(3rem, 8vw, 6rem)",
    fontWeight: "900",
    color: TEXT,
    margin: "0",
    lineHeight: "0.9",
    letterSpacing: "-2px",
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },
  titleUnderline: {
    width: "100%",
    height: "2px",
    background: `linear-gradient(to right, ${GREEN}, transparent)`,
    margin: "0.75rem 0 0.5rem",
  },
  subtitle: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    letterSpacing: "5px",
    color: MUTED,
    margin: "0",
  },
  body: {
    padding: "2rem 3rem",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  chatWindow: {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    minHeight: "120px",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: GREEN,
    color: "#000",
    padding: "0.65rem 1rem",
    borderRadius: "12px 12px 2px 12px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "14px",
    maxWidth: "60%",
    letterSpacing: "0.3px",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    background: CARD_BG,
    color: TEXT,
    padding: "0.75rem 1rem",
    borderRadius: "12px 12px 12px 2px",
    border: `1px solid ${BORDER}`,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "14px",
    maxWidth: "70%",
    lineHeight: "1.6",
    letterSpacing: "0.3px",
  },
  tracksSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  tracksLabel: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    letterSpacing: "4px",
    color: GREEN,
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  trackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "0.75rem",
  },
  trackCard: {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    overflow: "hidden",
    textDecoration: "none",
    display: "block",
    transition: "border-color 0.15s ease",
    cursor: "pointer",
  },
  trackCardHovered: {
    borderColor: GREEN,
  },
  trackImg: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    display: "block",
  },
  trackImgPlaceholder: {
    width: "100%",
    aspectRatio: "1",
    background: BORDER,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: {
    padding: "0.6rem 0.75rem",
  },
  trackName: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    color: TEXT,
    margin: "0 0 0.2rem 0",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  trackArtist: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    color: MUTED,
    margin: "0",
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  inputRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: "4px",
    padding: "0.75rem 1rem",
    color: TEXT,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "14px",
    letterSpacing: "0.3px",
    outline: "none",
  },
  sendBtn: {
    background: GREEN,
    border: "none",
    borderRadius: "4px",
    padding: "0.75rem 1.5rem",
    color: "#000",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  sendBtnDisabled: {
    background: BORDER,
    color: MUTED,
    cursor: "not-allowed",
  },
  loadingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "0.5rem 0",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: GREEN,
  },
  emptyState: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "13px",
    color: MUTED,
    letterSpacing: "1px",
    textAlign: "center",
    padding: "2rem 0",
  },
};

function TrackCard({ track }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={track.external_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...styles.trackCard, ...(hovered ? styles.trackCardHovered : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {track.album_art ? (
        <img src={track.album_art} alt={track.name} style={styles.trackImg} />
      ) : (
        <div style={styles.trackImgPlaceholder} />
      )}
      <div style={styles.trackInfo}>
        <p style={styles.trackName}>{track.name}</p>
        <p style={styles.trackArtist}>{track.artist}</p>
      </div>
    </a>
  );
}

function LoadingDots() {
  return (
    <div style={styles.assistantBubble}>
      <div style={styles.loadingDots}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState([]); // {role, content, tracks?}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const buildHistory = () =>
    messages.map((m) => ({ role: m.role, content: m.content }));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: buildHistory(),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, tracks: data.tracks },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        input::placeholder { color: ${MUTED}; }
        input:focus { border-color: ${GREEN} !important; }
      `}</style>

      <div style={styles.page}>
        
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <span style={styles.issueDate}>
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 style={styles.title}>MUSIC CHAT</h1>
          <div style={styles.titleUnderline} />
          <p style={styles.subtitle}>AI-POWERED PLAYLIST CURATOR</p>
        </div>

      
        <div style={styles.body}>
        
          <div style={styles.chatWindow}>
            {messages.length === 0 && !loading && (
              <p style={styles.emptyState}>
                DESCRIBE A VIBE. GET A PLAYLIST.
              </p>
            )}

            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  style={
                    msg.role === "user"
                      ? styles.userBubble
                      : styles.assistantBubble
                  }
                >
                  {msg.content}
                </div>
                {msg.tracks && msg.tracks.length > 0 && (
                  <div style={{ ...styles.tracksSection, marginTop: "1rem" }}>
                    <p style={styles.tracksLabel}>PLAYLIST</p>
                    <div style={styles.trackGrid}>
                      {msg.tracks.map((track, j) => (
                        <TrackCard key={j} track={track} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && <LoadingDots />}
            <div ref={bottomRef} />
          </div>

         
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="something chill for late night coding..."
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                ...(loading || !input.trim() ? styles.sendBtnDisabled : {}),
              }}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              SEND
            </button>
          </div>
        </div>
      </div>
    </>
  );
}