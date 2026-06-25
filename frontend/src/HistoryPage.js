import React, { useState } from "react";

const THEME = {
  dark: { 
    bg: "#141210", 
    card: "rgba(28,26,22,0.97)", 
    border: "#3a3530", 
    text: "#f0ece4", 
    sub: "#7a7268", 
    muted: "#5a5448", 
    divider: "#2a2820",
    toggleBg: "#2a2820",
    btnBorder: "#4a4540",
    btnText: "#c0b8a8"
  },
  light: { 
    bg: "#f7f5f0", 
    card: "rgba(255,255,255,0.97)", 
    border: "#e2ddd6", 
    text: "#1c1c1a", 
    sub: "#9a9589", 
    muted: "#b0a99e", 
    divider: "#f0ece6",
    toggleBg: "#e8e4de",
    btnBorder: "#c8c0b4",
    btnText: "#5a5248"
  },
};

const LANG_DICTS = {
  en: {
    navHome: "Home", navScan: "Scan", navWeather: "Weather", navHistory: "Search History",
    navAI: "PlantPulse AI", navStores: "Agri-Stores",
    scanHistory: "Search History Archive",
    scansCount: "scans recorded",
    scanCount: "scan recorded",
    clearAll: "Clear All Archive",
    noHistory: "Search History is Empty",
    noHistorySub: "Your diagnosed plant leaves will be saved here automatically. Go back to Home to scan a leaf.",
    goHome: "Go to Home / Scan 🌿",
    confidence: "Confidence",
    healthy: "Healthy",
    diseased: "Diseased",
    back: "← Back",
    confirmClear: "Are you sure you want to clear all history? This action cannot be undone.",
    restoreTooltip: "Click card to restore this scan details on Home page",
    deleteTooltip: "Delete this scan"
  },
  hi: {
    navHome: "होम", navScan: "स्कैन", navWeather: "मौसम", navHistory: "खोज इतिहास",
    navAI: "PlantPulse AI", navStores: "कृषि दुकानें",
    scanHistory: "खोज इतिहास संग्रह",
    scansCount: "स्कैन सहेजे गए",
    scanCount: "स्कैन सहेजा गया",
    clearAll: "सारा संग्रह हटाएं",
    noHistory: "खोज इतिहास खाली है",
    noHistorySub: "आपके पहचाने गए पौधों के पत्ते यहाँ अपने आप सहेज लिए जाएंगे। नया स्कैन करने के लिए होम पेज पर जाएं।",
    goHome: "होम / स्कैन पर जाएं 🌿",
    confidence: "विश्वसनीयता",
    healthy: "स्वस्थ",
    diseased: "रोगग्रस्त",
    back: "← वापस",
    confirmClear: "क्या आप वाकई सारा इतिहास हटाना चाहते हैं? यह क्रिया वापस नहीं की जा सकती।",
    restoreTooltip: "होम पेज पर इस स्कैन के विवरण को देखने के लिए क्लिक करें",
    deleteTooltip: "इस स्कैन को हटाएं"
  }
};

export const HistoryPage = ({ history, setHistory, darkMode, lang, onBack, onRestore }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const t = LANG_DICTS[lang] || LANG_DICTS["en"];

  const [deletingIds, setDeletingIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setDeletingIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Wait for the exit animation to complete before removing from state
    setTimeout(() => {
      setHistory(history.filter(item => item.id !== id));
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  };

  const handleClearAll = () => {
    setHistory([]);
    setShowConfirm(false);
  };

  const handleCardClick = (entry) => {
    if (onRestore) {
      onRestore({
        class: entry.class,
        confidence: parseFloat(entry.confidence) / 100,
        imageUrl: entry.imageUrl
      });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Jost', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500;600&display=swap');

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes leafFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
        }
        
        .history-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, opacity 0.35s ease, max-height 0.35s ease, padding 0.35s ease, margin 0.35s ease, border-width 0.35s ease;
          animation: cardFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .history-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 8px 30px ${darkMode ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.08)"} !important;
          border-color: #5a7a5a !important;
        }
        .deleting-card {
          opacity: 0 !important;
          transform: scale(0.92) translateY(-12px) !important;
          max-height: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          border-width: 0 !important;
          overflow: hidden !important;
        }
        .btn-hover {
          transition: all 0.25s ease;
        }
        .btn-hover:hover {
          transform: scale(1.03);
          background: #5a7a5a !important;
          color: #fff !important;
        }
        .empty-leaf {
          animation: leafFloat 3.5s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Navigation Header */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "16px 32px", borderBottom: `1px solid ${T.border}`, background: darkMode ? "rgba(20,18,16,0.95)" : "rgba(247,245,240,0.95)", backdropFilter: "blur(14px)", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={() => onBack("home")} style={{ fontFamily: "'Lora', serif", fontSize: 18, color: T.text, background: "none", border: 0, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
          Plant<em style={{ color: "#5a7a5a", fontStyle: "italic" }}>Pulse</em>
          <span style={{ fontSize: 13, color: T.sub, marginLeft: 12, fontStyle: "normal" }}>Archive</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flex: 1 }}>
          <button onClick={() => onBack("home")} style={{ background: "none", border: 0, color: T.sub, cursor: "pointer", font: "500 12px 'Jost',sans-serif" }}>{t.navHome}</button>
          <button onClick={() => onBack("scan")} style={{ background: "none", border: 0, color: T.sub, cursor: "pointer", font: "500 12px 'Jost',sans-serif" }}>{t.navScan}</button>
          <button onClick={() => onBack("weather")} style={{ background: "none", border: 0, color: T.sub, cursor: "pointer", font: "500 12px 'Jost',sans-serif" }}>{t.navWeather}</button>
          <button onClick={() => onBack("history")} style={{ background: "none", border: 0, color: T.text, cursor: "pointer", font: "600 12px 'Jost',sans-serif", borderBottom: "2px solid #5a7a5a", paddingBottom: 2 }}>⌕ {t.navHistory}</button>
          <button onClick={() => onBack("plantpulse-ai")} style={{ background: "none", border: 0, color: T.sub, cursor: "pointer", font: "500 12px 'Jost',sans-serif" }}>✦ {t.navAI}</button>
          <button onClick={() => onBack("stores")} style={{ background: "none", border: 0, color: T.sub, cursor: "pointer", font: "500 12px 'Jost',sans-serif" }}>📍 {t.navStores}</button>
        </div>
        <button onClick={() => onBack("home")} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 16px", fontSize: 13, color: T.sub, cursor: "pointer", flexShrink: 0 }}>
          {t.back}
        </button>
      </nav>

      {/* Main archive layout */}
      <div style={{ flex: 1, maxWidth: 1100, width: "100%", margin: "0 auto", padding: "40px 24px" }}>
        
        {/* Title Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 28, color: T.text, fontWeight: 500, margin: 0, marginBottom: 4 }}>
              ⌕ {t.scanHistory}
            </h2>
            <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>
              {history.length} {history.length !== 1 ? t.scansCount : t.scanCount}
            </p>
          </div>

          {history.length > 0 && (
            <div style={{ position: "relative" }}>
              {!showConfirm ? (
                <button 
                  onClick={() => setShowConfirm(true)} 
                  style={{ background: "none", border: `1px solid ${T.border}`, color: T.text, padding: "8px 18px", borderRadius: 10, fontSize: 13, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
                >
                  🗑️ {t.clearAll}
                </button>
              ) : (
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, position: "absolute", right: 0, top: "100%", marginTop: 8, width: 260, zIndex: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                  <p style={{ fontSize: 12, color: T.text, margin: 0, lineHeight: 1.4 }}>{t.confirmClear}</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button onClick={() => setShowConfirm(false)} style={{ background: "none", border: 0, color: T.sub, fontSize: 12, cursor: "pointer", padding: "4px 8px" }}>Cancel</button>
                    <button onClick={handleClearAll} style={{ background: "#c0533a", border: 0, color: "#fff", fontSize: 12, cursor: "pointer", padding: "4px 10px", borderRadius: 6 }}>Clear</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* List of cards */}
        {history.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px", background: T.card, border: `1px dashed ${T.border}`, borderRadius: 20, textAlign: "center", marginTop: 20 }}>
            <div className="empty-leaf" style={{ fontSize: 64, marginBottom: 20 }}>🍃</div>
            <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: T.text, fontWeight: 500, marginBottom: 8 }}>
              {t.noHistory}
            </h3>
            <p style={{ fontSize: 13, color: T.sub, maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
              {t.noHistorySub}
            </p>
            <button 
              onClick={() => onBack("home")} 
              className="btn-hover"
              style={{ background: "none", border: `1px solid ${T.btnBorder}`, color: T.btnText, padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}
            >
              {t.goHome}
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {history.map((entry, index) => {
              const isDeleting = deletingIds.has(entry.id);
              const formattedName = entry.class.replace(/_/g, " ");
              const statusColor = entry.healthy ? "#3d7a3d" : "#c0533a";
              const statusBg = entry.healthy ? "#edf5ed" : "#fdf0ed";
              const statusBorder = entry.healthy ? "#c6e0c6" : "#f0c4b8";

              return (
                <div 
                  key={entry.id}
                  onClick={() => handleCardClick(entry)}
                  className={`history-card ${isDeleting ? "deleting-card" : ""}`}
                  title={t.restoreTooltip}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius: 16,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 14px rgba(0,0,0,0.03)",
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  {/* Card Image Thumbnail */}
                  <div style={{ position: "relative", height: 160, background: darkMode ? "#22201d" : "#eae6de", overflow: "hidden" }}>
                    {entry.imageUrl ? (
                      <img 
                        src={entry.imageUrl} 
                        alt={formattedName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                        onMouseOver={e => e.currentTarget.style.transform = "scale(1.06)"}
                        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
                        🍂
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <span style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: statusBg,
                      color: statusColor,
                      border: `1px solid ${statusBorder}`,
                      zIndex: 2
                    }}>
                      {entry.healthy ? t.healthy : t.diseased}
                    </span>
                  </div>

                  {/* Card Content Details */}
                  <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontFamily: "'Lora', serif", fontSize: 16, fontWeight: 500, color: T.text, margin: "0 0 4px 0", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {formattedName}
                      </h4>
                      <p style={{ fontSize: 11, color: T.sub, margin: "0 0 14px 0" }}>
                        {entry.date}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.divider}`, paddingTop: 12, marginTop: "auto" }}>
                      <div>
                        <span style={{ fontSize: 11, color: T.sub, display: "block", marginBottom: 2 }}>{t.confidence}</span>
                        <span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{entry.confidence}%</span>
                      </div>

                      <button 
                        onClick={(e) => handleDelete(e, entry.id)}
                        title={t.deleteTooltip}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.sub,
                          fontSize: 16,
                          cursor: "pointer",
                          padding: "6px 8px",
                          borderRadius: 8,
                          transition: "all 0.2s ease"
                        }}
                        onMouseOver={e => { e.currentTarget.style.color = "#c0533a"; e.currentTarget.style.background = darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"; }}
                        onMouseOut={e => { e.currentTarget.style.color = T.sub; e.currentTarget.style.background = "none"; }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
