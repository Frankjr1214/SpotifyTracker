import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("spotify_access_token");

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("spotify_access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  async function loginWithSpotify() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI;
    const scopes = ["user-top-read", "user-read-private", "user-read-email"];

    const codeVerifier = generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    localStorage.setItem("spotify_code_verifier", codeVerifier);

    const authUrl =
      "https://accounts.spotify.com/authorize" +
      `?client_id=${clientId}` +
      "&response_type=code" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes.join(" "))}` +
      "&code_challenge_method=S256" +
      `&code_challenge=${codeChallenge}`;

    window.location.href = authUrl;
  }

  function logout() {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
    setUser(null);
  }

  function generateRandomString(length) {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.issueLabel}>YOUR PERSONAL MUSIC CHARTS</span>
          <h1 style={styles.title}>SPOTIFY<br />TRACKER</h1>
          <div style={styles.titleUnderline} />

          {!loading && (
            <>
              {isLoggedIn && user ? (
                <div style={styles.userSection}>
                  <div style={styles.userInfo}>
                    {user.images?.[0]?.url && (
                      <img
                        src={user.images[0].url}
                        alt={user.display_name}
                        style={styles.avatar}
                      />
                    )}
                    <div>
                      <p style={styles.welcomeLabel}>WELCOME BACK</p>
                      <p style={styles.userName}>{user.display_name}</p>
                      <p style={styles.userMeta}>
                        {user.followers?.total?.toLocaleString()} FOLLOWERS · {user.country}
                      </p>
                    </div>
                  </div>
                  <button style={styles.logoutBtn} onClick={logout}>
                    LOG OUT
                  </button>
                </div>
              ) : (
                <div style={styles.loginSection}>
                  <p style={styles.loginSubtext}>
                    See your top artists and tracks ranked Billboard-style.
                  </p>
                  <button style={styles.loginBtn} onClick={loginWithSpotify}>
                    LOG IN WITH SPOTIFY
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Chart cards */}
      {isLoggedIn && (
        <div style={styles.cardsSection}>
          <p style={styles.cardsSectionLabel}>EXPLORE YOUR CHARTS</p>
          <div style={styles.cards}>
            <div
              style={styles.card}
              onClick={() => navigate("/tracks")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = GREEN;
                e.currentTarget.style.background = "#111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = CARD_BG;
              }}
            >
              <span style={styles.cardNumber}>01</span>
              <div style={styles.cardAccent} />
              <h2 style={styles.cardTitle}>TOP TRACKS</h2>
              <p style={styles.cardDesc}>
                Your most played songs ranked by listening frequency across
                different time periods.
              </p>
              <span style={styles.cardCta}>VIEW CHART →</span>
            </div>

            <div
              style={styles.card}
              onClick={() => navigate("/artists")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = GREEN;
                e.currentTarget.style.background = "#111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
                e.currentTarget.style.background = CARD_BG;
              }}
            >
              <span style={styles.cardNumber}>02</span>
              <div style={styles.cardAccent} />
              <h2 style={styles.cardTitle}>TOP ARTISTS</h2>
              <p style={styles.cardDesc}>
                Your favorite artists ranked with popularity scores, genres,
                and listening trends.
              </p>
              <span style={styles.cardCta}>VIEW CHART →</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>POWERED BY SPOTIFY</span>
        <div style={styles.footerLine} />
      </div>
    </div>
  );
}

const GREEN = "#1DB954";
const DARK_BG = "#0a0a0a";
const CARD_BG = "#0d0d0d";
const BORDER = "#1f1f1f";
const MUTED = "#555555";
const TEXT = "#e8e8e8";

const styles = {
  page: {
    background: DARK_BG,
    minHeight: "100vh",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    display: "flex",
    flexDirection: "column",
  },
  hero: {
    borderBottom: `3px solid ${GREEN}`,
    padding: "4rem 3rem 3rem",
    flex: "1",
  },
  heroInner: {
    maxWidth: "800px",
  },
  issueLabel: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "11px",
    letterSpacing: "4px",
    color: GREEN,
    fontWeight: "700",
    display: "block",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "clamp(4rem, 12vw, 9rem)",
    fontWeight: "900",
    color: TEXT,
    margin: "0",
    lineHeight: "0.85",
    letterSpacing: "-4px",
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
  },
  titleUnderline: {
    width: "100%",
    height: "2px",
    background: `linear-gradient(to right, ${GREEN}, transparent)`,
    margin: "1.5rem 0",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    objectFit: "cover",
    border: `2px solid ${GREEN}`,
  },
  welcomeLabel: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "9px",
    letterSpacing: "3px",
    color: GREEN,
    margin: "0 0 4px 0",
  },
  userName: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: TEXT,
    margin: "0 0 4px 0",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.5px",
  },
  userMeta: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "10px",
    letterSpacing: "2px",
    color: MUTED,
    margin: "0",
  },
  logoutBtn: {
    background: "transparent",
    border: `1px solid ${BORDER}`,
    color: MUTED,
    padding: "0.4rem 1.25rem",
    fontSize: "10px",
    letterSpacing: "2px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  loginSection: {
    marginTop: "1rem",
  },
  loginSubtext: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "13px",
    letterSpacing: "2px",
    color: MUTED,
    margin: "0 0 1.5rem 0",
  },
  loginBtn: {
    background: GREEN,
    color: "#000",
    border: "none",
    padding: "0.75rem 2rem",
    fontSize: "12px",
    letterSpacing: "3px",
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontWeight: "700",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  cardsSection: {
    padding: "3rem",
  },
  cardsSectionLabel: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "10px",
    letterSpacing: "4px",
    color: MUTED,
    margin: "0 0 1.5rem 0",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1px",
    background: BORDER,
  },
  card: {
    background: CARD_BG,
    padding: "2rem",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
    border: `1px solid ${BORDER}`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  cardNumber: {
    fontSize: "3.5rem",
    fontWeight: "900",
    color: "#1a1a1a",
    fontFamily: "'Georgia', serif",
    lineHeight: "1",
    letterSpacing: "-2px",
  },
  cardAccent: {
    width: "30px",
    height: "3px",
    background: GREEN,
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: TEXT,
    margin: "0",
    fontFamily: "'Georgia', serif",
    fontStyle: "italic",
    letterSpacing: "-1px",
  },
  cardDesc: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "12px",
    letterSpacing: "1px",
    color: MUTED,
    margin: "0",
    lineHeight: "1.6",
    flex: 1,
  },
  cardCta: {
    fontFamily: "'Arial Narrow', 'Arial', sans-serif",
    fontSize: "10px",
    letterSpacing: "3px",
    color: GREEN,
    fontWeight: "700",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "2rem 3rem",
    borderTop: `1px solid ${BORDER}`,
    marginTop: "auto",
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
};

export default Home;