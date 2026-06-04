import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TIME_RANGES = [
  { label: "This Month", value: "short_term" },
  { label: "6 Months", value: "medium_term" },
  { label: "All Time", value: "long_term" },
];

function Tracks() {
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("medium_term");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopTracks() {
      setLoading(true);
      setTracks([]);
      const token = localStorage.getItem("spotify_access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
          const [response1, response2] = await Promise.all([
            fetch(
              `https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0&time_range=${timeRange}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            fetch(
              `https://api.spotify.com/v1/me/top/tracks?limit=50&offset=50&time_range=${timeRange}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

          if (!response1.ok || !response2.ok) {
            setError("Failed to fetch top tracks.");
            return;
          }

          const data1 = await response1.json();
          const data2 = await response2.json();

          const combined = [...(data1.items || []), ...(data2.items || [])];
          setTracks(combined);
        } catch (err) {
          console.error(err);
          setError("Something went wrong.");
        } finally {
          setLoading(false);
        }
    }

    fetchTopTracks();
  }, [timeRange]);

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.backBtn} onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
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
        <h1 style={styles.title}>TOP TRACKS</h1>
        <div style={styles.titleUnderline} />
        <p style={styles.subtitle}>YOUR HOT 100 SONGS</p>
      </div>

      {/* Time range selector */}
      <div style={styles.toggleRow}>
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            style={{
              ...styles.toggleBtn,
              ...(timeRange === r.value ? styles.toggleBtnActive : {}),
            }}
            onClick={() => setTimeRange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart list */}
      <div style={styles.chartList}>
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={styles.skeletonRow}>
                <div style={styles.skeletonRank} />
                <div style={styles.skeletonImg} />
                <div style={styles.skeletonText} />
              </div>
            ))
          : tracks.map((track, index) => (
              <ChartRow key={track.id} track={track} index={index} />
            ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>POWERED BY SPOTIFY</span>
        <div style={styles.footerLine} />
      </div>
    </div>
  );
}

function ChartRow({ track, index }) {
  const [hovered, setHovered] = useState(false);
  const rank = index + 1;
  const isTop3 = rank <= 3;
  const artistNames = track.artists.map((a) => a.name).join(", ");

  return (
    <div
      style={{
        ...styles.row,
        ...(hovered ? styles.rowHovered : {}),
        ...(isTop3 ? styles.rowTop3 : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rank number */}
      <div style={styles.rankCol}>
        <span
          style={{
            ...styles.rankNumber,
            ...(isTop3 ? styles.rankNumberTop3 : {}),
          }}
        >
          {String(rank).padStart(2, "0")}
        </span>
        {isTop3 && <div style={styles.rankAccent} />}
      </div>

      {/* Album art */}
      <div style={styles.imgWrapper}>
        {track.album.images?.[1]?.url ? (
          <img
            src={track.album.images[1].url}
            alt={track.album.name}
            style={{
              ...styles.trackImg,
              ...(hovered ? styles.trackImgHovered : {}),
            }}
          />
        ) : (
          <div style={styles.imgPlaceholder}>
            <span style={styles.imgPlaceholderText}>{track.name[0]}</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div style={styles.infoCol}>
        <p style={styles.trackName}>{track.name}</p>
        <p style={styles.artistName}>{artistNames}</p>
        <p style={styles.albumName}>{track.album.name}</p>
      </div>

      {/* Duration */}
      <div style={styles.durationCol}>
        <span style={styles.durationLabel}>DURATION</span>
        <span style={styles.durationValue}>
          {Math.floor(track.duration_ms / 60000)}:
          {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}
        </span>
      </div>

      {/* Divider */}
      <div style={styles.rowDivider} />
    </div>
  );
}

const GREEN = "#1DB954";
const DARK_BG = "#0a0a0a";
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
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  issueLabel: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    letterSpacing: "4px",
    color: GREEN,
    fontWeight: "700",
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
  toggleRow: {
    display: "flex",
    gap: "0",
    padding: "1.25rem 3rem",
    borderBottom: `1px solid ${BORDER}`,
  },
  toggleBtn: {
    background: "transparent",
    border: `1px solid ${BORDER}`,
    color: MUTED,
    padding: "0.4rem 1.25rem",
    fontSize: "11px",
    letterSpacing: "2px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    borderRight: "none",
  },
  toggleBtnActive: {
    background: GREEN,
    color: "#000",
    borderColor: GREEN,
    fontWeight: "700",
  },
  chartList: {
    padding: "0 3rem",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "1rem 0",
    position: "relative",
    cursor: "default",
    transition: "background 0.2s",
    borderRadius: "4px",
  },
  rowHovered: {
    background: "#151515",
  },
  rowTop3: {
    padding: "1.25rem 0",
  },
  rankCol: {
    width: "70px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    position: "relative",
  },
  rankNumber: {
    fontSize: "2.5rem",
    fontWeight: "900",
    color: "#222",
    fontFamily: "'Georgia', serif",
    lineHeight: "1",
    letterSpacing: "-2px",
  },
  rankNumberTop3: {
    color: "#333",
    fontSize: "3.5rem",
  },
  rankAccent: {
    width: "20px",
    height: "3px",
    background: GREEN,
    marginTop: "4px",
    alignSelf: "flex-end",
  },
  imgWrapper: {
    width: "64px",
    height: "64px",
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: "2px",
  },
  trackImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    filter: "grayscale(20%)",
    transition: "filter 0.3s, transform 0.3s",
  },
  trackImgHovered: {
    filter: "grayscale(0%)",
    transform: "scale(1.05)",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  imgPlaceholderText: {
    fontSize: "1.5rem",
    color: GREEN,
    fontWeight: "700",
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  trackName: {
    margin: "0 0 3px 0",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: TEXT,
    fontFamily: "'Georgia', serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    letterSpacing: "-0.3px",
  },
  artistName: {
    margin: "0 0 2px 0",
    fontSize: "10px",
    color: GREEN,
    letterSpacing: "2px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  albumName: {
    margin: "0",
    fontSize: "10px",
    color: MUTED,
    letterSpacing: "1px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  durationCol: {
    width: "100px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "5px",
  },
  durationLabel: {
    fontSize: "9px",
    letterSpacing: "2px",
    color: MUTED,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
  },
  durationValue: {
    fontSize: "1.1rem",
    color: TEXT,
    fontFamily: "'Georgia', serif",
    fontWeight: "700",
    letterSpacing: "-0.5px",
  },
  rowDivider: {
    position: "absolute",
    bottom: "0",
    left: "70px",
    right: "0",
    height: "1px",
    background: BORDER,
  },
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    padding: "1rem 0",
  },
  skeletonRank: {
    width: "70px",
    height: "40px",
    background: "#151515",
    borderRadius: "2px",
    flexShrink: 0,
  },
  skeletonImg: {
    width: "64px",
    height: "64px",
    background: "#151515",
    borderRadius: "2px",
    flexShrink: 0,
  },
  skeletonText: {
    flex: 1,
    height: "20px",
    background: "#151515",
    borderRadius: "2px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "2rem 3rem 0",
    marginTop: "1rem",
    borderTop: `1px solid ${BORDER}`,
  },
  footerText: {
    fontSize: "9px",
    letterSpacing: "3px",
    color: MUTED,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    flexShrink: 0,
  },
  footerLine: {
    flex: 1,
    height: "1px",
    background: BORDER,
  },
  errorContainer: {
    background: DARK_BG,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  },
  errorText: {
    color: TEXT,
    fontFamily: "'Georgia', serif",
  },
  backBtn: {
    background: GREEN,
    color: "#000",
    border: "none",
    padding: "0.5rem 1.5rem",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "1px",
    fontSize: "12px",
  },
};

export default Tracks;