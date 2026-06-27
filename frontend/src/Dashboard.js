import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const THEME = {
  dark:  { bg:"#141210", card:"rgba(28,26,22,0.97)", border:"#3a3530", text:"#f0ece4", sub:"#9a9589", muted:"#5a5448", divider:"#2a2820" },
  light: { bg:"#f7f5f0", card:"rgba(255,255,255,0.97)", border:"#e2ddd6", text:"#1c1c1a", sub:"#7a7268", muted:"#b0a99e", divider:"#f0ece6" },
};

const COLORS = ["#c0533a", "#b07a1a", "#5a7a5a", "#4a7aaa", "#8a5a9a", "#3a8a7a", "#c07a3a", "#7a5a3a"];

export const Dashboard = ({ history, darkMode, lang, onBack }) => {
  const T = darkMode ? THEME.dark : THEME.light;

  const stats = useMemo(() => {
    const total = history.length;
    const healthy = history.filter(h => h.healthy).length;
    const diseased = total - healthy;
    const avgConf = total ? (history.reduce((s,h) => s + parseFloat(h.confidence), 0) / total).toFixed(1) : 0;

    const diseaseCount = {};
    history.forEach(h => {
      const name = h.class.replace(/_/g," ");
      diseaseCount[name] = (diseaseCount[name] || 0) + 1;
    });
    const topDiseases = Object.entries(diseaseCount)
      .sort((a,b) => b[1]-a[1])
      .slice(0,8)
      .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0,18)+"…" : name, count }));

    const pieData = [
      { name: "Healthy", value: healthy, color: "#5a7a5a" },
      { name: "Diseased", value: diseased, color: "#c0533a" },
    ].filter(d => d.value > 0);

    const days = {};
    for (let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = d.toLocaleDateString("en",{month:"short",day:"numeric"});
      days[key] = 0;
    }
    history.forEach(h => {
      const d = new Date(h.id);
      const key = d.toLocaleDateString("en",{month:"short",day:"numeric"});
      if (key in days) days[key]++;
    });
    const trend = Object.entries(days).map(([date,scans]) => ({ date, scans }));

    return { total, healthy, diseased, avgConf, topDiseases, pieData, trend };
  }, [history]);

  const card = (children, extra={}) => (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px", boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)", ...extra }}>
      {children}
    </div>
  );

  const label = (txt) => (
    <p style={{ fontSize:11, color:T.muted, letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600, marginBottom:8 }}>{txt}</p>
  );

  const tDict = {
    en: { navHome: "Home", navScan: "Scan", navWeather: "Weather", navHistory: "Search History", navAI: "PlantPulse AI", navStores: "Agri-Stores" },
    hi: { navHome: "होम", navScan: "स्कैन", navWeather: "मौसम", navHistory: "खोज इतिहास", navAI: "PlantPulse AI", navStores: "कृषि दुकानें" }
  };
  const t = tDict[lang] || tDict["en"];

  const tooltipStyle = {
    backgroundColor: T.card,
    borderColor: T.border,
    borderRadius: 12,
    fontSize: 12,
    color: T.text,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    backdropFilter: "blur(10px)",
    padding: "10px 14px"
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Jost', sans-serif", transition:"background 0.3s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .stat-card {
          background: ${T.card};
          border: 1px solid ${T.border};
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          transition: all 0.25s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: ${darkMode ? "0 10px 24px rgba(0,0,0,0.4)" : "0 10px 20px rgba(0,0,0,0.08)"};
        }
      `}</style>

      <nav className="plant-nav" style={{ borderBottom:`1px solid ${T.border}`, background:darkMode?"rgba(20,18,16,0.95)":"rgba(247,245,240,0.95)" }}>
        <button onClick={() => onBack("home")} style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, background:"none", border:0, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", gap:8 }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5a7a5a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22C2 12 10 4 22 2c0 10-8 18-20 20z"/><path d="M9 15l3-3"/></svg>
          <span style={{ fontWeight: 600 }}>Plant<span style={{ color: "#5a7a5a", fontStyle: "italic" }}>Pulse</span></span>
          <span style={{ fontSize: 12, color: T.sub, marginLeft: 8, fontStyle: "normal", background: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: 12 }}>Dashboard</span>
        </button>
        <div className="plant-nav-links" style={{ color:T.sub }}>
          <button className="plant-nav-link" onClick={() => onBack("home")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {t.navHome}
          </button>
          <button className="plant-nav-link" onClick={() => onBack("scan")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            {t.navScan}
          </button>
          <button className="plant-nav-link" onClick={() => onBack("weather")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>
            {t.navWeather}
          </button>
          <button className="plant-nav-link" onClick={() => onBack("history")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><polyline points="11 5 11 11 14 14"/></svg>
            {t.navHistory}
          </button>
          <button className="plant-nav-link" onClick={() => onBack("plantpulse-ai")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {t.navAI}
          </button>
          <button className="plant-nav-link" onClick={() => onBack("stores")}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {t.navStores}
          </button>
        </div>
        <button className="plant-nav-link active" onClick={() => onBack("home")} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 16px", fontSize:13, color:T.sub, cursor:"pointer", flexShrink:0, whiteSpace:"nowrap" }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { 
              label:"Total Scans", 
              value:stats.total, 
              color:"#5a7a5a",
              icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#5a7a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            },
            { 
              label:"Healthy Plants", 
              value:stats.healthy, 
              color:"#3d7a3d",
              icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#3d7a3d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            },
            { 
              label:"Diseased Plants", 
              value:stats.diseased, 
              color:"#c0533a",
              icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#c0533a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            },
            { 
              label:"Avg Confidence", 
              value:`${stats.avgConf}%`, 
              color:"#b07a1a",
              icon: <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#b07a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeft:`4px solid ${s.color}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:500, color:T.sub, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.label}</div>
                <div>{s.icon}</div>
              </div>
              <div style={{ fontFamily:"'Lora', serif", fontSize:32, fontWeight:500, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20, marginBottom:20 }}>
          {card(
            <>
              {label("Scans Over Last 7 Days")}
              <p style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, marginBottom:20, fontWeight: 500 }}>Activity Trend</p>
              {stats.total === 0
                ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No scan data yet</p>
                : <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={stats.trend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.divider} opacity={0.6} />
                      <XAxis dataKey="date" tick={{ fontSize:10, fill:T.sub }} />
                      <YAxis tick={{ fontSize:10, fill:T.sub }} allowDecimals={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="scans" stroke="#5a7a5a" strokeWidth={3} dot={{ fill:"#5a7a5a", strokeWidth: 2, r:4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
              }
            </>
          )}

          {card(
            <>
              {label("Health Ratio")}
              <p style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, marginBottom:20, fontWeight: 500 }}>Healthy vs Diseased</p>
              {stats.total === 0
                ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No scan data yet</p>
                : <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} dataKey="value" paddingAngle={4}>
                          {stats.pieData.map((entry,i) => <Cell key={i} fill={entry.color} style={{ outline: 'none' }} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop: 12 }}>
                      {stats.pieData.map(d => (
                        <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.sub }}>
                          <div style={{ width:10, height:10, borderRadius:50, background:d.color }} />
                          {d.name}: {d.value}
                        </div>
                      ))}
                    </div>
                  </>
              }
            </>
          )}
        </div>

        {card(
          <>
            {label("Disease Frequency")}
            <p style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, marginBottom:20, fontWeight: 500 }}>Most Detected Diseases</p>
            {stats.topDiseases.length === 0
              ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No disease data yet. Start scanning!</p>
              : <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stats.topDiseases} layout="vertical" margin={{ left:-10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.divider} opacity={0.6} />
                    <XAxis type="number" tick={{ fontSize:10, fill:T.sub }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:T.sub }} width={120} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[0,6,6,0]} barSize={14}>
                      {stats.topDiseases.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            }
          </>,
          { marginBottom:20 }
        )}

        {card(
          <>
            {label("Recent Activity")}
            <p style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, marginBottom:16, fontWeight: 500 }}>Last Scans</p>
            {history.length === 0
              ? <p style={{ color:T.muted, fontSize:13 }}>No scans yet.</p>
              : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {history.slice(0,5).map(entry => (
                    <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom:`1px solid ${T.divider}` }}>
                      {entry.imageUrl && <img src={entry.imageUrl} alt="" style={{ width:48, height:48, objectFit:"cover", borderRadius:10, flexShrink:0, border:`1px solid ${T.border}` }} />}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight: 500, color:T.text, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{entry.class.replace(/_/g," ")}</p>
                        <p style={{ fontSize:11, color:T.sub }}>{entry.date} · {entry.confidence}% confidence</p>
                      </div>
                      <span style={{ flexShrink:0, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, background:entry.healthy?"rgba(90, 122, 90, 0.08)":"rgba(192, 83, 58, 0.08)", color:entry.healthy?"#8fb38f":"#ff8a80", border:`1px solid ${entry.healthy?"rgba(90, 122, 90, 0.2)":"rgba(192, 83, 58, 0.2)"}` }}>
                        {entry.healthy?"Healthy":"Diseased"}
                      </span>
                    </div>
                  ))}
                </div>
            }
          </>
        )}
      </div>
    </div>
  );
};
