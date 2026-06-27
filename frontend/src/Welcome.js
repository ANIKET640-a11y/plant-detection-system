import React, { useState } from "react";

const BG_URL = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const WelcomePage = ({ user, onEnter }) => {
  const [exiting, setExiting] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (isSignup) {
      if (!trimmedName) {
        setError("Please enter your name / कृपया अपना नाम दर्ज करें");
        return;
      }
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        setError("Please enter a valid email / कृपया सही ईमेल दर्ज करें");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters / पासवर्ड कम से कम 6 अक्षरों का होना चाहिए");
        return;
      }

      setLoading(true);
      try {
        // Try to signup on the backend
        const response = await fetch(`${API_URL.replace(/\/$/, "")}/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || "Signup failed on server.");
        }

        const data = await response.json();
        // Save local backup
        const newUser = { name: trimmedName, email: trimmedEmail, password };
        saveRegisteredUser(newUser);

        setLoading(false);
        handleEnter({
          name: data.name,
          email: data.email,
          authMethod: "email"
        });
      } catch (err) {
        console.error("Signup server error, falling back to local storage:", err);

        // Check if email already registered locally
        const users = getRegisteredUsers();
        if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
          setLoading(false);
          setError("Email is already registered. Please log in. / ईमेल पहले से पंजीकृत है। कृपया लॉग इन करें।");
          return;
        }

        // If it's a network error or down, allow local signup
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("server error")) {
          const newUser = { name: trimmedName, email: trimmedEmail, password };
          saveRegisteredUser(newUser);
          setLoading(false);
          handleEnter({
            name: newUser.name,
            email: newUser.email,
            authMethod: "email"
          });
        } else {
          setLoading(false);
          setError(err.message || "An error occurred during signup.");
        }
      }

    } else {
      // Log In
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        setError("Please enter a valid email / कृपया सही ईमेल दर्ज करें");
        return;
      }
      if (!password) {
        setError("Please enter your password / कृपया अपना पासवर्ड दर्ज करें");
        return;
      }

      setLoading(true);
      try {
        // Try to login on the backend
        const response = await fetch(`${API_URL.replace(/\/$/, "")}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmedEmail, password })
        });

        if (!response.ok) {
          const errData = await response.json();
          // If the account was not found on the server (e.g. database wiped), check local backup to heal the server!
          if (response.status === 404) {
            const users = getRegisteredUsers();
            const match = users.find(u => u.email.toLowerCase() === trimmedEmail);
            if (match && match.password === password) {
              // Self-heal: register the user back on the server
              const signupResponse = await fetch(`${API_URL.replace(/\/$/, "")}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: match.name, email: match.email, password: match.password })
              });
              if (signupResponse.ok) {
                const signupData = await signupResponse.json();
                setLoading(false);
                handleEnter({
                  name: signupData.name,
                  email: signupData.email,
                  authMethod: "email"
                });
                return;
              }
            }
          }
          throw new Error(errData.detail || "Login failed on server.");
        }

        const data = await response.json();
        // Ensure user is in local backup
        const users = getRegisteredUsers();
        if (!users.some(u => u.email.toLowerCase() === trimmedEmail)) {
          saveRegisteredUser({ name: data.name, email: trimmedEmail, password });
        }

        setLoading(false);
        handleEnter({
          name: data.name,
          email: data.email,
          authMethod: "email"
        });
      } catch (err) {
        console.error("Login server error, falling back to local storage:", err);
        
        // Fallback to local storage
        const users = getRegisteredUsers();
        const match = users.find(u => u.email.toLowerCase() === trimmedEmail);

        if (!match) {
          setLoading(false);
          setError("Account not found. Please sign up first. / खाता नहीं मिला। कृपया पहले साइन अप करें।");
          return;
        }
        if (match.password !== password) {
          setLoading(false);
          setError("Incorrect password. Please try again. / गलत पासवर्ड। कृपया पुनः प्रयास करें।");
          return;
        }

        setLoading(false);
        handleEnter({
          name: match.name,
          email: match.email,
          authMethod: "email"
        });
      }
    }
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
                    <label htmlFor="auth-name" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Full Name</label>
                    <input
                      id="auth-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      className="auth-input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="auth-email" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Email Address</label>
                  <input
                    id="auth-email"
                    type="email"
                    name="username"
                    autoComplete="username"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="auth-password" style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#9a9589", marginBottom: 6 }}>Password</label>
                  <input
                    id="auth-password"
                    type="password"
                    name="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
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


    </div>
  );
};
