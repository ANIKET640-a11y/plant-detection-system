import React, { useState, useEffect } from "react";
import { ImageUpload } from "./home";
import { Dashboard } from "./Dashboard";
import { WelcomePage } from "./Welcome";
import { StoresPage } from "./StoresPage";
import { HistoryPage } from "./HistoryPage";

const getPageFromPath = () => {
  const path = window.location.pathname;
  if (path === "/dashboard") return "dashboard";
  if (path === "/stores") return "stores";
  if (path === "/history") return "history";
  if (path === "/home" || path === "/home/") return "home";
  return "welcome";
};

const getInitialUser = () => {
  const saved = localStorage.getItem("plantpulse_active_user");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
};

function App() {
  const [user, setUser] = useState(getInitialUser);
  const [page, setPage] = useState(() => {
    const initialUser = getInitialUser();
    if (!initialUser) return "welcome";
    return getPageFromPath();
  });
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [lang, setLang] = useState("en");
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [scrollTarget, setScrollTarget] = useState(null);
  const [restoredScan, setRestoredScan] = useState(null);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      window.dispatchEvent(new Event("popstate"));
    }
  };

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

  useEffect(() => {
    const handleLocationChange = () => {
      const currentUser = getInitialUser();
      const newPage = getPageFromPath();
      if (!currentUser && newPage !== "welcome") {
        const path = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("redirect", path);
        window.history.replaceState(null, "", `/welcome?${searchParams.toString()}`);
        setPage("welcome");
      } else {
        setPage(newPage);
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      const path = window.location.pathname;
      if (path !== "/welcome" && path !== "/") {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("redirect", path);
        window.history.replaceState(null, "", `/welcome?${searchParams.toString()}`);
      } else if (path === "/") {
        window.history.replaceState(null, "", "/welcome");
      }
      setPage("welcome");
    } else {
      const path = window.location.pathname;
      if (path === "/" || path === "/welcome") {
        navigate("/home");
      }
    }
  }, [user]);

  const updateHistory = (h) => {
    setHistory(h);
    localStorage.setItem("plantpulse_history", JSON.stringify(h));
  };

  const handleBack = (target) => {
    if (target === "stores") {
      navigate("/stores");
      setAiChatOpen(false);
    } else if (target === "history") {
      navigate("/history");
      setAiChatOpen(false);
    } else {
      navigate("/home");
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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("plantpulse_active_user");
    navigate("/welcome");
  };

  if (!user) {
    return (
      <WelcomePage
        user={null}
        onEnter={(userInfo) => {
          setUser(userInfo);
          if (userInfo) {
            localStorage.setItem("plantpulse_active_user", JSON.stringify(userInfo));
            const queryParams = new URLSearchParams(window.location.search);
            const redirectPath = queryParams.get("redirect");
            if (redirectPath && ["/dashboard", "/stores", "/history", "/home"].includes(redirectPath)) {
              navigate(redirectPath);
            } else {
              navigate("/home");
            }
          } else {
            localStorage.removeItem("plantpulse_active_user");
            navigate("/welcome");
          }
        }}
      />
    );
  }

  if (page === "welcome") {
    return (
      <WelcomePage 
        user={user}
        onEnter={(userInfo) => {
          setUser(userInfo);
          if (userInfo) {
            localStorage.setItem("plantpulse_active_user", JSON.stringify(userInfo));
            const queryParams = new URLSearchParams(window.location.search);
            const redirectPath = queryParams.get("redirect");
            if (redirectPath && ["/dashboard", "/stores", "/history", "/home"].includes(redirectPath)) {
              navigate(redirectPath);
            } else {
              navigate("/home");
            }
          } else {
            localStorage.removeItem("plantpulse_active_user");
            navigate("/welcome");
          }
        }}
      />
    );
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
              navigate("/home");
            }}
          />
        : <ImageUpload
            history={history} setHistory={updateHistory}
            darkMode={darkMode} setDarkMode={setDarkMode}
            lang={lang} setLang={setLang}
            onDashboard={() => navigate("/dashboard")}
            onStores={() => navigate("/stores")}
            onHistory={() => navigate("/history")}
            aiChatOpen={aiChatOpen}
            setAiChatOpen={setAiChatOpen}
            scrollTarget={scrollTarget}
            clearScrollTarget={() => setScrollTarget(null)}
            restoredScan={restoredScan}
            clearRestoredScan={() => setRestoredScan(null)}
            user={user}
            onLogout={handleLogout}
            onWelcome={() => navigate("/welcome")}
          />;
}

export default App;
