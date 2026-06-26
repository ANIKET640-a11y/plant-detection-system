import React, { useState } from "react";

const BG_URL = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80";

export const WelcomePage = ({ user, onEnter }) => {
  const [exiting, setExiting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google Login flow modal state: null, "accounts", "permissions"
  const [googleStage, setGoogleStage] = useState(null);
  const [selectedGoogleAcc, setSelectedGoogleAcc] = useState(null);

  const getRegisteredUsers = () => {
    const data = localStorage.getItem("plantpulse_registered_users");
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const saveRegisteredUser = (newUser) => {
    const users = getRegisteredUsers();
    users.push(newUser);
    localStorage.setItem("plantpulse_registered_users", JSON.stringify(users));
  };

  const handleEnter = (userInfo) => {
    setExiting(true);
    setTimeout(() => {
      onEnter(userInfo);
      setExiting(false); // reset state for next time welcome mounts
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isSignup) {
      if (!name.trim()) {
        setError("Please enter your name / कृपया अपना नाम दर्ज करें");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email / कृपया सही ईमेल दर्ज करें");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters / पासवर्ड कम से कम 6 अक्षरों का होना चाहिए");
        return;
      }

      // Check if email already registered
      const users = getRegisteredUsers();
      if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setError("Email is already registered. Please log in. / ईमेल पहले से पंजीकृत है। कृपया लॉग इन करें।");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        const newUser = { name: name.trim(), email: email.trim().toLowerCase(), password };
        saveRegisteredUser(newUser);
        setLoading(false);
        handleEnter({
          name: newUser.name,
          email: newUser.email,
          authMethod: "email"
        });
      }, 1200);

    } else {
      // Log In
      if (!email.trim() || !email.includes("@")) {
        setError("Please enter a valid email / कृपया सही ईमेल दर्ज करें");
        return;
      }
      if (!password) {
        setError("Please enter your password / कृपया अपना पासवर्ड दर्ज करें");
        return;
      }

      const users = getRegisteredUsers();
      const match = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!match) {
        setError("Account not found. Please sign up first. / खाता नहीं मिला। कृपया पहले साइन अप करें।");
        return;
      }
      if (match.password !== password) {
        setError("Incorrect password. Please try again. / गलत पासवर्ड। कृपया पुनः प्रयास करें।");
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        handleEnter({
          name: match.name,
          email: match.email,
          authMethod: "email"
        });
      }, 1200);
    }
  };

  const startGoogleLogin = () => {
    setGoogleStage("accounts");
  };

  const selectGoogleAccount = (acc) => {
    setSelectedGoogleAcc(acc);
    setGoogleStage("permissions");
  };

  const acceptGooglePermissions = () => {
    setGoogleStage(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleEnter({
        name: selectedGoogleAcc.name,
        email: selectedGoogleAcc.email,
        authMethod: "google"
      });
    }, 1000);
  };

  return (
    <div style={{
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Jost', sans-serif",
      color: "#f0ece4",
      background: "#141210",
      overflow: "hidden",
      padding: "20px",
      opacity: exiting ? 0 : 1,
      transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      pointerEvents: exiting ? "none" : "auto"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500;600&display=swap');
        
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes welcomeBgZoom {
          from { transform: scale(1.05); }
          to { transform: scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 12px rgba(90, 122, 90, 0.4); border-color: rgba(90, 122, 90, 0.6); }
          50% { box-shadow: 0 0 24px rgba(90, 122, 90, 0.8); border-color: rgba(143, 179, 143, 0.9); }
        }
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .welcome-container {
          display: flex;
          width: 100%;
          max-width: 1040px;
          min-height: 620px;
          border-radius: 28px;
          overflow: hidden;
          background: rgba(28, 26, 22, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.7);
          z-index: 10;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          animation: welcomeFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .welcome-left {
          flex: 1.1;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
        }
        .welcome-right {
          flex: 0.9;
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(18, 16, 14, 0.45);
        }
        .welcome-bg {
          animation: welcomeBgZoom 12s ease-out both;
        }
        .welcome-leaf {
          animation: leafFloat 4s ease-in-out infinite;
        }
        
        .auth-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #f0ece4;
          font-family: 'Jost', sans-serif;
          font-size: 14px;
          transition: all 0.25s ease;
          outline: none;
        }
        .auth-input:focus {
          border-color: #8fb38f;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(143, 179, 143, 0.15);
        }
        
        .btn-primary {
          background: #5a7a5a;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 12px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Jost', sans-serif;
        }
        .btn-primary:hover:not(:disabled) {
          background: #6a8c6a;
          transform: translateY(-1px);
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-google {
          background: #ffffff;
          color: #1c1c1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Jost', sans-serif;
        }
        .btn-google:hover:not(:disabled) {
          background: #f5f5f7;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        
        .toggle-link {
          color: #8fb38f;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .toggle-link:hover {
          color: #a3c4a3;
          text-decoration: underline;
        }
        
        .spinner-icon {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spinner 0.6s linear infinite;
        }

        .spinner-icon-dark {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.15);
          border-radius: 50%;
          border-top-color: #1c1c1a;
          animation: spinner 0.6s linear infinite;
        }

        /* Google Modal Styles */
        .g-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .g-modal-card {
          background: #ffffff;
          color: #1f1f1f;
          width: 90%;
          max-width: 440px;
          border-radius: 18px;
          padding: 36px 32px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.25);
          animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          font-family: Roboto, -apple-system, sans-serif;
        }
        .g-account-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 8px;
          border-bottom: 1px solid #f1f1f1;
          cursor: pointer;
          transition: background 0.2s ease;
          border-radius: 8px;
        }
        .g-account-row:hover {
          background: #f7f7f9;
        }

        @media (max-width: 860px) {
          .welcome-container {
            flex-direction: column;
            min-height: auto;
            max-width: 480px;
            border-radius: 20px;
          }
          .welcome-left {
            padding: 32px 24px;
            align-items: center;
            text-align: center;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .welcome-right {
            padding: 32px 24px;
          }
        }
      `}</style>

      {/* Background Image with Overlay */}
      <div className="welcome-bg" style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${BG_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.15,
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(20, 18, 16, 0.9) 0%, rgba(10, 14, 10, 0.96) 100%)",
        zIndex: 1
      }} />

      {/* Decorative Blur Spheres */}
      <div style={{
        position: "absolute",
        width: 320,
        height: 320,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90, 122, 90, 0.14) 0%, transparent 70%)",
        top: "10%",
        left: "10%",
        zIndex: 1
      }} />
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192, 83, 58, 0.04) 0%, transparent 70%)",
        bottom: "10%",
        right: "5%",
        zIndex: 1
      }} />

      {/* Dual Column Welcome/Auth Card */}
      <div className="welcome-container">
        
        {/* Left column: brand details and text */}
        <div className="welcome-left">
          <div className="welcome-leaf" style={{ fontSize: 44, marginBottom: 14 }}>🌿</div>
          
          <h1 style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(26px, 6vw, 36px)",
            fontWeight: 400,
            marginBottom: 20,
            letterSpacing: "0.5px"
          }}>
            Plant<span style={{ color: "#8fb38f", fontStyle: "italic" }}>Pulse</span>
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 440 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#f0ece4", marginBottom: 6 }}>
                Welcome to PlantPulse
              </h2>
              <p style={{ fontSize: 13, color: "#9a9589", lineHeight: 1.5 }}>
                Your AI-powered plant health companion. Identify diseases, check local risk levels, and consult our assistant.
              </p>
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)" }} />

            <div>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: "#f0ece4", marginBottom: 6 }}>
                प्लांटपल्स में आपका स्वागत है
              </h2>
              <p style={{ fontSize: 13, color: "#9a9589", lineHeight: 1.5 }}>
                आपके पौधों के स्वास्थ्य का एआई साथी। बीमारियों की पहचान करें, स्थानीय जोखिम स्तर जानें और विशेषज्ञ सलाह पाएं।
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Login / Signup portal OR Active Session screen */}
        <div className="welcome-right">
          {user ? (
            /* Active Session Screen */
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#5a7a5a",
                color: "#fff",
                fontSize: 32,
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                border: "2px solid rgba(255,255,255,0.15)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: "#f0ece4", marginBottom: 8 }}>
                Welcome Back, {user.name}!
              </h2>
              <p style={{ fontSize: 13, color: "#9a9589", marginBottom: 36 }}>
                You are currently signed in as <strong style={{ color: "#f0ece4" }}>{user.email}</strong>.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 280 }}>
                <button onClick={() => handleEnter(user)} className="btn-primary" disabled={loading}>
                  Continue to Workspace ➔
                </button>
                <button 
                  onClick={() => handleEnter(null)} 
                  style={{
                    background: "transparent",
                    color: "#ff8a80",
                    border: "1px solid rgba(255, 138, 128, 0.2)",
                    borderRadius: 12,
                    padding: "11px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "rgba(255,138,128,0.06)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  Sign Out / लॉग आउट
                </button>
              </div>
            </div>
          ) : (
            /* Authentication forms */
            <>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 500, color: "#f0ece4", marginBottom: 6 }}>
                {isSignup ? "Create Account" : "Welcome Back"}
              </h2>
              <p style={{ fontSize: 13, color: "#9a9589", marginBottom: 24 }}>
                {isSignup ? "Sign up to start monitoring your plants." : "Sign in to access your previous history & records."}
              </p>

              {error && (
                <div style={{
                  background: "rgba(192, 83, 58, 0.1)",
                  border: "1px solid rgba(192, 83, 58, 0.2)",
                  color: "#ff8a80",
                  fontSize: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 16,
                  lineHeight: 1.4
                }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {isSignup && (
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Full Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Password</label>
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? <div className="spinner-icon" /> : null}
                  {isSignup ? "Sign Up" : "Log In"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", margin: "20px 0", gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                <span style={{ fontSize: 11, color: "#5a5448", textTransform: "uppercase", letterSpacing: "1px" }}>or</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
              </div>

              <button onClick={startGoogleLogin} className="btn-google" disabled={loading}>
                {loading ? (
                  <div className="spinner-icon-dark" />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <p style={{ fontSize: 13, color: "#9a9589", textAlign: "center", marginTop: 24, margin: "24px 0 0 0" }}>
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <span className="toggle-link" onClick={() => { setIsSignup(!isSignup); setError(""); }}>
                  {isSignup ? "Log In" : "Sign Up"}
                </span>
              </p>
            </>
          )}
        </div>

      </div>

      {/* Google Auth Multi-Stage Modal */}
      {googleStage && (
        <div className="g-modal-overlay">
          <div className="g-modal-card">
            
            {/* STAGE 1: Account Chooser */}
            {googleStage === "accounts" && (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 500, textAlign: "center", margin: "0 0 8px 0" }}>Sign in with Google</h3>
                <p style={{ fontSize: 13, color: "#5f6368", textAlign: "center", margin: "0 0 24px 0" }}>to continue to PlantPulse</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
                  <div className="g-account-row" onClick={() => selectGoogleAccount({ name: "Aniket Kumar", email: "aniket.vit@gmail.com" })}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e8f0fe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 15 }}>A</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Aniket Kumar</div>
                      <div style={{ fontSize: 12, color: "#5f6368" }}>aniket.vit@gmail.com</div>
                    </div>
                  </div>
                  <div className="g-account-row" onClick={() => selectGoogleAccount({ name: "Guest Farmer", email: "farmer.guest@gmail.com" })}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e6f4ea", color: "#137333", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 15 }}>F</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Guest Farmer</div>
                      <div style={{ fontSize: 12, color: "#5f6368" }}>farmer.guest@gmail.com</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setGoogleStage(null)} 
                  style={{ display: "block", width: "100%", background: "none", border: "1px solid #dadce0", borderRadius: 8, padding: "10px", fontSize: 13, color: "#1a73e8", cursor: "pointer", fontWeight: 500 }}
                >
                  Cancel
                </button>
              </>
            )}

            {/* STAGE 2: Permission consent */}
            {googleStage === "permissions" && selectedGoogleAcc && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  </svg>
                  <span style={{ fontSize: 13, color: "#5f6368" }}>{selectedGoogleAcc.email}</span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 12px 0", lineHeight: 1.4 }}>
                  PlantPulse wants to access your Google Account
                </h3>
                <p style={{ fontSize: 13, color: "#5f6368", margin: "0 0 20px 0", lineHeight: 1.5 }}>
                  This will allow PlantPulse to:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <input type="checkbox" defaultChecked disabled style={{ marginTop: 3 }} />
                    <span style={{ fontSize: 13, color: "#3c4043", lineHeight: 1.4 }}>
                      Associate you with your personal info on Google (Name, email address, profile picture)
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <input type="checkbox" defaultChecked disabled style={{ marginTop: 3 }} />
                    <span style={{ fontSize: 13, color: "#3c4043", lineHeight: 1.4 }}>
                      View your primary Google Account email address
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 11, color: "#70757a", margin: "0 0 24px 0", lineHeight: 1.4 }}>
                  Make sure you trust PlantPulse. You can learn more about how PlantPulse will use your data in its terms of service and privacy policy.
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setGoogleStage("accounts")} 
                    style={{ background: "none", border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 13, color: "#1a73e8", cursor: "pointer", fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={acceptGooglePermissions} 
                    style={{ background: "#1a73e8", border: "none", borderRadius: 4, padding: "8px 24px", fontSize: 13, color: "#ffffff", cursor: "pointer", fontWeight: 500 }}
                  >
                    Allow
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
