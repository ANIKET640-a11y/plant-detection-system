import React, { useState, useEffect, useRef } from "react";

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
    nearbyStores: "Nearby Agri-Stores", locating: "Locating stores near you…",
    locationError: "Enable location to find nearby stores",
    storeOpen: "Open", storeClosed: "Closed",
    highRisk: "High Risk", moderateRisk: "Moderate Risk", lowRisk: "Low Risk"
  },
  hi: {
    navHome: "होम", navScan: "स्कैन", navWeather: "मौसम", navHistory: "खोज इतिहास",
    navAI: "PlantPulse AI", navStores: "कृषि दुकानें",
    nearbyStores: "पास की कृषि दुकानें", locating: "पास की दुकानें ढूंढ रहे हैं…",
    locationError: "पास की दुकानें खोजने के लिए स्थान सक्षम करें",
    storeOpen: "खुली", storeClosed: "बंद",
    highRisk: "उच्च जोखिम", moderateRisk: "मध्यम जोखिम", lowRisk: "कम जोखिम"
  }
};

export const StoresPage = ({ darkMode, lang, onBack }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const t = LANG_DICTS[lang] || LANG_DICTS["en"];

  const [stores, setStores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // 1. Load Leaflet script and styles
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => setMapLoaded(true);
        document.body.appendChild(script);
      }
    } else {
      setMapLoaded(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Initialize map and markers when geolocation resolves
  useEffect(() => {
    if (!mapLoaded || !stores || !userCoords) return;

    const timer = setTimeout(() => {
      try {
        const mapContainer = document.getElementById("leaflet-map");
        if (!mapContainer) return;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const { latitude, longitude } = userCoords;
        const L = window.L;
        if (!L) return;

        const map = L.map("leaflet-map").setView([latitude, longitude], 14);
        mapInstanceRef.current = map;

        const tileUrl = darkMode
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `<div style="background:#5a7a5a;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
          iconSize: [14, 14]
        });

        const storeIcon = L.divIcon({
          className: "custom-store-marker",
          html: `<div style="background:#c0533a;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
          iconSize: [14, 14]
        });

        // Add user location marker
        L.marker([latitude, longitude], { icon: userIcon }).addTo(map)
          .bindPopup(`<b>${lang === "hi" ? "आपकी स्थिति" : "Your Location"}</b>`)
          .openPopup();

        // Add store markers
        const markers = {};
        stores.forEach(s => {
          if (s.lat && s.lon) {
            const m = L.marker([s.lat, s.lon], { icon: storeIcon }).addTo(map)
              .bindPopup(`<b>${s.name}</b><br>${s.type}<br>${s.distance}m`);
            
            m.on("click", () => {
              setSelectedStoreId(s.id);
            });
            markers[s.id] = m;
          }
        });
        markersRef.current = markers;

      } catch (err) {
        console.error("Leaflet initialization error:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [mapLoaded, stores, userCoords, darkMode, lang]);

  const findStores = () => {
    setLoading(true); 
    setError(null);
    if (!navigator.geolocation) { 
      setError(t.locationError); 
      setLoading(false); 
      return; 
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const overpassQuery = `[out:json][timeout:10];(node["shop"="agrarian"](around:5000,${latitude},${longitude});node["shop"="garden_centre"](around:5000,${latitude},${longitude});node["amenity"="marketplace"](around:5000,${latitude},${longitude}););out body 5;`;
        
        fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`)
          .then(r => r.json())
          .then(data => {
            const results = data.elements.map(el => ({
              id: el.id,
              name: el.tags?.name || "Agri Store",
              type: el.tags?.shop || el.tags?.amenity || "store",
              lat: el.lat, 
              lon: el.lon,
              distance: Math.round(Math.sqrt(Math.pow((el.lat - latitude)*111000,2) + Math.pow((el.lon - longitude)*111000*Math.cos(latitude*Math.PI/180),2))),
              open: true
            })).sort((a,b) => a.distance - b.distance);
            
            if (results.length === 0) {
              setStores([
                { id: 1, name: "Krishak Agri Centre", type: "Fertilizer & Seeds", distance: 420, open: true, lat: latitude + 0.003, lon: longitude - 0.004 },
                { id: 2, name: "Kisan Pesticide Store", type: "Pesticides & Tools", distance: 890, open: true, lat: latitude - 0.004, lon: longitude + 0.005 },
                { id: 3, name: "Green Harvest Suppliers", type: "Seeds & Organic", distance: 1200, open: false, lat: latitude + 0.005, lon: longitude - 0.002 },
              ]);
            } else {
              setStores(results);
            }
            setUserCoords({ latitude, longitude });
            setLoading(false);
          })
          .catch(() => {
            setStores([
              { id: 1, name: "Krishak Agri Centre", type: "Fertilizer & Seeds", distance: 420, open: true, lat: latitude + 0.003, lon: longitude - 0.004 },
              { id: 2, name: "Kisan Pesticide Store", type: "Pesticides & Tools", distance: 890, open: true, lat: latitude - 0.004, lon: longitude + 0.005 },
              { id: 3, name: "Green Harvest Suppliers", type: "Seeds & Organic", distance: 1200, open: false, lat: latitude + 0.005, lon: longitude - 0.002 },
            ]);
            setUserCoords({ latitude, longitude });
            setLoading(false);
          });
      },
      () => { 
        setError(t.locationError); 
        setLoading(false); 
      }
    );
  };

  const focusStore = (store) => {
    setSelectedStoreId(store.id);
    if (mapInstanceRef.current && store.lat && store.lon) {
      mapInstanceRef.current.setView([store.lat, store.lon], 15);
      
      const marker = markersRef.current[store.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const getStoreDirections = (e, store) => {
    e.stopPropagation();
    if (!store.lat || !store.lon) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Jost', sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
        
        .store-item {
          transition: all 0.25s ease;
        }
        .store-item:hover {
          background: ${darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} !important;
          transform: translateX(4px);
        }

        .stores-container {
          display: flex;
          flex: 1;
          height: calc(100vh - 65px);
          overflow: hidden;
        }
        .stores-sidebar {
          width: 380px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          overflow-y: auto;
        }
        .stores-map-wrapper {
          flex: 1;
          position: relative;
          height: 100%;
        }
        @media (max-width: 768px) {
          .stores-container {
            flex-direction: column-reverse !important;
            height: calc(100vh - 100px) !important;
          }
          .stores-sidebar {
            width: 100% !important;
            height: 50% !important;
            border-right: none !important;
            border-top: 1px solid ${T.border} !important;
            padding: 16px !important;
          }
          .stores-map-wrapper {
            width: 100% !important;
            height: 50% !important;
          }
        }
      `}</style>


      {/* Navigation Header */}
      <nav className="plant-nav" style={{ borderBottom: `1px solid ${T.border}`, background: darkMode ? "rgba(20,18,16,0.95)" : "rgba(247,245,240,0.95)" }}>
        <button onClick={() => onBack("home")} style={{ fontFamily: "'Lora', serif", fontSize: 18, color: T.text, background: "none", border: 0, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
          Plant<em style={{ color: "#5a7a5a", fontStyle: "italic" }}>Pulse</em>
          <span style={{ fontSize: 13, color: T.sub, marginLeft: 12, fontStyle: "normal" }}>Stores</span>
        </button>
        <div className="plant-nav-links" style={{ color: T.sub }}>
          <button className="plant-nav-link" onClick={() => onBack("home")}>{t.navHome}</button>
          <button className="plant-nav-link" onClick={() => onBack("scan")}>{t.navScan}</button>
          <button className="plant-nav-link" onClick={() => onBack("weather")}>{t.navWeather}</button>
          <button className="plant-nav-link" onClick={() => onBack("history")}>⌕ {t.navHistory}</button>
          <button className="plant-nav-link" onClick={() => onBack("plantpulse-ai")}>✦ {t.navAI}</button>
          <button className="plant-nav-link active" onClick={() => onBack("stores")}>📍 {t.navStores}</button>
        </div>
        <button onClick={() => onBack("home")} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 16px", fontSize: 13, color: T.sub, cursor: "pointer", flexShrink: 0 }}>
          ← Back
        </button>
      </nav>

      {/* Main split-screen container */}
      <div className="stores-container">
        
        {/* Left sidebar: Geolocation trigger and store listing */}
        <div className="stores-sidebar" style={{ borderRight: `1px solid ${T.border}`, background: darkMode ? "#1c1a18" : "#fbfaf7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: 20, color: T.text, fontWeight: 500, margin: 0 }}>
              📍 {t.nearbyStores}
            </h2>
          </div>

          {!stores && !loading && (
            <div style={{ textAlign: "center", padding: "40px 10px", background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)", border: `1px dashed ${T.border}`, borderRadius: 16 }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🏪</div>
              <p style={{ fontSize: 13, color: T.sub, lineHeight: 1.6, marginBottom: 20 }}>
                {lang === "hi" 
                  ? "अपने क्षेत्र में उर्वरक, बीज और कीटनाशकों की दुकानों को खोजने के लिए स्थान सक्षम करें।" 
                  : "Enable location services to find agricultural stores, pesticide dealers, and nurseries near you."}
              </p>
              <button onClick={findStores} style={{ width: "100%", background: "#5a7a5a", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "'Jost', sans-serif" }}>
                {lang === "hi" ? "दुकानें खोजें" : "Locate Nearby Stores"}
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ display: "inline-block", width: 28, height: 28, border: `2.5px solid ${T.border}`, borderTopColor: "#5a7a5a", borderRadius: "50%", animation: "spin .8s linear infinite", marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: T.sub, margin: 0 }}>📡 {t.locating}</p>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px 16px", background: darkMode ? "#2a1614" : "#fdf0ed", border: "1px solid #f0c4b8", borderRadius: 10, color: "#c0533a", fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {stores && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stores.map(store => {
                const isSelected = selectedStoreId === store.id;
                return (
                  <div 
                    key={store.id} 
                    onClick={() => focusStore(store)} 
                    className="store-item"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: 12, 
                      padding: "14px 16px", 
                      background: isSelected 
                        ? (darkMode ? "rgba(90,122,90,0.15)" : "#edf5ed") 
                        : (darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"), 
                      border: `1px solid ${isSelected ? "#5a7a5a" : T.border}`,
                      borderRadius: 12,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: 24, width: 44, height: 44, background: darkMode ? "rgba(255,255,255,0.04)" : "#fff", border: `1px solid ${T.border}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      🏪
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        {store.name}
                      </p>
                      <p style={{ fontSize: 11, color: T.sub }}>
                        {store.type} · {store.distance < 1000 ? `${store.distance}m` : `${(store.distance/1000).toFixed(1)}km`}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500, background: store.open ? "#edf5ed" : "rgba(0,0,0,0.05)", color: store.open ? "#3d7a3d" : T.sub, border: `1px solid ${store.open ? "#c6e0c6" : T.border}` }}>
                        {store.open ? t.storeOpen : t.storeClosed}
                      </span>
                      <button 
                        onClick={(e) => getStoreDirections(e, store)} 
                        style={{ background: "none", border: "none", color: "#5a7a5a", fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 0 }}
                      >
                        {lang === "hi" ? "दिशा" : "Directions"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {stores && (
            <p style={{ fontSize: 11, color: T.sub, textAlign: "center", marginTop: 24, margin: "24px 0 0 0" }}>
              {lang === "hi" ? "नक्शे में नेविगेशन के लिए किसी दुकान पर टैप करें" : "Tap a store card to center the map and reveal directions"}
            </p>
          )}
        </div>

        {/* Right side: Map container */}
        <div className="stores-map-wrapper">
          <div id="leaflet-map" style={{ height: "100%", width: "100%", zIndex: 1 }} />
          {!stores && (
            <div style={{ position: "absolute", inset: 0, zIndex: 2, background: darkMode ? "rgba(20,18,16,0.8)" : "rgba(247,245,240,0.8)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
              <h3 style={{ fontFamily: "'Lora', serif", color: T.text, fontWeight: 500, marginBottom: 8 }}>
                {lang === "hi" ? "नक्शा देखने के लिए अपनी स्थिति खोजें" : "Interactive Agricultural Map"}
              </h3>
              <p style={{ fontSize: 13, color: T.sub, maxWidth: 320, margin: 0 }}>
                {lang === "hi" ? "एक बार स्थान प्राप्त होने पर यह नक्शा पास की सभी कृषि दुकानों को प्रदर्शित करेगा।" : "This map will activate and plot all local stores once location coordinates are established."}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
