import React, { useState, useEffect } from "react";
import { ImageUpload } from "./home";
import { Dashboard } from "./Dashboard";
import { WelcomePage } from "./Welcome";
import { StoresPage } from "./StoresPage";
import { HistoryPage } from "./HistoryPage";

function App() {
  const [page, setPage] = useState("welcome");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("en");
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState(null);
  const [restoredScan, setRestoredScan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("plantpulse_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        localStorage.removeItem("plantpulse_history");
      }
    }
    const savedTheme = localStorage.getItem("plantpulse_dark");
    setDarkMode(savedTheme === null ? true : savedTheme === "true");
    const savedLang = localStorage.getItem("plantpulse_lang");
    if (savedLang === "en" || savedLang === "hi") setLang(savedLang);
  }, []);

  const updateHistory = (h) => {
    setHistory(h);
    localStorage.setItem("plantpulse_history", JSON.stringify(h));
  };

  const handleBack = (target) => {
    if (target === "stores") {
      setPage("stores");
      setAiChatOpen(false);
    } else if (target === "history") {
      setPage("history");
      setAiChatOpen(false);
    } else {
      setPage("home");
      if (target === "plantpulse-ai") {
        setAiChatOpen(true);
      } else {
        setAiChatOpen(false);
        if (target && target !== "home") {
          setScrollTarget(target);
        }
      }
    }
  };

  if (page === "welcome") {
    return <WelcomePage onEnter={(userInfo) => {
      setUser(userInfo);
      setPage("home");
    }} />;
  }

  return page === "dashboard"
    ? <Dashboard history={history} darkMode={darkMode} lang={lang} onBack={handleBack} />
    : page === "stores"
      ? <StoresPage darkMode={darkMode} lang={lang} onBack={handleBack} />
      : page === "history"
        ? <HistoryPage
            history={history} setHistory={updateHistory}
            darkMode={darkMode} lang={lang}
            onBack={handleBack}
            onRestore={(scan) => {
              setRestoredScan(scan);
              setPage("home");
            }}
          />
        : <ImageUpload
            history={history} setHistory={updateHistory}
            darkMode={darkMode} setDarkMode={setDarkMode}
            lang={lang} setLang={setLang}
            onDashboard={() => setPage("dashboard")}
            onStores={() => setPage("stores")}
            onHistory={() => setPage("history")}
            aiChatOpen={aiChatOpen}
            setAiChatOpen={setAiChatOpen}
            scrollTarget={scrollTarget}
            clearScrollTarget={() => setScrollTarget(null)}
            restoredScan={restoredScan}
            clearRestoredScan={() => setRestoredScan(null)}
            user={user}
          />;
}

export default App;
