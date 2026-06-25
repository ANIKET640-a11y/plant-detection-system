import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const THEME = {
  dark:  { bg:"#141210", card:"rgba(28,26,22,0.97)", border:"#3a3530", text:"#f0ece4", sub:"#7a7268", muted:"#5a5448", divider:"#2a2820" },
  light: { bg:"#f7f5f0", card:"rgba(255,255,255,0.97)", border:"#e2ddd6", text:"#1c1c1a", sub:"#9a9589", muted:"#b0a99e", divider:"#f0ece6" },
};

const COLORS = ["#c0533a","#b07a1a","#5a7a5a","#4a7aaa","#8a5a9a","#3a8a7a","#c07a3a","#7a5a3a"];

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
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px", boxShadow:"0 2px 20px rgba(0,0,0,0.1)", ...extra }}>
      {children}
    </div>
  );

  const label = (txt) => (
    <p style={{ fontSize:11, color:T.muted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>{txt}</p>
  );

  const tDict = {
    en: { navHome: "Home", navScan: "Scan", navWeather: "Weather", navHistory: "Search History", navAI: "PlantPulse AI", navStores: "Agri-Stores" },
    hi: { navHome: "होम", navScan: "स्कैन", navWeather: "मौसम", navHistory: "खोज इतिहास", navAI: "PlantPulse AI", navStores: "कृषि दुकानें" }
  };
  const t = tDict[lang] || tDict["en"];

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Jost', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
       .plant-nav { display:flex; alignItems:center; justifyContent:space-between; gap:14px; padding:16px 32px; backdrop-filter:blur(14px); position:sticky; top:0; z-index:100; }
       .plant-nav-links { display:flex; alignItems:center; justifyContent:center; gap:16px; flex:1; }
       .plant-nav-link { background:none; border:0; cursor:pointer; font:500 12px 'Jost',sans-serif; }`}</style>

      <nav className="plant-nav" style={{ borderBottom:`1px solid ${T.border}`, background:darkMode?"rgba(20,18,16,0.95)":"rgba(247,245,240,0.95)" }}>
        <button onClick={() => onBack("home")} style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, background:"none", border:0, cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center" }}>
          Plant<em style={{ color:"#5a7a5a", fontStyle:"italic" }}>Pulse</em>
          <span style={{ fontSize:13, color:T.sub, marginLeft:12, fontStyle:"normal" }}>Dashboard</span>
        </button>
        <div className="plant-nav-links" style={{ color:T.sub }}>
          <button className="plant-nav-link" onClick={() => onBack("home")}>{t.navHome}</button>
          <button className="plant-nav-link" onClick={() => onBack("scan")}>{t.navScan}</button>
          <button className="plant-nav-link" onClick={() => onBack("weather")}>{t.navWeather}</button>
          <button className="plant-nav-link" onClick={() => onBack("history")}>⌕ {t.navHistory}</button>
          <button className="plant-nav-link" onClick={() => onBack("plantpulse-ai")}>✦ {t.navAI}</button>
          <button className="plant-nav-link" onClick={() => onBack("stores")}>📍 {t.navStores}</button>
        </div>
        <button onClick={() => onBack("home")} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, padding:"6px 16px", fontSize:13, color:T.sub, cursor:"pointer", flexShrink:0 }}>
          ← Back
        </button>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 24px" }}>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:16, marginBottom:28 }}>
          {[
            { label:"Total Scans", value:stats.total, icon:"🔍", color:"#5a7a5a" },
            { label:"Healthy Plants", value:stats.healthy, icon:"✅", color:"#3d7a3d" },
            { label:"Diseased Plants", value:stats.diseased, icon:"⚠️", color:"#c0533a" },
            { label:"Avg Confidence", value:`${stats.avgConf}%`, icon:"🎯", color:"#b07a1a" },
          ].map(s => (
            <div key={s.label} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 16px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Lora', serif", fontSize:32, fontWeight:500, color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:12, color:T.sub }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
          {card(
            <>
              {label("Scans Over Last 7 Days")}
              <p style={{ fontFamily:"'Lora', serif", fontSize:17, color:T.text, marginBottom:20 }}>Activity Trend</p>
              {stats.total === 0
                ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No scan data yet</p>
                : <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.divider} />
                      <XAxis dataKey="date" tick={{ fontSize:11, fill:T.sub }} />
                      <YAxis tick={{ fontSize:11, fill:T.sub }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12 }} />
                      <Line type="monotone" dataKey="scans" stroke="#5a7a5a" strokeWidth={2} dot={{ fill:"#5a7a5a", r:3 }} />
                    </LineChart>
                  </ResponsiveContainer>
              }
            </>
          )}

          {card(
            <>
              {label("Health Ratio")}
              <p style={{ fontFamily:"'Lora', serif", fontSize:17, color:T.text, marginBottom:20 }}>Healthy vs Diseased</p>
              {stats.total === 0
                ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No scan data yet</p>
                : <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {stats.pieData.map((entry,i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display:"flex", justifyContent:"center", gap:20 }}>
                      {stats.pieData.map(d => (
                        <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.sub }}>
                          <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
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
            <p style={{ fontFamily:"'Lora', serif", fontSize:17, color:T.text, marginBottom:20 }}>Most Detected Diseases</p>
            {stats.topDiseases.length === 0
              ? <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>No disease data yet. Start scanning!</p>
              : <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.topDiseases} layout="vertical" margin={{ left:20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.divider} />
                    <XAxis type="number" tick={{ fontSize:11, fill:T.sub }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:T.sub }} width={140} />
                    <Tooltip contentStyle={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, fontSize:12 }} />
                    <Bar dataKey="count" radius={[0,6,6,0]}>
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
            <p style={{ fontFamily:"'Lora', serif", fontSize:17, color:T.text, marginBottom:16 }}>Last Scans</p>
            {history.length === 0
              ? <p style={{ color:T.muted, fontSize:13 }}>No scans yet.</p>
              : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {history.slice(0,5).map(entry => (
                    <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 0", borderBottom:`1px solid ${T.divider}` }}>
                      {entry.imageUrl && <img src={entry.imageUrl} alt="" style={{ width:44, height:44, objectFit:"cover", borderRadius:8, flexShrink:0, border:`1px solid ${T.border}` }} />}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, color:T.text, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{entry.class.replace(/_/g," ")}</p>
                        <p style={{ fontSize:11, color:T.muted }}>{entry.date} · {entry.confidence}% confidence</p>
                      </div>
                      <span style={{ flexShrink:0, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:entry.healthy?"#edf5ed":"#fdf0ed", color:entry.healthy?"#3d7a3d":"#c0533a", border:`1px solid ${entry.healthy?"#c6e0c6":"#f0c4b8"}` }}>
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
