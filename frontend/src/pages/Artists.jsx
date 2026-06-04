import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TIME_RANGES = [
  { label: "This Month", value: "short_term" },
  { label: "6 Months", value: "medium_term" },
  { label: "All Time", value: "long_term" },
];

function Artists() {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("medium_term");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTopArtists() {
      setLoading(true);
      setArtists([]);
      const token = localStorage.getItem("spotify_access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const [response1, response2] = await Promise.all([
          fetch(
            `https://api.spotify.com/v1/me/top/artists?limit=50&offset=0&time_range=${timeRange}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `https://api.spotify.com/v1/me/top/artists?limit=50&offset=50&time_range=${timeRange}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (!response1.ok || !response2.ok) {
          setError("Failed to fetch top artists.");
          return;
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        const combined = [...(data1.items || []), ...(data2.items || [])];
          setArtists(combined);
        } catch (err) {
          console.error(err);
          setError("Something went wrong.");
        } finally {
          setLoading(false);
        }
          }

    fetchTopArtists();
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
        <h1 style={styles.title}>TOP ARTISTS</h1>
        <div style={styles.titleUnderline} />
        <p style={styles.subtitle}>YOUR HOT 100 ARTISTS</p>
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
          : artists.map((artist, index) => (
              <ChartRow key={artist.id} artist={artist} index={index} />
            ))}
      </div>

      {/* Footer rule */}
      <div style={styles.footer}>
        <span style={styles.footerText}>POWERED BY SPOTIFY</span>
        <div style={styles.footerLine} />
      </div>
    </div>
  );
}

function ChartRow({ artist, index }) {
  const [hovered, setHovered] = useState(false);
  const rank = index + 1;
  const isTop3 = rank <= 3;

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

      {/* Artist image */}
      <div style={styles.imgWrapper}>
        {artist.images?.[1]?.url ? (
          <img
            src={artist.images[1].url}
            alt={artist.name}
            style={{
              ...styles.artistImg,
              ...(hovered ? styles.artistImgHovered : {}),
            }}
          />
        ) : (
          <div style={styles.imgPlaceholder}>
            <span style={styles.imgPlaceholderText}>
              {artist.name[0]}
            </span>
          </div>
        )}
      </div>

      {/* Artist info */}
      <div style={styles.infoCol}>
        <p style={styles.artistName}>{artist.name}</p>
        <p style={styles.genres}>
          {artist.genres.slice(0, 2).join(" · ").toUpperCase() || "NO GENRE"}
        </p>
      </div>

      {/* Popularity bar */}
      <div style={styles.popularityCol}>
        <span style={styles.popularityLabel}>POPULARITY</span>
        <div style={styles.barTrack}>
          <div
            style={{
              ...styles.barFill,
              width: `${artist.popularity}%`,
            }}
          />
        </div>
        <span style={styles.popularityValue}>{artist.popularity}</span>
      </div>

      {/* Divider */}
      <div style={styles.rowDivider} />
    </div>
  );
}

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
    transition: "color 0.2s",
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
  artistImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    filter: "grayscale(20%)",
    transition: "filter 0.3s, transform 0.3s",
  },
  artistImgHovered: {
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
  artistName: {
    margin: "0 0 4px 0",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: TEXT,
    fontFamily: "'Georgia', serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    letterSpacing: "-0.3px",
  },
  genres: {
    margin: "0",
    fontSize: "10px",
    color: MUTED,
    letterSpacing: "2px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  popularityCol: {
    width: "160px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    alignItems: "flex-end",
  },
  popularityLabel: {
    fontSize: "9px",
    letterSpacing: "2px",
    color: MUTED,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
  },
  barTrack: {
    width: "100%",
    height: "2px",
    background: "#1f1f1f",
    borderRadius: "1px",
  },
  barFill: {
    height: "100%",
    background: GREEN,
    borderRadius: "1px",
    transition: "width 0.6s ease",
  },
  popularityValue: {
    fontSize: "11px",
    color: GREEN,
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    letterSpacing: "1px",
    fontWeight: "700",
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

export default Artists;