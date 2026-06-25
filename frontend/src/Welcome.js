import React, { useState } from "react";

const BG_URL = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80";

export const WelcomePage = ({ onEnter }) => {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 600);
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
        
        .welcome-card {
          animation: welcomeFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .welcome-bg {
          animation: welcomeBgZoom 12s ease-out both;
        }
        .btn-pulse {
          animation: pulseGlow 2.5s infinite;
          transition: all 0.3s ease;
        }
        .btn-pulse:hover {
          transform: translateY(-2px) scale(1.02);
          background: #6a8c6a !important;
        }
        .welcome-leaf {
          animation: leafFloat 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background Image with Overlay */}
      <div className="welcome-bg" style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url(${BG_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: 0.16,
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(20, 18, 16, 0.9) 0%, rgba(10, 14, 10, 0.95) 100%)",
        zIndex: 1
      }} />

      {/* Decorative floating lights */}
      <div style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90, 122, 90, 0.12) 0%, transparent 70%)",
        top: "10%",
        left: "15%",
        zIndex: 1
      }} />
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192, 83, 58, 0.04) 0%, transparent 70%)",
        bottom: "10%",
        right: "10%",
        zIndex: 1
      }} />

      {/* Content Card */}
      <div className="welcome-card" style={{
        position: "relative",
        zIndex: 10,
        width: "90%",
        maxWidth: 540,
        background: "rgba(28, 26, 22, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        padding: "clamp(24px, 6vw, 48px) clamp(16px, 5vw, 40px)",
        textAlign: "center",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
      }}>
        {/* Logo Icon */}
        <div className="welcome-leaf" style={{
          fontSize: "clamp(36px, 10vw, 54px)",
          marginBottom: "clamp(12px, 3vw, 20px)",
          display: "inline-block"
        }}>
          🌿
        </div>

        {/* Brand Name */}
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: "clamp(26px, 8vw, 38px)",
          fontWeight: 400,
          marginBottom: "clamp(16px, 5vw, 32px)",
          letterSpacing: "0.5px"
        }}>
          Plant<span style={{ color: "#8fb38f", fontStyle: "italic" }}>Pulse</span>
        </h1>

        {/* Greetings Container */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 4vw, 20px)",
          marginBottom: "clamp(24px, 6vw, 44px)",
          padding: "0 5px"
        }}>
          {/* English Greeting */}
          <div>
            <p style={{
              fontSize: "clamp(15px, 4.5vw, 18px)",
              fontWeight: 500,
              lineHeight: 1.5,
              color: "#f0ece4",
              marginBottom: 4
            }}>
              Welcome to PlantPulse
            </p>
            <p style={{
              fontSize: "clamp(12px, 3.5vw, 14px)",
              color: "#9a9589",
              lineHeight: 1.5
            }}>
              Your AI-powered plant health companion. Identify diseases, check local risk levels, and consult our assistant.
            </p>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 50%, transparent)"
          }} />

          {/* Hindi Greeting */}
          <div>
            <p style={{
              fontSize: "clamp(16px, 4.8vw, 19px)",
              fontWeight: 500,
              lineHeight: 1.5,
              color: "#f0ece4",
              marginBottom: 4
            }}>
              प्लांटपल्स में आपका स्वागत है
            </p>
            <p style={{
              fontSize: "clamp(12px, 3.5vw, 14px)",
              color: "#9a9589",
              lineHeight: 1.5
            }}>
              आपके पौधों के स्वास्थ्य का एआई साथी। बीमारियों की पहचान करें, स्थानीय जोखिम स्तर जानें और विशेषज्ञ सलाह पाएं।
            </p>
          </div>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="btn-pulse"
          style={{
            background: "#5a7a5a",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 14,
            padding: "clamp(10px, 3vw, 14px) clamp(24px, 8vw, 44px)",
            fontSize: "clamp(14px, 4vw, 16px)",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            fontFamily: "'Jost', sans-serif",
            display: "inline-flex",
            alignItems: "center",
            gap: 10
          }}
        >
          Get Started / शुरू करें ➔
        </button>
      </div>
    </div>
  );
};
