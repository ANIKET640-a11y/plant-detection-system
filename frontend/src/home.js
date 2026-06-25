import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const BG_URL = "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80";
const OPENWEATHER_KEY = process.env.REACT_APP_WEATHER_KEY || "";
const SUPPORTED_LANGS = ["en", "hi"];

// ─── UI TRANSLATIONS ──────────────────────────────────────────────────────────
const LANGS = {
  en: {
    label: "English", navSub: "AI Disease Detection",
    hero1: "Upload a leaf.", hero2: "We'll do the rest.",
    heroSub: "A clear photo of the affected leaf is all we need to identify the disease.",
    dropTitle: "Drop your image here", dropSub: "or click to browse", chooseFile: "Choose file", takePhoto: "Take Photo 📷",
    analyzing: "Analyzing…", detected: "Detected", healthy: "Healthy", diseased: "Diseased",
    confidence: "Confidence", downloadPdf: "↓ Download Full Report (PDF)",
    tryAnother: "Try another way", supports: "Supports JPG · PNG · WEBP",
    aboutCondition: "About this condition", symptoms: "Symptoms", cause: "Cause",
    treatment: "Treatment", prevention: "Prevention", severity: "Severity",
    scanHistory: "Scan History", scans: "scans saved", scan: "scan saved",
    clearAll: "Clear all", processing: "Processing…",
    serverError: "Cannot reach the server. Make sure main.py is running on port 8000.",
    severeAlert: "⚠️ SEVERE DISEASE DETECTED — Immediate Action Required",
    immediateActions: "Immediate Actions",
    weatherTitle: "Current Weather", weatherRisk: "Disease Risk",
    lowRisk: "Low Risk", moderateRisk: "Moderate Risk", highRisk: "High Risk",
    humidity: "Humidity", temp: "Temp", wind: "Wind",
    nearbyStores: "Nearby Agri-Stores", locating: "Locating stores near you…",
    locationError: "Enable location to find nearby stores",
    storeOpen: "Open", storeClosed: "Closed",
    listenDiagnosis: "🔊 Listen to Diagnosis",
    stopListening: "⏹ Stop",
    aiChat: "Ask PlantPulse AI", chatPlaceholder: "Ask about this disease, treatment, or prevention…",
    chatSend: "Send", chatThinking: "Thinking…",
    weatherWarning: "⚠️ High disease risk: current conditions favour",
    navHome: "Home", navScan: "Scan", navWeather: "Weather", navHistory: "Search History",
    navAI: "PlantPulse AI", navDashboard: "Dashboard", navStores: "Agri-Stores", noHistory: "Your scans will appear here.",
    aiWelcome: "Ask me about plant health, symptoms, treatment, or prevention.",
    voiceInput: "Ask with voice", voiceUnavailable: "Voice input is not supported in this browser.",
    listening: "Listening…", scanPreparing: "Preparing image", scanInspecting: "Inspecting leaf patterns",
    scanMatching: "Matching plant health data", weatherLoading: "Reading local conditions…",
  },
  hi: {
    label: "हिंदी", navSub: "AI रोग पहचान",
    hero1: "पत्ती की फोटो अपलोड करें।", hero2: "बाकी हम करेंगे।",
    heroSub: "रोगग्रस्त पत्ती की एक स्पष्ट फोटो हमें बीमारी पहचानने के लिए काफी है।",
    dropTitle: "यहाँ फोटो छोड़ें", dropSub: "या ब्राउज़ करने के लिए क्लिक करें", chooseFile: "फ़ाइल चुनें", takePhoto: "फोटो लें 📷",
    analyzing: "विश्लेषण हो रहा है…", detected: "पहचाना गया", healthy: "स्वस्थ", diseased: "रोगग्रस्त",
    confidence: "विश्वसनीयता", downloadPdf: "↓ पूरी रिपोर्ट डाउनलोड करें (PDF)",
    tryAnother: "दूसरा तरीका आज़माएं", supports: "JPG · PNG · WEBP समर्थित",
    aboutCondition: "इस रोग के बारे में", symptoms: "लक्षण", cause: "कारण",
    treatment: "उपचार", prevention: "रोकथाम", severity: "गंभीरता",
    scanHistory: "स्कैन इतिहास", scans: "स्कैन सहेजे गए", scan: "स्कैन सहेजा गया",
    clearAll: "सब हटाएं", processing: "प्रसंस्करण…",
    serverError: "सर्वर से संपर्क नहीं हो सका।",
    severeAlert: "⚠️ गंभीर रोग पाया गया — तत्काल कार्रवाई आवश्यक",
    immediateActions: "तत्काल कदम",
    weatherTitle: "मौजूदा मौसम", weatherRisk: "रोग जोखिम",
    lowRisk: "कम जोखिम", moderateRisk: "मध्यम जोखिम", highRisk: "उच्च जोखिम",
    humidity: "नमी", temp: "तापमान", wind: "हवा",
    nearbyStores: "पास की कृषि दुकानें", locating: "पास की दुकानें ढूंढ रहे हैं…",
    locationError: "पास की दुकानें खोजने के लिए स्थान सक्षम करें",
    storeOpen: "खुली", storeClosed: "बंद",
    listenDiagnosis: "🔊 निदान सुनें",
    stopListening: "⏹ रोकें",
    aiChat: "PlantPulse AI से पूछें", chatPlaceholder: "इस रोग, उपचार या रोकथाम के बारे में पूछें…",
    chatSend: "भेजें", chatThinking: "सोच रहा है…",
    weatherWarning: "⚠️ उच्च रोग जोखिम: वर्तमान स्थितियां अनुकूल हैं",
    navHome: "होम", navScan: "स्कैन", navWeather: "मौसम", navHistory: "खोज इतिहास",
    navAI: "PlantPulse AI", navDashboard: "डैशबोर्ड", navStores: "कृषि दुकानें", noHistory: "आपके स्कैन यहाँ दिखाई देंगे।",
    aiWelcome: "पौधों के स्वास्थ्य, लक्षण, उपचार या रोकथाम के बारे में पूछें।",
    voiceInput: "आवाज़ से पूछें", voiceUnavailable: "यह ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।",
    listening: "सुन रहा हूँ…", scanPreparing: "फोटो तैयार हो रही है", scanInspecting: "पत्ती के पैटर्न जाँचे जा रहे हैं",
    scanMatching: "पौध स्वास्थ्य डेटा से मिलान", weatherLoading: "स्थानीय मौसम पढ़ रहे हैं…",
  },
  mr: {
    label: "मराठी", navSub: "AI रोग ओळख",
    hero1: "पानाचा फोटो अपलोड करा।", hero2: "बाकी आम्ही करू।",
    heroSub: "रोगग्रस्त पानाचा एक स्पष्ट फोटो रोग ओळखण्यासाठी पुरेसा आहे।",
    dropTitle: "इथे फोटो टाका", dropSub: "किंवा ब्राउझ करण्यासाठी क्लिक करा", chooseFile: "फाइल निवडा",
    analyzing: "विश्लेषण होत आहे…", detected: "ओळखले", healthy: "निरोगी", diseased: "रोगग्रस्त",
    confidence: "विश्वासार्हता", downloadPdf: "↓ संपूर्ण अहवाल डाउनलोड करा (PDF)",
    tryAnother: "दुसरा फोटो वापरा", supports: "JPG · PNG · WEBP समर्थित",
    aboutCondition: "या रोगाबद्दल", symptoms: "लक्षणे", cause: "कारण",
    treatment: "उपचार", prevention: "प्रतिबंध", severity: "तीव्रता",
    scanHistory: "स्कॅन इतिहास", scans: "स्कॅन जतन केले", scan: "स्कॅन जतन केला",
    clearAll: "सर्व साफ करा", processing: "प्रक्रिया होत आहे…",
    serverError: "सर्व्हरशी संपर्क होऊ शकला नाही।",
    severeAlert: "⚠️ गंभीर रोग आढळला — त्वरित कारवाई आवश्यक",
    immediateActions: "त्वरित पावले",
    weatherTitle: "सध्याचे हवामान", weatherRisk: "रोग धोका",
    lowRisk: "कमी धोका", moderateRisk: "मध्यम धोका", highRisk: "उच्च धोका",
    humidity: "आर्द्रता", temp: "तापमान", wind: "वारा",
    nearbyStores: "जवळील कृषी दुकाने", locating: "जवळील दुकाने शोधत आहे…",
    locationError: "जवळील दुकाने शोधण्यासाठी स्थान सक्षम करा",
    storeOpen: "उघडे", storeClosed: "बंद",
    listenDiagnosis: "🔊 निदान ऐका",
    stopListening: "⏹ थांबा",
    aiChat: "PlantPulse AI ला विचारा", chatPlaceholder: "या रोगाबद्दल, उपचार किंवा प्रतिबंधाबद्दल विचारा…",
    chatSend: "पाठवा", chatThinking: "विचार करत आहे…",
    weatherWarning: "⚠️ उच्च रोग धोका: सध्याच्या परिस्थिती अनुकूल आहेत",
  },
  pa: {
    label: "ਪੰਜਾਬੀ", navSub: "AI ਬਿਮਾਰੀ ਪਛਾਣ",
    hero1: "ਪੱਤੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।", hero2: "ਬਾਕੀ ਅਸੀਂ ਕਰਾਂਗੇ।",
    heroSub: "ਰੋਗੀ ਪੱਤੇ ਦੀ ਇੱਕ ਸਾਫ਼ ਫੋਟੋ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ ਲਈ ਕਾਫ਼ੀ ਹੈ।",
    dropTitle: "ਇੱਥੇ ਫੋਟੋ ਸੁੱਟੋ", dropSub: "ਜਾਂ ਬ੍ਰਾਊਜ਼ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ", chooseFile: "ਫ਼ਾਈਲ ਚੁਣੋ",
    analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ…", detected: "ਪਛਾਣਿਆ ਗਿਆ", healthy: "ਸਿਹਤਮੰਦ", diseased: "ਬਿਮਾਰ",
    confidence: "ਭਰੋਸੇਯੋਗਤਾ", downloadPdf: "↓ ਪੂਰੀ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ (PDF)",
    tryAnother: "ਦੂਜੀ ਫੋਟੋ ਅਜ਼ਮਾਓ", supports: "JPG · PNG · WEBP ਸਮਰਥਿਤ",
    aboutCondition: "ਇਸ ਬਿਮਾਰੀ ਬਾਰੇ", symptoms: "ਲੱਛਣ", cause: "ਕਾਰਨ",
    treatment: "ਇਲਾਜ", prevention: "ਰੋਕਥਾਮ", severity: "ਗੰਭੀਰਤਾ",
    scanHistory: "ਸਕੈਨ ਇਤਿਹਾਸ", scans: "ਸਕੈਨ ਸੁਰੱਖਿਅਤ", scan: "ਸਕੈਨ ਸੁਰੱਖਿਅਤ",
    clearAll: "ਸਭ ਸਾਫ਼ ਕਰੋ", processing: "ਪ੍ਰੋਸੈਸਿੰਗ…",
    serverError: "ਸਰਵਰ ਤੱਕ ਪਹੁੰਚ ਨਹੀਂ ਹੋ ਸਕੀ।",
    severeAlert: "⚠️ ਗੰਭੀਰ ਬਿਮਾਰੀ ਮਿਲੀ — ਤੁਰੰਤ ਕਾਰਵਾਈ ਜ਼ਰੂਰੀ",
    immediateActions: "ਤੁਰੰਤ ਕਦਮ",
    weatherTitle: "ਮੌਜੂਦਾ ਮੌਸਮ", weatherRisk: "ਰੋਗ ਖਤਰਾ",
    lowRisk: "ਘੱਟ ਖਤਰਾ", moderateRisk: "ਦਰਮਿਆਨਾ ਖਤਰਾ", highRisk: "ਵੱਧ ਖਤਰਾ",
    humidity: "ਨਮੀ", temp: "ਤਾਪਮਾਨ", wind: "ਹਵਾ",
    nearbyStores: "ਨੇੜੇ ਦੀਆਂ ਖੇਤੀ ਦੁਕਾਨਾਂ", locating: "ਨੇੜੇ ਦੀਆਂ ਦੁਕਾਨਾਂ ਲੱਭ ਰਹੇ ਹਾਂ…",
    locationError: "ਨੇੜੇ ਦੀਆਂ ਦੁਕਾਨਾਂ ਲੱਭਣ ਲਈ ਸਥਾਨ ਚਾਲੂ ਕਰੋ",
    storeOpen: "ਖੁੱਲ੍ਹੀ", storeClosed: "ਬੰਦ",
    listenDiagnosis: "🔊 ਨਿਦਾਨ ਸੁਣੋ",
    stopListening: "⏹ ਰੋਕੋ",
    aiChat: "PlantPulse AI ਤੋਂ ਪੁੱਛੋ", chatPlaceholder: "ਇਸ ਬਿਮਾਰੀ ਬਾਰੇ ਪੁੱਛੋ…",
    chatSend: "ਭੇਜੋ", chatThinking: "ਸੋਚ ਰਿਹਾ ਹੈ…",
    weatherWarning: "⚠️ ਵੱਧ ਰੋਗ ਖਤਰਾ: ਮੌਜੂਦਾ ਹਾਲਾਤ ਅਨੁਕੂਲ ਹਨ",
  },
  gu: {
    label: "ગુજરાતી", navSub: "AI રોગ ઓળખ",
    hero1: "પાનની ફોટો અપલોડ કરો।", hero2: "બાકી અમે કરીશું।",
    heroSub: "રોગગ્રસ્ત પાનની એક સ્પષ્ટ ફોટો રોગ ઓળખવા માટે પૂરતી છે।",
    dropTitle: "અહીં ફોટો મૂકો", dropSub: "અથવા બ્રાઉઝ કરવા ક્લિક કરો", chooseFile: "ફાઇલ પસંદ કરો",
    analyzing: "વિશ્લેષણ થઈ રહ્યું છે…", detected: "ઓળખાયું", healthy: "સ્વસ્થ", diseased: "રોગગ્રસ્ત",
    confidence: "વિશ્વસનીયતા", downloadPdf: "↓ સંપૂર્ણ રિપોર્ટ ડાઉનલોડ કરો (PDF)",
    tryAnother: "બીજી ફોટો અજમાવો", supports: "JPG · PNG · WEBP સમર્થિત",
    aboutCondition: "આ રોગ વિશે", symptoms: "લક્ષણો", cause: "કારણ",
    treatment: "સારવાર", prevention: "નિવારણ", severity: "તીવ્રતા",
    scanHistory: "સ્કેન ઇતિહાસ", scans: "સ્કેન સાચવ્યા", scan: "સ્કેન સાચવ્યો",
    clearAll: "બધા સાફ કરો", processing: "પ્રોસેસિંગ…",
    serverError: "સર્વર સુધી પહોંચી શકાયું નહીં।",
    severeAlert: "⚠️ ગંભીર રોગ મળ્યો — તાત્કાલિક પગલાં જરૂરી",
    immediateActions: "તાત્કાલિક પગલાં",
    weatherTitle: "હાલનું હવામાન", weatherRisk: "રોગ જોખમ",
    lowRisk: "ઓછું જોખમ", moderateRisk: "મધ્યમ જોખમ", highRisk: "ઊંચું જોખમ",
    humidity: "ભેજ", temp: "તાપમાન", wind: "પવન",
    nearbyStores: "નજીકની કૃષિ દુકાનો", locating: "નજીકની દુકાનો શોધી રહ્યા છીએ…",
    locationError: "નજીકની દુકાનો શોધવા સ્થાન સક્ષમ કરો",
    storeOpen: "ખુલ્લી", storeClosed: "બંધ",
    listenDiagnosis: "🔊 નિદાન સાંભળો",
    stopListening: "⏹ અટકો",
    aiChat: "PlantPulse AI ને પૂછો", chatPlaceholder: "આ રોગ વિશે પૂછો…",
    chatSend: "મોકલો", chatThinking: "વિચારી રહ્યો છે…",
    weatherWarning: "⚠️ ઊંચું રોગ જોખમ: હાલની પરિસ્થિતિ અનુકૂળ",
  },
  te: {
    label: "తెలుగు", navSub: "AI వ్యాధి గుర్తింపు",
    hero1: "ఆకు ఫోటో అప్‌లోడ్ చేయండి.", hero2: "మిగతా మేము చేస్తాం.",
    heroSub: "వ్యాధిగ్రస్త ఆకు స్పష్టమైన ఫోటో వ్యాధిని గుర్తించడానికి సరిపోతుంది.",
    dropTitle: "ఇక్కడ ఫోటో వదలండి", dropSub: "లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి", chooseFile: "ఫైల్ ఎంచుకోండి",
    analyzing: "విశ్లేషిస్తున్నాం…", detected: "గుర్తించబడింది", healthy: "ఆరోగ్యకరమైన", diseased: "వ్యాధిగ్రస్త",
    confidence: "నమ్మకం", downloadPdf: "↓ పూర్తి నివేదిక డౌన్‌లోడ్ చేయండి (PDF)",
    tryAnother: "మరో ఫోటో ప్రయత్నించండి", supports: "JPG · PNG · WEBP మద్దతు",
    aboutCondition: "ఈ వ్యాధి గురించి", symptoms: "లక్షణాలు", cause: "కారణం",
    treatment: "చికిత్స", prevention: "నివారణ", severity: "తీవ్రత",
    scanHistory: "స్కాన్ చరిత్ర", scans: "స్కాన్‌లు సేవ్ చేయబడ్డాయి", scan: "స్కాన్ సేవ్ చేయబడింది",
    clearAll: "అన్నీ తొలగించు", processing: "ప్రాసెస్ అవుతోంది…",
    serverError: "సర్వర్‌కు చేరుకోలేకపోయాం।",
    severeAlert: "⚠️ తీవ్రమైన వ్యాధి గుర్తించబడింది — తక్షణ చర్య అవసరం",
    immediateActions: "తక్షణ చర్యలు",
    weatherTitle: "ప్రస్తుత వాతావరణం", weatherRisk: "వ్యాధి ప్రమాదం",
    lowRisk: "తక్కువ ప్రమాదం", moderateRisk: "మధ్యస్థ ప్రమాదం", highRisk: "అధిక ప్రమాదం",
    humidity: "తేమ", temp: "ఉష్ణోగ్రత", wind: "గాలి",
    nearbyStores: "సమీప వ్యవసాయ దుకాణాలు", locating: "సమీప దుకాణాలు వెతుకుతున్నాం…",
    locationError: "సమీప దుకాణాలు కనుగొనడానికి స్థానం ఆన్ చేయండి",
    storeOpen: "తెరిచి", storeClosed: "మూసివేసి",
    listenDiagnosis: "🔊 రోగనిర్ధారణ వినండి",
    stopListening: "⏹ ఆపండి",
    aiChat: "PlantPulse AI ని అడగండి", chatPlaceholder: "ఈ వ్యాధి గురించి అడగండి…",
    chatSend: "పంపండి", chatThinking: "ఆలోచిస్తున్నాను…",
    weatherWarning: "⚠️ అధిక వ్యాధి ప్రమాదం: ప్రస్తుత పరిస్థితులు అనుకూలంగా ఉన్నాయి",
  },
};

// ─── DISEASE DATABASE ─────────────────────────────────────────────────────────
const DISEASE_DB = {
  Pepper__bell___Bacterial_spot: {
    severity: "Moderate",
    immediateActions: ["Apply copper-based bactericide immediately", "Remove infected leaves", "Isolate plant from others"],
    en: { description: "Bacterial spot is caused by Xanthomonas bacteria, appearing as small water-soaked lesions on leaves and fruits that turn dark brown.", symptoms: ["Small dark brown lesions on leaves","Water-soaked spots on fruit","Yellow halo around spots","Premature leaf drop"], causes: "Caused by Xanthomonas campestris pv. vesicatoria. Spreads through water splash, infected seeds, and plant debris.", treatment: ["Apply copper-based bactericides every 7–10 days","Remove and destroy infected plant material","Avoid overhead irrigation","Use certified disease-free seeds"], prevention: ["Rotate crops every 2–3 years","Use resistant varieties","Maintain proper plant spacing for airflow","Sanitize tools between plants"] },
    hi: { description: "बैक्टीरियल स्पॉट रोग Xanthomonas बैक्टीरिया के कारण होता है।", symptoms: ["पत्तियों पर छोटे गहरे भूरे धब्बे","फल पर पानी से भीगे दाग","धब्बों के चारों ओर पीला घेरा","समय से पहले पत्तियां गिरना"], causes: "Xanthomonas campestris पानी के छींटे से फैलता है।", treatment: ["हर 7–10 दिन में तांबे का छिड़काव करें","संक्रमित पौधों को हटाएं","ऊपर से पानी न दें","रोगमुक्त बीज उपयोग करें"], prevention: ["2–3 साल में फसल बदलें","प्रतिरोधी किस्में लगाएं","उचित दूरी रखें","उपकरण साफ करें"] },
    mr: { description: "बॅक्टेरियल स्पॉट Xanthomonas जीवाणूंमुळे होतो।", symptoms: ["पानांवर लहान गडद डाग","फळांवर पाण्यासारखे डाग","पिवळी कडा","पाने गळणे"], causes: "Xanthomonas campestris पाण्याद्वारे पसरते.", treatment: ["7–10 दिवसांनी तांबे फवारणी","संक्रमित पाने काढा","वरून पाणी देऊ नका","प्रमाणित बियाणे वापरा"], prevention: ["पीक बदल करा","प्रतिरोधक जाती","योग्य अंतर","उपकरणे स्वच्छ"] },
    pa: { description: "ਬੈਕਟੀਰੀਅਲ ਸਪੌਟ Xanthomonas ਕਾਰਨ ਹੁੰਦਾ ਹੈ।", symptoms: ["ਪੱਤਿਆਂ 'ਤੇ ਧੱਬੇ","ਫਲਾਂ 'ਤੇ ਦਾਗ","ਪੀਲਾ ਘੇਰਾ","ਪੱਤੇ ਡਿੱਗਣਾ"], causes: "Xanthomonas ਪਾਣੀ ਤੋਂ ਫੈਲਦਾ ਹੈ।", treatment: ["ਤਾਂਬੇ ਦੀ ਦਵਾਈ ਛਿੜਕੋ","ਸੰਕਰਮਿਤ ਪੱਤੇ ਹਟਾਓ","ਉੱਪਰੋਂ ਪਾਣੀ ਨਾ ਦਿਓ","ਰੋਗਮੁਕਤ ਬੀਜ"], prevention: ["ਫਸਲ ਬਦਲੋ","ਰੋਧਕ ਕਿਸਮਾਂ","ਸਹੀ ਦੂਰੀ","ਔਜ਼ਾਰ ਸਾਫ਼"] },
    gu: { description: "બેક્ટેરિયલ સ્પોટ Xanthomonas બેક્ટેરિયાથી થાય છે.", symptoms: ["પાંદડા પર ડાઘ","ફળ પર ડાઘ","પીળો ઘેરો","પાન ખરવા"], causes: "Xanthomonas પાણી દ્વારા ફેલાય.", treatment: ["તાંબા ફૂગનાશક છાંટો","ચેપ લાગેલ ભાગ કાઢો","ઉપરથી પાણી ન આપો","પ્રમાણિત બીજ"], prevention: ["પાક ફેરવો","નિરોધક જાતો","યોગ્ય અંતર","સાધનો સ્વચ્છ"] },
    te: { description: "బాక్టీరియల్ స్పాట్ Xanthomonas వల్ల కలుగుతుంది.", symptoms: ["ఆకులపై మచ్చలు","పండ్లపై మచ్చలు","పసుపు వలయం","ఆకులు రాలడం"], causes: "Xanthomonas నీటి ద్వారా వ్యాపిస్తుంది.", treatment: ["రాగి మందు పిచికారి","సోకిన భాగాలు తొలగించు","పైన నీరు వేయకు","రోగముక్త విత్తనాలు"], prevention: ["పంట మార్చు","నిరోధక రకాలు","సరైన దూరం","పనిముట్లు శుభ్రం"] },
  },
  Pepper__bell___healthy: {
    severity: "None", immediateActions: [],
    en: { description: "Your pepper plant appears healthy with no signs of disease. Continue your current care routine.", symptoms: ["No symptoms detected"], causes: "N/A", treatment: ["No treatment needed"], prevention: ["Continue regular watering","Monitor for early signs of stress","Maintain balanced fertilization"] },
    hi: { description: "आपका मिर्च का पौधा स्वस्थ दिखता है।", symptoms: ["कोई लक्षण नहीं"], causes: "लागू नहीं", treatment: ["उपचार आवश्यक नहीं"], prevention: ["नियमित पानी दें","ध्यान रखें","संतुलित खाद"] },
    mr: { description: "तुमचे मिरचीचे झाड निरोगी दिसते.", symptoms: ["कोणतेही लक्षण नाही"], causes: "लागू नाही", treatment: ["उपचाराची गरज नाही"], prevention: ["नियमित पाणी द्या","लक्ष ठेवा","संतुलित खत"] },
    pa: { description: "ਤੁਹਾਡਾ ਮਿਰਚ ਦਾ ਪੌਦਾ ਸਿਹਤਮੰਦ ਹੈ।", symptoms: ["ਕੋਈ ਲੱਛਣ ਨਹੀਂ"], causes: "ਲਾਗੂ ਨਹੀਂ", treatment: ["ਇਲਾਜ ਜ਼ਰੂਰੀ ਨਹੀਂ"], prevention: ["ਨਿਯਮਿਤ ਪਾਣੀ","ਨਿਗਰਾਨੀ","ਸੰਤੁਲਿਤ ਖਾਦ"] },
    gu: { description: "તમારો મરચાનો છોડ સ્વસ્થ છે.", symptoms: ["કોઈ લક્ષણ નથી"], causes: "લાગુ નહીં", treatment: ["સારવારની જ ઊઠ "], prevention: ["નિયમિત પાણી","નિરીક્ષણ","સંતુલિત ખાતર"] },
    te: { description: "మీ మిర్చి మొక్క ఆరోగ్యంగా ఉంది.", symptoms: ["ఏ లక్షణాలూ లేవు"], causes: "వర్తించదు", treatment: ["చికిత్స అవసరం లేదు"], prevention: ["నిత్యం నీరు","పరిశీలించండి","సమతుల్య ఎరువు"] },
  },
  Potato___Early_blight: {
    severity: "Moderate", immediateActions: ["Apply mancozeb fungicide immediately", "Remove lower infected leaves", "Reduce overhead watering"],
    en: { description: "Early blight is a fungal disease caused by Alternaria solani, producing characteristic target-like spots on older leaves first.", symptoms: ["Circular dark brown spots with concentric rings","Yellow halo surrounding lesions","Starts on older lower leaves","Severe defoliation in advanced stages"], causes: "Caused by Alternaria solani. Favoured by warm temperatures (24–29°C) and high humidity.", treatment: ["Apply chlorothalonil or mancozeb fungicides","Remove infected leaves immediately","Improve air circulation","Avoid wetting foliage"], prevention: ["Use certified disease-free seed tubers","Rotate crops with non-solanaceous plants","Apply preventive fungicides","Maintain adequate plant nutrition"] },
    hi: { description: "अर्ली ब्लाइट Alternaria solani फफूंद के कारण होता है।", symptoms: ["गोलाकार भूरे धब्बे","पीला घेरा","पुरानी पत्तियों से शुरू","पत्तियां झड़ना"], causes: "Alternaria solani गर्म नम में पनपता है।", treatment: ["क्लोरोथेलोनिल लगाएं","संक्रमित पत्तियां हटाएं","हवा का प्रवाह बढ़ाएं","पत्तियां न भिगोएं"], prevention: ["रोगमुक्त बीज","फसल चक्र","निवारक फफूंदनाशक","पर्याप्त पोषण"] },
    mr: { description: "अर्ली ब्लाइट Alternaria solani मुळे होतो.", symptoms: ["गोलाकार डाग","पिवळी कडा","जुन्या पानांपासून","पाने गळणे"], causes: "Alternaria solani उबदार दमट वातावरणात वाढते.", treatment: ["मँकोझेब फवारा","संक्रमित पाने काढा","हवा सुधारा","पाने भिजवू नका"], prevention: ["प्रमाणित बियाणे","पीक बदल","बुरशीनाशक","पोषण"] },
    pa: { description: "ਅਰਲੀ ਬਲਾਈਟ Alternaria solani ਕਾਰਨ ਹੁੰਦਾ ਹੈ।", symptoms: ["ਗੋਲ ਧੱਬੇ","ਪੀਲਾ ਘੇਰਾ","ਪੁਰਾਣੇ ਪੱਤਿਆਂ ਤੋਂ","ਪੱਤੇ ਡਿੱਗਣਾ"], causes: "Alternaria solani ਗਰਮ ਨਮੀ ਵਿੱਚ ਵਧਦੀ ਹੈ।", treatment: ["ਮੈਂਕੋਜ਼ੇਬ ਵਰਤੋ","ਸੰਕਰਮਿਤ ਪੱਤੇ ਹਟਾਓ","ਹਵਾ ਵਧਾਓ","ਪੱਤੇ ਨਾ ਭਿੱਜਣ ਦਿਓ"], prevention: ["ਪ੍ਰਮਾਣਿਤ ਬੀਜ","ਫਸਲ ਬਦਲੋ","ਦਵਾਈ","ਪੋਸ਼ਣ"] },
    gu: { description: "અર્લી બ્લાઈટ Alternaria solani ફૂગથી થાય છે.", symptoms: ["ગોળ ડાઘ","પીળો ઘેરો","જૂના પાન","પાન ખરવા"], causes: "Alternaria solani ગરમ ભેજ ભરી.", treatment: ["મૅન્કોઝેબ છાંટો","ચેપ પામેલ પાન કાઢો","હવા સુધારો","ભીના ન કરો"], prevention: ["પ્રમાણિત બીજ","પાક ફેરવો","ફૂગનાશક","પોષણ"] },
    te: { description: "అర్లీ బ్లైట్ Alternaria solani వల్ల కలుగుతుంది.", symptoms: ["గుండ్రటి మచ్చలు","పసుపు వలయం","పాత ఆకులు","ఆకులు రాలడం"], causes: "Alternaria solani వేడి తేమలో వ్యాపిస్తుంది.", treatment: ["మాంకోజెబ్ పిచికారి","సోకిన ఆకులు తొలగించు","గాలి సరిచేయి","ఆకులు తడవకు"], prevention: ["ధృవీకరించిన విత్తనాలు","పంట మార్చు","మందు","పోషణ"] },
  },
  Potato___Late_blight: {
    severity: "Severe", immediateActions: ["Apply metalaxyl fungicide IMMEDIATELY","Remove ALL infected plants and burn them","Do NOT compost infected material","Alert neighboring farmers"],
    en: { description: "Late blight, caused by Phytophthora infestans, is one of the most devastating plant diseases — responsible for the Irish Potato Famine.", symptoms: ["Water-soaked pale green to brown lesions","White fungal growth on leaf undersides","Rapid browning and death of foliage","Dark sunken lesions on tubers"], causes: "Phytophthora infestans. Spreads rapidly in cool, moist conditions (10–20°C) and humidity above 90%.", treatment: ["Apply systemic fungicides (metalaxyl) immediately","Remove all infected plant material and destroy","Avoid composting infected debris","Hill up soil around stems to protect tubers"], prevention: ["Plant resistant varieties","Ensure good drainage and airflow","Monitor weather for high-risk periods","Apply protectant fungicides preventively"] },
    hi: { description: "लेट ब्लाइट Phytophthora infestans के कारण होता है — आयरलैंड के आलू अकाल का कारण।", symptoms: ["पानी से भीगे धब्बे","सफेद फफूंद","पत्तियों का भूरापन","कंद पर घाव"], causes: "Phytophthora infestans ठंडी नम में फैलता है।", treatment: ["तुरंत मेटालैक्सिल लगाएं","सभी संक्रमित हटाएं","खाद न बनाएं","मिट्टी चढ़ाएं"], prevention: ["प्रतिरोधी किस्में","अच्छी जल निकासी","मौसम देखें","निवारक दवा"] },
    mr: { description: "लेट ब्लाइट Phytophthora infestans मुळे होतो.", symptoms: ["पाण्यासारखे डाग","पांढरी बुरशी","झपाट्याने तपकिरी","कंदावर व्रण"], causes: "Phytophthora infestans थंड दमट वातावरण.", treatment: ["मेटॅलॅक्सिल वापरा","संक्रमित झाडे नष्ट करा","खत करू नका","माती लावा"], prevention: ["प्रतिरोधक जाती","चांगला निचरा","हवामान","बुरशीनाशक"] },
    pa: { description: "ਲੇਟ ਬਲਾਈਟ Phytophthora infestans ਕਾਰਨ ਹੁੰਦਾ ਹੈ।", symptoms: ["ਪਾਣੀ ਵਰਗੇ ਧੱਬੇ","ਚਿੱਟੀ ਉੱਲੀ","ਭੂਰਾ ਹੋਣਾ","ਕੰਦਾਂ 'ਤੇ ਧੱਬੇ"], causes: "Phytophthora infestans ਠੰਡੀ ਨਮੀ ਵਿੱਚ।", treatment: ["ਮੇਟੀਲੈਕਸਿਲ ਵਰਤੋ","ਸੰਕਰਮਿਤ ਨਸ਼ਟ ਕਰੋ","ਖਾਦ ਨਾ ਬਣਾਓ","ਮਿੱਟੀ ਚੜ੍ਹਾਓ"], prevention: ["ਰੋਧਕ ਕਿਸਮਾਂ","ਨਿਕਾਸੀ","ਮੌਸਮ","ਦਵਾਈ"] },
    gu: { description: "લૅટ બ્લાઈટ Phytophthora infestans થી થાય છે.", symptoms: ["પાણી જેવા ડાઘ","સફેદ ફૂગ","ઝડપ ભૂરા","કંદ ઘા"], causes: "Phytophthora infestans ઠંડી ભેજ.", treatment: ["મૅટૅલૅક્સિલ છાંટો","ચેપ નાશ","ખાતર ન","માટી ચઢાવો"], prevention: ["નિરોધક","ગટર","હવામાન","ફૂગનાશક"] },
    te: { description: "లేట్ బ్లైట్ Phytophthora infestans వల్ల కలుగుతుంది.", symptoms: ["నీటి మచ్చలు","తెల్లని శిలీంధ్రం","వేగంగా గోధుమ","దుంపలపై మచ్చలు"], causes: "Phytophthora infestans చల్లని తేమలో.", treatment: ["మెటాలాక్సిల్ వెంటనే","సోకిన మొక్కలు నాశనం","కంపోస్ట్ వద్దు","మట్టి వేయి"], prevention: ["నిరోధక రకాలు","నీటి పారుదల","వాతావరణం","మందు"] },
  },
  Potato___healthy: {
    severity: "None", immediateActions: [],
    en: { description: "Your potato plant looks healthy.", symptoms: ["No symptoms detected"], causes: "N/A", treatment: ["No treatment needed"], prevention: ["Regular monitoring","Proper irrigation","Balanced fertilization","Crop rotation"] },
    hi: { description: "आपका आलू का पौधा स्वस्थ है।", symptoms: ["कोई लक्षण नहीं"], causes: "लागू नहीं", treatment: ["उपचार की जरूरत नहीं"], prevention: ["निगरानी","सिंचाई","खाद","फसल बदलें"] },
    mr: { description: "तुमचे बटाट्याचे झाड निरोगी आहे.", symptoms: ["कोणतेही लक्षण नाही"], causes: "लागू नाही", treatment: ["उपचाराची गरज नाही"], prevention: ["देखरेख","सिंचन","खत","पीक बदल"] },
    pa: { description: "ਤੁਹਾਡਾ ਆਲੂ ਦਾ ਪੌਦਾ ਸਿਹਤਮੰਦ ਹੈ।", symptoms: ["ਕੋਈ ਲੱਛਣ ਨਹੀਂ"], causes: "ਲਾਗੂ ਨਹੀਂ", treatment: ["ਇਲਾਜ ਦੀ ਲੋੜ ਨਹੀਂ"], prevention: ["ਨਿਗਰਾਨੀ","ਸਿੰਚਾਈ","ਖਾਦ","ਫਸਲ ਬਦਲੋ"] },
    gu: { description: "તમારો બટાટાનો છોડ સ્વસ્થ છે.", symptoms: ["કોઈ લક્ષણ નથી"], causes: "લાગુ નહીં", treatment: ["સારવારની જ "], prevention: ["નિરીક્ષણ","સિંચાઈ","ખાતર","પાક ફેરવો"] },
    te: { description: "మీ బంగాళాదుంప మొక్క ఆరోగ్యంగా ఉంది.", symptoms: ["ఏ లక్షణాలూ లేవు"], causes: "వర్తించదు", treatment: ["చికిత్స అవసరం లేదు"], prevention: ["పరిశీలించండి","నీరు","ఎరువు","పంట మార్చు"] },
  },
  Tomato_healthy: {
    severity: "None", immediateActions: [],
    en: { description: "Your tomato plant is healthy!", symptoms: ["No symptoms detected"], causes: "N/A", treatment: ["No treatment needed"], prevention: ["Regular watering","Monitor weekly","Good airflow","Rotate crops"] },
    hi: { description: "आपका टमाटर स्वस्थ है!", symptoms: ["कोई लक्षण नहीं"], causes: "लागू नहीं", treatment: ["उपचार नहीं"], prevention: ["पानी दें","निगरानी","हवा","फसल बदलें"] },
    mr: { description: "टोमॅटो निरोगी आहे!", symptoms: ["लक्षण नाही"], causes: "लागू नाही", treatment: ["उपचार नाही"], prevention: ["पाणी","तपासणी","हवा","पीक बदल"] },
    pa: { description: "ਟਮਾਟਰ ਸਿਹਤਮੰਦ ਹੈ!", symptoms: ["ਲੱਛਣ ਨਹੀਂ"], causes: "ਲਾਗੂ ਨਹੀਂ", treatment: ["ਇਲਾਜ ਨਹੀਂ"], prevention: ["ਪਾਣੀ","ਨਿਗਰਾਨੀ","ਹਵਾ","ਫਸਲ ਬਦਲੋ"] },
    gu: { description: "ટામેટા સ્વસ્થ છે!", symptoms: ["લક્ષણ નથી"], causes: "લાગુ નહીં", treatment: ["સારવાર નહીં"], prevention: ["પાણી","નિરીક્ષણ","હવા","પાક ફેરવો"] },
    te: { description: "టమాటా ఆరోగ్యంగా ఉంది!", symptoms: ["లక్షణాలు లేవు"], causes: "వర్తించదు", treatment: ["చికిత్స లేదు"], prevention: ["నీరు","పరిశీలించు","గాలి","పంట మార్చు"] },
  },
};

const TOMATO_DISEASES_EN = {
  Tomato_Bacterial_spot: { severity: "Moderate", immediateActions: ["Apply copper bactericide","Remove infected parts","Avoid wet foliage"], description: "Bacterial spot affects tomato leaves, stems, and fruit.", symptoms: ["Small water-soaked spots","Dark brown with yellow margins","Scab-like spots on fruit","Defoliation"], causes: "Xanthomonas species. Spreads through rain splash.", treatment: ["Copper bactericides + mancozeb","Remove infected parts","Avoid working when wet","Regular protective sprays"], prevention: ["Certified seeds","Avoid overhead irrigation","Rotate annually","Disinfect tools"] },
  Tomato_Early_blight: { severity: "Moderate", immediateActions: ["Apply mancozeb fungicide","Remove lower leaves","Mulch soil"], description: "Early blight on tomatoes caused by Alternaria solani.", symptoms: ["Dark concentric ring spots","Yellow tissue around lesions","Stem lesions near soil","Sunken dark spots on fruit"], causes: "Alternaria solani, warm humid conditions.", treatment: ["Apply mancozeb or azoxystrobin","Remove infected leaves","Mulch to reduce splash","Consistent watering"], prevention: ["Stake plants for airflow","Avoid excess nitrogen","Rotate crops","Use resistant varieties"] },
  Tomato_Late_blight: { severity: "Severe", immediateActions: ["Apply metalaxyl IMMEDIATELY","Remove ALL infected plants","Do NOT compost debris","Warn neighbors"], description: "Late blight on tomatoes caused by Phytophthora infestans.", symptoms: ["Pale green greasy lesions","White mold on leaf undersides","Dark streaks on stems","Brown rot on fruit"], causes: "Phytophthora infestans. Cool moist weather (10–20°C).", treatment: ["Systemic fungicides immediately","Remove infected plants","Apply copper sprays","Avoid wetting foliage"], prevention: ["Resistant varieties","Adequate spacing","Drip irrigation","Weekly scouting"] },
  Tomato_Leaf_Mold: { severity: "Moderate", immediateActions: ["Reduce humidity immediately","Apply copper fungicide","Improve ventilation"], description: "Leaf mold caused by Passalora fulva, primarily in greenhouses.", symptoms: ["Pale yellow spots on upper surface","Olive-green mold on undersides","Leaves curl and die","Fruit rarely affected"], causes: "Passalora fulva, high humidity >85%.", treatment: ["Chlorothalonil or copper fungicides","Reduce humidity","Remove infected leaves","Improve ventilation"], prevention: ["Resistant varieties","Prune for airflow","Avoid overhead watering","Sanitize structures"] },
  Tomato_Septoria_leaf_spot: { severity: "Moderate", immediateActions: ["Apply mancozeb","Remove lower infected leaves","Stop overhead watering"], description: "Septoria leaf spot caused by Septoria lycopersici.", symptoms: ["Small circular spots with dark borders","Tiny dark specks inside","Starts on lower leaves","Yellowing and defoliation"], causes: "Septoria lycopersici. Warm wet weather.", treatment: ["Mancozeb or copper fungicides","Remove lower foliage","Mulch soil","Apply in wet weather"], prevention: ["Rotate 2+ years","Stake and prune","Avoid overhead irrigation","Remove debris at season end"] },
  Tomato_Spider_mites_Two_spotted_spider_mite: { severity: "Moderate", immediateActions: ["Apply neem oil immediately","Increase plant humidity","Isolate affected plants"], description: "Two-spotted spider mites cause stippling and bronzing of leaves.", symptoms: ["Yellow or white stippling","Fine webbing","Leaves turn bronze","Tiny mites on undersides"], causes: "Tetranychus urticae. Hot dry conditions.", treatment: ["Miticides or neem oil","Insecticidal soap","Increase humidity","Release predatory mites"], prevention: ["Adequate soil moisture","Avoid excess nitrogen","Inspect transplants","Remove stressed plants"] },
  Tomato__Target_Spot: { severity: "Moderate", immediateActions: ["Apply azoxystrobin","Remove infected material","Improve air circulation"], description: "Target spot caused by Corynespora cassiicola.", symptoms: ["Brown lesions with concentric rings","Dark brown spots on stems","Sunken lesions on fruit","Defoliation in humid conditions"], causes: "Corynespora cassiicola. Warm humid conditions.", treatment: ["Azoxystrobin or chlorothalonil","Remove infected material","Avoid overhead irrigation","Apply at first sign"], prevention: ["Wide plant spacing","Stake and prune","Rotate crops","Avoid wet plants"] },
  Tomato__Tomato_YellowLeaf__Curl_Virus: { severity: "Severe", immediateActions: ["Remove ALL infected plants immediately","Apply whitefly insecticide","Install insect-proof screens"], description: "Tomato Yellow Leaf Curl Virus transmitted by whiteflies.", symptoms: ["Upward curling and yellowing","Small stunted leaves","Severe plant stunting","Flower and fruit drop"], causes: "TYLCV by silverleaf whitefly. No cure once infected.", treatment: ["Remove infected plants immediately","Control whitefly with insecticides","Reflective mulches","Focus on vector control"], prevention: ["Resistant varieties","Insect-proof screens","Yellow sticky traps","Avoid planting near solanaceous crops"] },
  Tomato__Tomato_mosaic_virus: { severity: "Severe", immediateActions: ["Remove infected plants","Disinfect tools with bleach","Wash hands thoroughly"], description: "Tomato Mosaic Virus (ToMV) causes mottling and distortion.", symptoms: ["Yellow-green mosaic mottling","Leaf distortion and curling","Dark necrotic streaks on stems","Reduced fruit quality"], causes: "ToMV survives on tools, hands, soil for years.", treatment: ["Remove and destroy infected plants","Disinfect tools with 10% bleach","Wash hands thoroughly","Control aphid vectors"], prevention: ["Virus-free seeds","Wash hands before handling","Disinfect tools frequently","Do not smoke near plants"] },
};

const getDiseaseInfo = (diseaseKey, lang) => {
  const entry = DISEASE_DB[diseaseKey];
  if (entry) {
    const localized = entry[lang] || entry["en"];
    return { ...localized, severity: entry.severity, immediateActions: entry.immediateActions || [] };
  }
  const enEntry = TOMATO_DISEASES_EN[diseaseKey];
  if (enEntry) return { ...enEntry };
  return null;
};

const SEVERITY_COLOR = {
  None:     { bg: "#edf5ed", color: "#3d7a3d", border: "#c6e0c6" },
  Moderate: { bg: "#fff8ed", color: "#b07a1a", border: "#f0ddb0" },
  Severe:   { bg: "#fdf0ed", color: "#c0533a", border: "#f0c4b8" },
};

// ─── WEATHER RISK LOGIC ───────────────────────────────────────────────────────
const getWeatherRisk = (weather) => {
  if (!weather) return null;
  const { humidity, temp } = weather;
  const risks = [];
  if (humidity > 90 && temp >= 10 && temp <= 20) risks.push("Late Blight (Potato/Tomato)");
  if (humidity > 85 && temp >= 24 && temp <= 29) risks.push("Early Blight");
  if (humidity > 80) risks.push("Fungal diseases");
  return risks;
};

const THEME = {
  light: { bg: "#f7f5f0", navBg: "rgba(247,245,240,0.88)", navBorder: "rgba(226,221,214,0.7)", cardBg: "rgba(255,255,255,0.93)", cardBorder: "#e2ddd6", text: "#1c1c1a", textSub: "#9a9589", textMuted: "#b0a99e", uploadBgHover: "#f2f5f2", shadow: "0 4px 32px rgba(0,0,0,0.08)", historyBg: "rgba(255,255,255,0.92)", divider: "#f0ece6", btnBorder: "#c8c0b4", btnText: "#5a5248", toggleBg: "#e8e4de", toggleIcon: "🌙" },
  dark:  { bg: "#141210", navBg: "rgba(20,18,16,0.90)", navBorder: "rgba(60,55,45,0.7)", cardBg: "rgba(28,26,22,0.95)", cardBorder: "#3a3530", text: "#f0ece4", textSub: "#7a7268", textMuted: "#5a5448", uploadBgHover: "#1e1c18", shadow: "0 4px 32px rgba(0,0,0,0.4)", historyBg: "rgba(28,26,22,0.95)", divider: "#2a2820", btnBorder: "#4a4540", btnText: "#c0b8a8", toggleBg: "#2a2820", toggleIcon: "☀️" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Jost', sans-serif; background: #141210; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
  @keyframes slideDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scanLine { 0% { top: 4%; opacity: 0.3; } 100% { top: 94%; opacity: 1; } }
  @keyframes leafPulse { 0%,100% { transform:scale(1); filter:drop-shadow(0 0 4px rgba(122,180,112,.2)); } 50% { transform:scale(1.12); filter:drop-shadow(0 0 16px rgba(122,180,112,.75)); } }
  @keyframes weatherFloat { 0%,100% { transform:translateY(0) rotate(-2deg); } 50% { transform:translateY(-7px) rotate(2deg); } }
  @keyframes weatherGlow { 0%,100% { box-shadow:0 0 0 0 rgba(90,122,90,.12); } 50% { box-shadow:0 0 0 12px rgba(90,122,90,0); } }
  @keyframes rainDrop { 0% { transform:translateY(-40px); opacity:0; } 30% { opacity:.8; } 100% { transform:translateY(220px); opacity:0; } }
  @keyframes statRise { from { opacity:0; transform:translateY(10px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes hudRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes hudRotateReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes riskPulseHigh { 0%, 100% { box-shadow: 0 0 4px #c0533a; border-color: #f0c4b8; } 50% { box-shadow: 0 0 14px rgba(192,83,58,0.7); border-color: #ff9980; } }
  @keyframes riskPulseModerate { 0%, 100% { box-shadow: 0 0 4px #b07a1a; border-color: #f0ddb0; } 50% { box-shadow: 0 0 14px rgba(176,122,26,0.6); border-color: #ffe6b3; } }
  @keyframes riskPulseLow { 0%, 100% { box-shadow: 0 0 4px #3d7a3d; border-color: #c6e0c6; } 50% { box-shadow: 0 0 14px rgba(61,122,61,0.6); border-color: #aae0aa; } }
  
  .risk-badge-high { animation: riskPulseHigh 2s infinite; }
  .risk-badge-moderate { animation: riskPulseModerate 2s infinite; }
  .risk-badge-low { animation: riskPulseLow 2s infinite; }

  .weather-card-animated {
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease;
  }
  .weather-card-animated:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.18) !important;
  }

  .plant-nav-link { background:none; border:0; color:inherit; cursor:pointer; font:500 12px 'Jost',sans-serif; padding:7px 9px; border-radius:8px; white-space:nowrap; }
  .plant-nav-link:hover { background:rgba(90,122,90,.14); color:#8fb38f !important; }
  @media (max-width: 760px) {
    .plant-nav-links { order:3; width:100%; overflow-x:auto; justify-content:flex-start !important; padding-top:8px; scrollbar-width:none; }
    .plant-nav { flex-wrap:wrap; padding:12px 16px !important; }
    .plant-nav-actions .theme-label { display:none; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; }
  }
  
  .plant-layout-grid {
    display: flex;
    flex-direction: row;
    gap: 32px;
    width: 100%;
    max-width: 1040px;
    justify-content: center;
    align-items: flex-start;
  }
  .plant-layout-left, .plant-layout-right {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    min-width: 0;
  }
  .plant-layout-left {
    max-width: 480px;
  }
  .plant-layout-right {
    max-width: 520px;
  }
  @media (max-width: 860px) {
    .plant-layout-grid {
      flex-direction: column;
      align-items: center;
    }
    .plant-layout-left, .plant-layout-right {
      max-width: 480px;
      width: 100%;
    }
  }
`;

const ResultScanner = ({ t, darkMode, stage }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const labels = [t.scanPreparing, t.scanInspecting, t.scanMatching];
  return (
    <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", overflow:"hidden", background:darkMode?"rgba(20,24,20,0.85)":"rgba(240,248,240,0.92)", zIndex:10, backdropFilter:"blur(6px)", borderBottom:`1px solid ${T.cardBorder}` }}>
      {/* Holographic grid scan effect */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(rgba(120,184,121,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(120,184,121,0.07) 1px, transparent 1px)", backgroundSize:"20px 20px" }} />
      {/* Glowing sweep line */}
      <div style={{ position:"absolute", left:0, right:0, height:3, background:"linear-gradient(90deg,transparent,rgba(120,184,121,1),transparent)", boxShadow:"0 0 20px rgba(120,184,121,0.8), 0 0 40px rgba(120,184,121,0.4)", animation:"scanLine 1.8s ease-in-out infinite alternate" }} />
      {/* Rotating HUD circle */}
      <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", border:"2px dashed rgba(120,184,121,0.25)", animation:"hudRotate 15s linear infinite" }} />
      <div style={{ position:"absolute", width:140, height:140, borderRadius:"50%", border:"1px solid rgba(120,184,121,0.4)", borderLeftColor:"transparent", borderRightColor:"transparent", animation:"hudRotateReverse 8s linear infinite" }} />
      
      <div style={{ position:"relative", textAlign:"center", zIndex:1 }}>
        <div style={{ fontSize:40, animation:"leafPulse 1.1s ease-in-out infinite", marginBottom:14 }}>🌿</div>
        <p style={{ color:T.text, fontSize:15, fontWeight:600, letterSpacing:"0.5px", marginBottom:8 }}>{labels[Math.min(stage, labels.length - 1)]}</p>
        <div style={{ display:"flex", justifyContent:"center", gap:6 }}>
          {labels.map((_, index) => <span key={index} style={{ width:index===stage?22:7, height:7, borderRadius:7, background:index<=stage?"#78a878":T.cardBorder, transition:"all .3s ease" }} />)}
        </div>
      </div>
    </div>
  );
};

// ─── SEVERE ALERT BANNER ──────────────────────────────────────────────────────
const SevereAlertBanner = ({ t, info, darkMode }) => (
  <div style={{ width:"100%", maxWidth:480, animation:"slideDown .4s ease", marginBottom:16 }}>
    <div style={{ background:"linear-gradient(135deg, #7a1a0a 0%, #c0533a 100%)", borderRadius:14, padding:"20px 22px", border:"2px solid #e06040", boxShadow:"0 4px 24px rgba(192,83,58,0.4)" }}>
      <p style={{ fontSize:15, fontWeight:600, color:"#fff", marginBottom:12, letterSpacing:"0.2px" }}>{t.severeAlert}</p>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.85)", marginBottom:14, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.8px" }}>{t.immediateActions}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {(info?.immediateActions || []).map((action, i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ color:"#ffcc88", fontSize:14, flexShrink:0, marginTop:1 }}>→</span>
            <span style={{ fontSize:13, color:"#fff", lineHeight:1.6 }}>{action}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── WEATHER CARD ─────────────────────────────────────────────────────────────
const WeatherCard = ({ t, darkMode, weather, weatherLoading, weatherError, onFetch }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const risks = getWeatherRisk(weather);
  const riskLevel = risks && risks.length > 0 ? (risks.some(r => r.includes("Blight")) ? "high" : "moderate") : "low";
  const riskColors = { low: { bg:"#edf5ed", color:"#3d7a3d", border:"#c6e0c6" }, moderate: { bg:"#fff8ed", color:"#b07a1a", border:"#f0ddb0" }, high: { bg:"#fdf0ed", color:"#c0533a", border:"#f0c4b8" } };
  const rc = riskColors[riskLevel];
  const riskLabel = riskLevel === "high" ? t.highRisk : riskLevel === "moderate" ? t.moderateRisk : t.lowRisk;

  return (
    <div className="weather-card-animated" style={{ width:"100%", maxWidth:480, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"20px 24px", boxShadow:T.shadow, animation:"fadeIn .4s ease", position:"relative", overflow:"hidden" }}>
      {/* Glow effect */}
      <div style={{ position:"absolute", width:130, height:130, borderRadius:"50%", right:-55, top:-65, background:"radial-gradient(circle, rgba(112,164,102,.2), transparent 68%)", animation:"weatherGlow 2.8s ease-in-out infinite" }} />
      
      {/* Rainy dynamic animation overlay */}
      {weather && weather.humidity > 80 && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ position:"absolute", top:-30, width:1.5, height:25, background:"linear-gradient(transparent, rgba(118,169,200,0.45))", left:`${10+i*16}%`, animation:`rainDrop 1.2s ${i*0.18}s linear infinite` }} />
          ))}
        </div>
      )}

      {/* Sunny dynamic animation overlay */}
      {weather && weather.temp > 28 && (
        <div style={{ position:"absolute", right:-40, top:-40, width:120, height:120, borderRadius:"50%", background:"radial-gradient(circle, rgba(253,197,110,0.16) 0%, transparent 70%)", animation:"hudRotate 12s linear infinite", pointerEvents:"none", zIndex:0 }} />
      )}

      {/* Cloudy dynamic animation overlay */}
      {weather && weather.humidity <= 80 && weather.temp <= 28 && (
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", top:10, fontSize:22, opacity:0.06, left:"12%", transition:"transform 10s ease" }}>☁️</div>
          <div style={{ position:"absolute", top:30, fontSize:30, opacity:0.04, right:"15%", transition:"transform 15s ease" }}>☁️</div>
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", fontSize:27, animation:"weatherFloat 3s ease-in-out infinite" }}>
            {weather && weather.humidity > 80 ? "🌧️" : weather && weather.temp > 28 ? "☀️" : "🌤️"}
            {weather && weather.humidity > 80 && [0,1,2].map(i => <i key={i} style={{ position:"absolute", width:2, height:7, borderRadius:2, background:"#76a9c8", left:9+i*6, top:25, animation:`rainDrop .9s ${i*.2}s linear infinite` }} />)}
          </div>
          <p style={{ fontSize:11, color:T.textMuted, letterSpacing:"1px", textTransform:"uppercase" }}>{t.weatherTitle}</p>
        </div>
        {!weather && !weatherLoading && (
          <button onClick={onFetch} style={{ fontSize:12, color:"#5a7a5a", background:"none", border:`1px solid #5a7a5a`, borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>
            Get Weather
          </button>
        )}
      </div>
      {weatherLoading && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", position:"relative", zIndex:1 }}>
          <span style={{ width:18, height:18, border:`2px solid ${T.cardBorder}`, borderTopColor:"#78a878", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
          <p style={{ fontSize:13, color:T.textMuted }}>{t.weatherLoading}</p>
        </div>
      )}
      {weatherError && <p style={{ fontSize:12, color:"#c0533a", position:"relative", zIndex:1 }}>{weatherError}</p>}
      {weather && (
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:14 }}>
            {[
              { label:t.temp, value:`${Math.round(weather.temp)}°C`, icon:"🌡" },
              { label:t.humidity, value:`${weather.humidity}%`, icon:"💧" },
              { label:t.wind, value:`${weather.wind}m/s`, icon:"🌬" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", background:darkMode?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)", borderRadius:10, padding:"10px 8px", animation:"statRise .45s ease both", animationDelay:`${["Temp","तापमान"].includes(s.label)?0:120}ms` }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, color:T.text }}>{s.value}</div>
                <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className={`risk-badge-${riskLevel}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:rc.bg, border:`1px solid ${rc.border}`, borderRadius:10 }}>
            <span style={{ fontSize:18 }}>{riskLevel==="high"?"🔴":riskLevel==="moderate"?"🟡":"🟢"}</span>
            <div>
              <p style={{ fontSize:12, fontWeight:600, color:rc.color }}>{t.weatherRisk}: {riskLabel}</p>
              {risks && risks.length > 0 && <p style={{ fontSize:11, color:rc.color, marginTop:2 }}>{t.weatherWarning} {risks.join(", ")}</p>}
            </div>
          </div>
          
          {/* 3-Day Risk Projection */}
          {weather.forecast && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.divider}` }}>
              <p style={{ fontSize: 11, color: T.textMuted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
                📅 {t.label === "हिंदी" ? "3-दिवसीय रोग जोखिम अनुमान" : "3-Day Disease Risk Projection"}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {weather.forecast.map((day, idx) => {
                  const dayRisks = getWeatherRisk(day);
                  const dayRiskLevel = dayRisks && dayRisks.length > 0 ? (dayRisks.some(r => r.includes("Blight")) ? "high" : "moderate") : "low";
                  const dayRc = riskColors[dayRiskLevel];
                  const dayRiskLabel = dayRiskLevel === "high" ? t.highRisk : dayRiskLevel === "moderate" ? t.moderateRisk : t.lowRisk;
                  
                  return (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)", borderRadius: 8, border: `1px solid ${T.cardBorder}`, animation: "fadeIn 0.3s ease both", animationDelay: `${idx * 100}ms` }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{day.dateLabel}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 11, color: T.textSub }}>{Math.round(day.temp)}°C · {day.humidity}% RH</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: dayRc.bg, color: dayRc.color, border: `1px solid ${dayRc.border}`, fontWeight: 500 }}>
                          {dayRiskLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <p style={{ fontSize:11, color:T.textMuted, marginTop:8 }}>{weather.city} · {weather.description}</p>
        </div>
      )}
    </div>
  );
};

// ─── AI CHAT ──────────────────────────────────────────────────────────────────
const buildAssistantReply = (question, diseaseClass, lang) => {
  const q = question.toLowerCase().trim();
  const isHindi = lang === "hi";
  
  // 1. Check for greetings
  const greetingsEn = ["hello", "hi", "hey", "good morning", "good afternoon", "greetings", "yo"];
  const greetingsHi = ["नमस्ते", "नमस्कार", "हैलो", "प्रणाम", "राम राम"];
  if (greetingsEn.some(g => q === g || q.startsWith(g + " ")) || greetingsHi.some(g => q.includes(g))) {
    return isHindi 
      ? "नमस्ते! मैं प्लांटपल्स एआई सहायक हूँ। आप मुझसे टमाटर, आलू, या मिर्च के पौधों की बीमारियों, लक्षणों, उपचारों और रोकथाम के तरीकों के बारे में पूछ सकते हैं। आप कोई फोटो भी स्कैन कर सकते हैं!"
      : "Hello! I'm the PlantPulse AI assistant. You can ask me about diseases, symptoms, treatment, or prevention for tomato, potato, or pepper plants, or upload a leaf photo to scan!";
  }

  // 2. Identify the active plant class
  let activeClass = diseaseClass;
  
  // Parse plant keywords
  const isTomato = q.includes("tomato") || q.includes("टमाटर") || q.includes("tamatar");
  const isPotato = q.includes("potato") || q.includes("आलू") || q.includes("batata");
  const isPepper = q.includes("pepper") || q.includes("bell") || q.includes("capsicum") || q.includes("मिर्च") || q.includes("shimla");
  
  // Parse disease keywords
  const isBacterial = q.includes("bacterial") || q.includes("spot") || q.includes("बैक्टीरियल") || q.includes("धब्बे");
  const isEarly = q.includes("early") || q.includes("अगेती") || q.includes("झुलसा") || q.includes("ब्लाइट");
  const isLate = q.includes("late") || q.includes("पछेती");
  const isMold = q.includes("mold") || q.includes("मोल्ड") || q.includes("फफूंद");
  const isCurl = q.includes("curl") || q.includes("करल") || q.includes("मोड़क") || q.includes("पीला");
  const isMosaic = q.includes("mosaic") || q.includes("मोज़ेक");
  const isHealthy = q.includes("healthy") || q.includes("स्वस्थ") || q.includes("अच्छा");
  
  if (isPotato) {
    if (isEarly) activeClass = "Potato___Early_blight";
    else if (isLate) activeClass = "Potato___Late_blight";
    else if (isHealthy) activeClass = "Potato___healthy";
    else if (!activeClass || !activeClass.startsWith("Potato")) activeClass = "Potato___healthy";
  } else if (isPepper) {
    if (isBacterial) activeClass = "Pepper__bell___Bacterial_spot";
    else if (isHealthy) activeClass = "Pepper__bell___healthy";
    else if (!activeClass || !activeClass.startsWith("Pepper")) activeClass = "Pepper__bell___healthy";
  } else if (isTomato) {
    if (isBacterial) activeClass = "Tomato_Bacterial_spot";
    else if (isEarly) activeClass = "Tomato_Early_blight";
    else if (isLate) activeClass = "Tomato_Late_blight";
    else if (isMold) activeClass = "Tomato_Leaf_Mold";
    else if (isCurl) activeClass = "Tomato__Tomato_YellowLeaf__Curl_Virus";
    else if (isMosaic) activeClass = "Tomato__Tomato_mosaic_virus";
    else if (isHealthy) activeClass = "Tomato_healthy";
    else if (!activeClass || !activeClass.startsWith("Tomato")) activeClass = "Tomato_healthy";
  } else {
    // Check for disease keywords to guess context from scanned class
    if (isEarly) {
      activeClass = activeClass?.includes("Potato") ? "Potato___Early_blight" : "Tomato_Early_blight";
    } else if (isLate) {
      activeClass = activeClass?.includes("Potato") ? "Potato___Late_blight" : "Tomato_Late_blight";
    } else if (isBacterial) {
      activeClass = activeClass?.includes("Pepper") ? "Pepper__bell___Bacterial_spot" : "Tomato_Bacterial_spot";
    }
  }

  const info = activeClass ? getDiseaseInfo(activeClass, lang) : null;
  const diseaseName = activeClass?.replace(/_/g, " ");
  const join = (items) => (items || []).filter(Boolean).join(isHindi ? "। " : ". ");

  if (!info) {
    return isHindi
      ? "मैं टमाटर, आलू और शिमला मिर्च की बीमारियों के बारे में जानकारी दे सकता हूँ। कृपया अपनी समस्या स्पष्ट लिखें (जैसे: 'टमाटर का लेट ब्लाइट रोग' या 'आलू के अगेती लक्षण') या पत्ती की फोटो अपलोड करें।"
      : "I can help with tomato, potato, and pepper plant diseases. Please mention a plant and disease in your question (e.g., 'tomato late blight treatment' or 'potato early blight symptoms') or upload a leaf photo to scan.";
  }

  // If query only mentions a plant generally without disease details
  if ((isTomato || isPotato || isPepper) && !isEarly && !isLate && !isBacterial && !isMold && !isCurl && !isMosaic && !isHealthy && q.length < 25) {
    return isHindi
      ? `मुझे समझ आया कि आप ${isTomato ? "टमाटर" : isPotato ? "आलू" : "मिर्च"} के पौधे के बारे में पूछ रहे हैं। क्या पौधे में कोई बीमारी के लक्षण दिख रहे हैं? जैसे धब्बे, पत्ती मुड़ना, पीलापन, या वह स्वस्थ है?`
      : `I see you are asking about ${isTomato ? "tomato" : isPotato ? "potato" : "pepper"} plants. Are you seeing any disease symptoms, such as spots, leaf curling, yellowing, mold, or is the plant healthy?`;
  }

  // Keywords matching
  if (/(treat|cure|medicine|spray|chemical|control|উপचार|दवा|इलाज|छिड़काव)/i.test(q)) {
    return `${isHindi ? "सुझाया गया उपचार" : "Recommended treatment for " + diseaseName}: ${join(info.treatment)}`;
  }
  if (/(prevent|avoid|stop|save|protect|रोक|बचाव|निवारण|सुरक्षा)/i.test(q)) {
    return `${isHindi ? "रोकथाम के उपाय" : "Prevention measures for " + diseaseName}: ${join(info.prevention)}`;
  }
  if (/(symptom|sign|look|spot|leaf|लक्षण|निशान|पहचान|पत्ती)/i.test(q)) {
    return `${isHindi ? "मुख्य लक्षण" : "Key symptoms of " + diseaseName}: ${join(info.symptoms)}`;
  }
  if (/(cause|why|reason|how spread|कारण|क्यों|फैलाव)/i.test(q)) {
    return `${isHindi ? "संभावित कारण" : "Likely cause of " + diseaseName}: ${info.causes}`;
  }
  if (/(urgent|severe|danger|action|kill|गंभीर|खतरा|तत्काल)/i.test(q)) {
    const severity = info.severity || "Unknown";
    const actions = join(info.immediateActions);
    return isHindi
      ? `रोग की गंभीरता: ${severity}। ${actions ? `तत्काल कदम: ${actions}` : "पौधे की नियमित निगरानी करें।"}`
      : `Disease severity: ${severity}. ${actions ? `Immediate steps: ${actions}` : "Continue regular monitoring."}`;
  }
  
  const translatedSeverity = info.severity === "Severe" ? (isHindi ? "गंभीर" : "Severe") : info.severity === "Moderate" ? (isHindi ? "मध्यम" : "Moderate") : (isHindi ? "कोई नहीं" : "None");
  return isHindi
    ? `${diseaseName} के बारे में जानकारी:\n• विवरण: ${info.description}\n• गंभीरता: ${translatedSeverity}\n• मुख्य लक्षण: ${join(info.symptoms.slice(0, 2))}\nआप मुझसे इसके उपचार, कारण, लक्षण या रोकथाम के बारे में विस्तार से पूछ सकते हैं।`
    : `About ${diseaseName}:\n• Description: ${info.description}\n• Severity: ${info.severity}\n• Key Symptoms: ${join(info.symptoms.slice(0, 2))}\nYou can ask me specifically about its treatment, causes, symptoms, or prevention.`;
};

const AIChat = ({ t, darkMode, diseaseClass, lang, weather, onClose, onMaximize, isMaximized }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("plantpulse_gemini_key") || "");
  const chatEndRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView?.({ behavior:"smooth" }); }, [messages]);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const sendMessage = async (overrideText) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;
    const userMsg = { role:"user", content:textToSend.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(""); setLoading(true);

    if (apiKey) {
      try {
        const systemInstructionText = `
You are PlantPulse AI, a premium, knowledgeable agricultural assistant.
You are helping a user diagnose and treat plant health issues.
Active user language is: ${lang === "hi" ? "Hindi (responses must be in Hindi)" : "English (responses must be in English)"}.
The currently diagnosed plant/disease is: ${diseaseClass ? diseaseClass.replace(/_/g, " ") : "Unknown / Not scanned yet"}.
Current weather conditions: ${weather ? `Temperature ${weather.temp}°C, Humidity ${weather.humidity}%, Wind ${weather.wind} m/s, ${weather.description}` : "Unknown"}.

Instructions:
1. Provide helpful, accurate, agricultural advice.
2. Keep responses relatively concise, easy to read, and formatted nicely in Markdown (bullet points, bold text).
3. If a specific plant disease is diagnosed, tailor your tips to it.
4. Answer in the requested language (${lang === "hi" ? "Hindi" : "English"}) naturally.
`;

        const contents = newMessages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        let modelToUse = localStorage.getItem("plantpulse_resolved_model") || "gemini-1.5-flash";
        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            }
          })
        });

        if (response.status === 404) {
          // Model not found! Let's query ListModels to find available ones for this project/API Key
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listRes.ok) {
              const listData = await listRes.json();
              const availableModels = (listData.models || [])
                .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                .map(m => m.name.replace("models/", ""));
              
              if (availableModels.length > 0) {
                // Find best matching model available to the key
                const newModel = availableModels.find(name => name.includes("gemini-2.5-flash"))
                  || availableModels.find(name => name.includes("gemini-2.0-flash"))
                  || availableModels.find(name => name.includes("gemini-1.5-flash-latest"))
                  || availableModels.find(name => name.includes("gemini-1.5-flash"))
                  || availableModels.find(name => name.includes("flash"))
                  || availableModels.find(name => name.includes("gemini-1.5-pro"))
                  || availableModels.find(name => name.includes("gemini-1.0-pro"))
                  || availableModels[0];
                
                if (newModel && newModel !== modelToUse) {
                  localStorage.setItem("plantpulse_resolved_model", newModel);
                  modelToUse = newModel;
                  response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      contents,
                      systemInstruction: {
                        parts: [{ text: systemInstructionText }]
                      }
                    })
                  });
                }
              }
            }
          } catch (listErr) {
            console.error("Failed to self-heal Gemini API model:", listErr);
          }
        }

        if (!response.ok) {
          let details = "";
          try {
            const errData = await response.json();
            details = errData.error?.message || response.statusText;
          } catch {
            details = response.statusText;
          }
          throw new Error(details || "API call failed");
        }

        const resData = await response.json();
        const assistantText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        setMessages([...newMessages, { role:"assistant", content:assistantText }]);
      } catch (err) {
        console.error(err);
        const errMsg = lang === "hi" 
          ? `जेमिनी एपीआई से जुड़ने में विफल। विवरण: ${err.message}`
          : `Failed to connect to Gemini API. Details: ${err.message}`;
        setMessages([...newMessages, { role:"assistant", content:errMsg }]);
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback
      await new Promise(resolve => setTimeout(resolve, 450));
      const assistantText = buildAssistantReply(userMsg.content, diseaseClass, lang);
      setMessages([...newMessages, { role:"assistant", content:assistantText }]);
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role:"assistant", content:t.voiceUnavailable }]);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    
    let finalTranscript = "";
    recognition.onstart = () => setListening(true);
    recognition.onresult = event => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join("");
      setInput(transcript);
      finalTranscript = transcript;
    };
    
    recognition.onerror = event => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      
      let errorMsg = lang === "hi" 
        ? "माइक एक्सेस करने में विफलता। कृपया अनुमति की जांच करें।" 
        : "Failed to access microphone. Please check settings/permissions.";
      
      if (event.error === "not-allowed") {
        errorMsg = lang === "hi"
          ? "माइक अनुमति अस्वीकृत की गई। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।"
          : "Microphone permission denied. Please allow mic access in your browser settings.";
      } else if (event.error === "network") {
        errorMsg = lang === "hi"
          ? "नेटवर्क त्रुटि: माइक का उपयोग करने के लिए इंटरनेट आवश्यक है।"
          : "Network error: Internet connection is required for speech recognition.";
      }
      
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
    };

    recognition.onend = () => {
      setListening(false);
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim());
      }
    };
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setListening(false);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${lang === "hi" ? "माइक शुरू करने में विफल।" : "Failed to start speech recognition."} Details: ${err.message}` }]);
    }
  };

  const voiceSupported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", background:"transparent", overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.divider}`, background:darkMode?"rgba(90,122,90,0.08)":"rgba(90,122,90,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div>
          <p style={{ fontSize:11, color:T.textMuted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:2, margin:0 }}>🤖 {t.aiChat}</p>
          <p style={{ fontSize:12, color:"#5a7a5a", margin:0 }}>{diseaseClass ? diseaseClass.replace(/_/g, " ") : (lang === "hi" ? "पौध स्वास्थ्य सहायक" : "Plant health assistant")}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={() => setSettingsOpen(!settingsOpen)} style={{ background:"none", border:"none", fontSize:18, color:T.textSub, cursor:"pointer", padding:4, display:"flex", alignItems:"center" }} title={lang==="hi"?"सेटिंग्स":"Settings"}>
            ⚙️
          </button>
          {onMaximize && (
            <button onClick={onMaximize} style={{ background:"none", border:"none", fontSize:16, color:T.textSub, cursor:"pointer", padding:4, display:"flex", alignItems:"center" }} title={isMaximized ? (lang==="hi"?"छोटा करें":"Restore") : (lang==="hi"?"बड़ा करें":"Maximize")}>
              {isMaximized ? "🗗" : "🗖"}
            </button>
          )}
          {onClose && (
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:16, color:T.textSub, cursor:"pointer", padding:4, display:"flex", alignItems:"center" }} title={lang==="hi"?"बंद करें":"Close"}>
              ✕
            </button>
          )}
        </div>
      </div>

      {settingsOpen && (
        <div style={{ padding:"20px", background:darkMode?"rgba(0,0,0,0.2)":"rgba(0,0,0,0.02)", borderBottom:`1px solid ${T.divider}`, display:"flex", flexDirection:"column", gap:10, flexShrink:0 }}>
          <p style={{ fontSize:13, fontWeight:500, margin:0 }}>{lang === "hi" ? "मिथुन (Gemini) एपीआई कुंजी" : "Gemini API Key"}</p>
          <p style={{ fontSize:11, color:T.textMuted, margin:0 }}>
            {lang === "hi" ? "यदि आपके पास जेमिनी एपीआई कुंजी है, तो स्मार्ट उत्तरों के लिए इसे यहाँ दर्ज करें।" : "Provide a Gemini API key for advanced context-aware responses."}
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <input 
              type="password" 
              value={apiKey} 
              onChange={e => {
                setApiKey(e.target.value);
                localStorage.setItem("plantpulse_gemini_key", e.target.value);
                localStorage.removeItem("plantpulse_resolved_model");
              }} 
              placeholder="AIzaSy..." 
              style={{ flex:1, background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)", border:`1px solid ${T.cardBorder}`, borderRadius:8, padding:"8px 12px", fontSize:12, color:T.text, outline:"none", fontFamily:"'Jost', sans-serif" }}
            />
            {apiKey && (
              <button 
                onClick={() => {
                  setApiKey("");
                  localStorage.removeItem("plantpulse_gemini_key");
                  localStorage.removeItem("plantpulse_resolved_model");
                }} 
                style={{ background:"#c0533a", color:"#fff", border:"none", borderRadius:8, padding:"8px 12px", fontSize:12, cursor:"pointer", fontFamily:"'Jost', sans-serif" }}
              >
                {lang === "hi" ? "साफ करें" : "Clear"}
              </button>
            )}
          </div>
          <button 
            onClick={() => setSettingsOpen(false)} 
            style={{ alignSelf:"flex-end", background:"none", border:`1px solid ${T.btnBorder}`, borderRadius:6, padding:"4px 10px", fontSize:12, color:T.btnText, cursor:"pointer", fontFamily:"'Jost', sans-serif" }}
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign:"center", marginTop:40 }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🌿</div>
            <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.6 }}>{t.aiWelcome}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?"#5a7a5a":(darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"), color:m.role==="user"?"#fff":T.text, fontSize:13, lineHeight:1.6 }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start" }}>
            <div style={{ padding:"10px 14px", borderRadius:"14px 14px 14px 4px", background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)", fontSize:13, color:T.textMuted, animation:"pulse 1s infinite" }}>
              {t.chatThinking}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.divider}`, display:"flex", gap:8, flexShrink:0 }}>
        {(lang === "en" || lang === "hi") && voiceSupported && (
          <button onClick={startVoiceInput} title={t.voiceInput} aria-label={t.voiceInput}
            style={{ width:40, flexShrink:0, background:listening?"#c0533a":(darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"), color:listening?"#fff":T.text, border:`1px solid ${listening?"#c0533a":T.cardBorder}`, borderRadius:10, cursor:"pointer", animation:listening?"pulse .8s infinite":"none" }}>
            {listening ? "◼" : "🎙"}
          </button>
        )}
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder={t.chatPlaceholder}
          style={{ flex:1, background:darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)", border:`1px solid ${T.cardBorder}`, borderRadius:10, padding:"9px 14px", fontSize:13, color:T.text, outline:"none", fontFamily:"'Jost', sans-serif" }} />
        <button onClick={() => sendMessage()} disabled={loading||!input.trim()}
          style={{ background:"#5a7a5a", color:"#fff", border:"none", borderRadius:10, padding:"9px 16px", fontSize:13, cursor:loading||!input.trim()?"not-allowed":"pointer", opacity:loading||!input.trim()?0.5:1 }}>
          {t.chatSend}
        </button>
      </div>
    </div>
  );
};

// ─── VOICE OUTPUT ─────────────────────────────────────────────────────────────
const VOICE_LANG_MAP = { en:"en-US", hi:"hi-IN" };

const useVoice = (lang) => {
  const [speaking, setSpeaking] = useState(false);
  const resumeTimer = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const getBestVoice = () => {
      const targetLang = VOICE_LANG_MAP[lang] || "en-US";
      const voices = synth.getVoices();
      let candidates = voices.filter(voice => 
        voice.lang === targetLang || voice.lang?.startsWith(targetLang.slice(0, 2))
      );
      if (candidates.length === 0 && lang === "hi") {
        candidates = voices.filter(voice => 
          voice.lang?.includes("IN") || voice.name?.toLowerCase().includes("india")
        );
      }
      if (candidates.length === 0) return null;
      
      const scoreVoice = (v) => {
        const name = v.name.toLowerCase();
        const noveltyVoices = ["albert", "bad news", "bells", "boing", "cellos", "fred", "good news", "hysterical", "organ", "pipe organ", "whisper", "zarvox", "trinoids", "deranged", "junior", "ralph", "princess", "kathy", "bahh", "bubbles", "chuckle", "fart", "gasp", "giggle", "snore", "sob", "tickle"];
        if (noveltyVoices.some(nv => name.includes(nv))) return -100;

        let score = 0;
        if (name.includes("natural")) score += 50;
        if (name.includes("google")) score += 40;
        if (name.includes("siri")) score += 30;
        if (name.includes("premium")) score += 25;
        if (name.includes("samantha")) score += 20;
        if (name.includes("alex")) score += 18;
        if (name.includes("daniel")) score += 15;
        if (name.includes("karen")) score += 12;
        if (name.includes("moira")) score += 12;
        if (name.includes("tessa")) score += 12;
        if (name.includes("fiona")) score += 12;
        if (name.includes("veena")) score += 12;
        if (v.lang === targetLang) score += 10;
        return score;
      };

      candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      return candidates[0];
    };

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = VOICE_LANG_MAP[lang] || "en-US";
    utter.voice = getBestVoice();
    utter.rate = lang === "hi" ? 0.86 : 0.92;
    utter.pitch = 1;
    
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => { clearInterval(resumeTimer.current); setSpeaking(false); };
    utter.onerror = () => { clearInterval(resumeTimer.current); setSpeaking(false); };
    synth.speak(utter);

    resumeTimer.current = setInterval(() => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
      }
    }, 8000);
  }, [lang]);

  const stop = useCallback(() => {
    clearInterval(resumeTimer.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const loadHandler = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", loadHandler);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadHandler);
        stop();
      };
    }
    return stop;
  }, [stop]);

  return { speak, stop, speaking, supported: typeof window !== "undefined" && "speechSynthesis" in window };
};

// Drawer component removed

// ─── STETHOSCOPE DICTIONARY & LAYER ──────────────────────────────────────────
const STETHOSCOPE_HOTSPOTS = {
  Potato___Early_blight: [
    {
      x: 35, y: 30,
      en: { title: "Target Spot", desc: "Classic Alternaria lesion showing distinct concentric rings with cellular decay." },
      hi: { title: "लक्ष्य धब्बा (Target Spot)", desc: "संवैधानिक रिंगों के साथ विशिष्ट अल्टरनेरिया क्षति जो सेलुलर क्षय दिखाती है।" }
    },
    {
      x: 65, y: 45,
      en: { title: "Chlorotic Zone", desc: "Chlorosis spread showing 55% loss of active chlorophyll near the lesion margin." },
      hi: { title: "क्लोरोटिक क्षेत्र", desc: "धब्बे के पास 55% सक्रिय क्लोरोफिल की कमी को दर्शाता पीलापन।" }
    },
    {
      x: 50, y: 70,
      en: { title: "Fungal Hyphae", desc: "Active mycelial growth detected within lower leaf layers under humidity." },
      hi: { title: "कवक फिलामेंट (Hyphae)", desc: "नमी में पत्ती की निचली सतह पर सक्रिय फंगल माइसेलियल विकास पाया गया।" }
    }
  ],
  Potato___Late_blight: [
    {
      x: 40, y: 35,
      en: { title: "Phytophthora Necrosis", desc: "Water-soaked dark lesion with severe cellular collapse and rotting structure." },
      hi: { title: "फाइटोफ्थोरा सड़ांध", desc: "गंभीर सेलुलर क्षति और सड़ने वाली संरचना के साथ पानी से भीगा हुआ काला धब्बा।" }
    },
    {
      x: 60, y: 55,
      en: { title: "Sporangia Velvet", desc: "Fine white velvet mold containing microscopic spore-forming sporangia." },
      hi: { title: "बीजाणु सफेद फफूंद", desc: "सूक्ष्म बीजाणु पैदा करने वाली पतली सफेद मखमली कवक परत।" }
    },
    {
      x: 25, y: 65,
      en: { title: "Vascular Clog", desc: "Total blockage of leaf veins, shutting down nutrient flow to this section." },
      hi: { title: "वाहिकीय अवरोध (Vascular Clog)", desc: "पत्ती की नसों में पूर्ण अवरोध, जिसके कारण पोषण प्रवाह बंद हो गया है।" }
    }
  ],
  Pepper__bell___Bacterial_spot: [
    {
      x: 30, y: 40,
      en: { title: "Bacterial Ooze", desc: "Xanthomonas pathogen clusters forming greasy water-soaked lesions." },
      hi: { title: "बैक्टीरियल स्राव (Ooze)", desc: "तैलीय पानी से भीगे धब्बे बनाते हुए जैंथोमोनास बैक्टीरिया के समूह।" }
    },
    {
      x: 70, y: 35,
      en: { title: "Dead Tissue Core", desc: "Scab-like center where tissue has died and is beginning to drop out." },
      hi: { title: "मृत ऊतक केंद्र (Scab)", desc: "पपड़ी जैसा केंद्र जहाँ पत्ती का ऊतक नष्ट होकर गिरने लगा है।" }
    },
    {
      x: 45, y: 60,
      en: { title: "Yellow Halo", desc: "Toxin diffusion from bacterial activity causing local chlorophyll breakdown." },
      hi: { title: "पीला प्रभामंडल", desc: "बैक्टीरियल विषाक्त पदार्थों के कारण स्थानीय क्लोरोफिल का विघटन।" }
    }
  ],
  Tomato_Bacterial_spot: [
    {
      x: 30, y: 40,
      en: { title: "Bacterial Ooze", desc: "Xanthomonas pathogen clusters forming greasy water-soaked lesions." },
      hi: { title: "बैक्टीरियल स्राव (Ooze)", desc: "तैलीय पानी से भीगे धब्बे बनाते हुए जैंथोमोनास बैक्टीरिया के समूह।" }
    },
    {
      x: 70, y: 35,
      en: { title: "Dead Tissue Core", desc: "Scab-like center where tissue has died and is beginning to drop out." },
      hi: { title: "मृत ऊतक केंद्र (Scab)", desc: "पपड़ी जैसा केंद्र जहाँ पत्ती का ऊतक नष्ट होकर गिरने लगा है।" }
    },
    {
      x: 45, y: 60,
      en: { title: "Yellow Halo", desc: "Toxin diffusion from bacterial activity causing local chlorophyll breakdown." },
      hi: { title: "पीला प्रभामंडल", desc: "बैक्टीरियल विषाक्त पदार्थों के कारण स्थानीय क्लोरोफिल का विघटन।" }
    }
  ],
  Tomato_Early_blight: [
    {
      x: 35, y: 30,
      en: { title: "Target Spot", desc: "Classic Alternaria lesion showing distinct concentric rings with cellular decay." },
      hi: { title: "लक्ष्य धब्बा (Target Spot)", desc: "संवैधानिक रिंगों के साथ विशिष्ट अल्टरनेरिया क्षति जो सेलुलर क्षय दिखाती है।" }
    },
    {
      x: 65, y: 45,
      en: { title: "Chlorotic Zone", desc: "Chlorosis spread showing 55% loss of active chlorophyll near the lesion margin." },
      hi: { title: "क्लोरोटिक क्षेत्र", desc: "धब्बे के पास 55% सक्रिय क्लोरोफिल की कमी को दर्शाता पीलापन।" }
    },
    {
      x: 50, y: 70,
      en: { title: "Fungal Hyphae", desc: "Active mycelial growth detected within lower leaf layers under humidity." },
      hi: { title: "कवक फिलामेंट (Hyphae)", desc: "नमी में पत्ती की निचली सतह पर सक्रिय फंगल माइसेलियल विकास पाया गया।" }
    }
  ],
  Tomato_Late_blight: [
    {
      x: 40, y: 35,
      en: { title: "Phytophthora Necrosis", desc: "Water-soaked dark lesion with severe cellular collapse and rotting structure." },
      hi: { title: "फाइटोफ्थोरा सड़ांध", desc: "गंभीर सेलुलर क्षति और सड़ने वाली संरचना के साथ पानी से भीगा हुआ काला धब्बा।" }
    },
    {
      x: 60, y: 55,
      en: { title: "Sporangia Velvet", desc: "Fine white velvet mold containing microscopic spore-forming sporangia." },
      hi: { title: "बीजाणु सफेद फफूंद", desc: "सूक्ष्म बीजाणु पैदा करने वाली पतली सफेद मखमली कवक परत।" }
    },
    {
      x: 25, y: 65,
      en: { title: "Vascular Clog", desc: "Total blockage of leaf veins, shutting down nutrient flow to this section." },
      hi: { title: "वाहिकीय अवरोध (Vascular Clog)", desc: "पत्ती की नसों में पूर्ण अवरोध, जिसके कारण पोषण प्रवाह बंद हो गया है।" }
    }
  ],
  Tomato_Leaf_Mold: [
    {
      x: 50, y: 40,
      en: { title: "Olive-Green Mold", desc: "Velvety olive-brown mold layer covering stomata on leaf underside." },
      hi: { title: "जैतून-हरा कवक", desc: "पत्ती की निचली सतह पर स्टोमेटा को ढकने वाली मखमली जैतून-भूरे रंग की कवक परत।" }
    },
    {
      x: 30, y: 50,
      en: { title: "Upper Yellowing", desc: "Foliar yellow spots showing active loss of photosynthetic cells." },
      hi: { title: "ऊपरी पीलापन", desc: "प्रकाश संश्लेषक कोशिकाओं के सक्रिय नुकसान को दर्शाते हुए पीले धब्बे।" }
    },
    {
      x: 70, y: 60,
      en: { title: "Dehydration Ring", desc: "Localized wilting due to fungal toxins choking stomatal breathing." },
      hi: { title: "निर्जलीकरण क्षेत्र", desc: "स्टोमेटा की सांस रोकने वाले फंगल विषाक्त पदार्थों के कारण स्थानीय मुरझाना।" }
    }
  ],
  Tomato_Septoria_leaf_spot: [
    {
      x: 40, y: 30,
      en: { title: "Septoria Lesion", desc: "Small circular spot with dark brown borders and a greyish-white center." },
      hi: { title: "सेप्टोरिया धब्बा", desc: "गहरे भूरे किनारों और धूसर-सफेद केंद्र वाला छोटा गोलाकार धब्बा।" }
    },
    {
      x: 60, y: 50,
      en: { title: "Pycnidia Spore Specks", desc: "Tiny black pimple-like fruiting bodies releasing fungal spores." },
      hi: { title: "पिकनीडिया बीजाणु", desc: "फंगल बीजाणु जारी करने वाले छोटे काले दानेदार फलने वाले अंग।" }
    },
    {
      x: 35, y: 70,
      en: { title: "Yellow Margins", desc: "Localized chlorosis spreading outward from older infected spots." },
      hi: { title: "पीले किनारे", desc: "पुराने संक्रमित धब्बों से बाहर की ओर फैलता हुआ स्थानीय पीलापन।" }
    }
  ],
  Tomato_Spider_mites_Two_spotted_spider_mite: [
    {
      x: 45, y: 35,
      en: { title: "Stippling Spots", desc: "Tiny yellow-white specks caused by mites sucking plant cell sap." },
      hi: { title: "स्टिप्लिंग धब्बे", desc: "मकड़ी के कीड़ों द्वारा पौधों की कोशिकाओं का रस चूसने के कारण छोटे पीले-सफेद धब्बे।" }
    },
    {
      x: 60, y: 60,
      en: { title: "Silky Webbing", desc: "Fine protective silk web spun by mites to harbor eggs and colonize." },
      hi: { title: "रेशमी जाला (Webbing)", desc: "अंडे देने और रहने के लिए कीड़ों द्वारा बुना गया महीन रेशमी सुरक्षा जाला।" }
    },
    {
      x: 20, y: 50,
      en: { title: "Bronzing Area", desc: "Coalescing damage causing leaves to turn bronze and lose transpiration power." },
      hi: { title: "ताम्रवर्ण क्षेत्र (Bronzing)", desc: "नुकसान के कारण पत्तियों का रंग तांबे जैसा होना और वाष्पोत्सर्जन क्षमता खोना।" }
    }
  ],
  Tomato__Target_Spot: [
    {
      x: 35, y: 35,
      en: { title: "Corynespora Spot", desc: "Concentric target lesions spreading rapidly on tomato foliar tissue." },
      hi: { title: "कोरीनेस्पोरा स्पॉट", desc: "टमाटर के पत्तों पर तेजी से फैलने वाले संकेंद्रीय घाव।" }
    },
    {
      x: 65, y: 55,
      en: { title: "Cellular Necrosis", desc: "Advanced dry brown dead zones susceptible to wind tearing." },
      hi: { title: "सेलुलर नेक्रोसिस", desc: "हवा से फटने के प्रति संवेदनशील विकसित सूखे भूरे रंग के मृत क्षेत्र।" }
    },
    {
      x: 50, y: 75,
      en: { title: "Chlorophyll Bleach", desc: "Rapid discoloration halo around the active target core." },
      hi: { title: "क्लोरोफिल ब्लीच", desc: "सक्रिय लक्ष्य केंद्र के चारों ओर तेजी से मलिनकिरण प्रभामंडल।" }
    }
  ],
  Tomato__Tomato_YellowLeaf__Curl_Virus: [
    {
      x: 30, y: 30,
      en: { title: "Upward Curling", desc: "Vascular virus stress distorting cell growth, causing upward leaf margins." },
      hi: { title: "ऊपर की ओर मुड़ना", desc: "कोशिका वृद्धि को विकृत करने वाला वास्कुलर वायरस तनाव।" }
    },
    {
      x: 70, y: 40,
      en: { title: "Severe Chlorosis", desc: "Extensive bright yellow margins showing total cessation of photosynthesis." },
      hi: { title: "गंभीर पीलापन", desc: "प्रकाश संश्लेषण के पूर्ण रूप से बंद होने को दर्शाते हुए चौड़े चमकीले पीले किनारे।" }
    },
    {
      x: 50, y: 65,
      en: { title: "Stunted Node", desc: "Compressed internodes causing stunted and clustered tomato leaf branch." },
      hi: { title: "रुकी हुई गांठ (Stunted Node)", desc: "रुकी हुई और गुच्छेदार टमाटर पत्ती शाखा।" }
    }
  ],
  Tomato__Tomato_mosaic_virus: [
    {
      x: 40, y: 30,
      en: { title: "Mosaic Mottling", desc: "Random dark green and light green mosaic patch patterns across leaf surface." },
      hi: { title: "मोज़ेक मोज़ेक पैटर्न", desc: "पत्ती की सतह पर यादृच्छिक गहरे हरे और हल्के हरे रंग के मोज़ेक धब्बे।" }
    },
    {
      x: 60, y: 50,
      en: { title: "Leaf Distortion", desc: "Misfolded foliar shape resembling shoestrings in advanced viral stages." },
      hi: { title: "पत्ती विरूपण", desc: "उन्नत वायरल चरणों में जूते के फीते जैसी दिखने वाली मुड़ी हुई पत्ती का आकार।" }
    },
    {
      x: 30, y: 70,
      en: { title: "Necrotic Streaks", desc: "Brown dry vascular death signs spreading into leaf veins." },
      hi: { title: "नेक्रोटिक धारियाँ", desc: "पत्ती की नसों में भूरे रंग के शुष्क संवहनी मृत्यु के निशान।" }
    }
  ],
  DEFAULT: [
    {
      x: 40, y: 35,
      en: { title: "Stomatal Function", desc: "Healthy epidermal breathing pores regulating transpiration normally." },
      hi: { title: "स्टोमेटा कार्यप्रणाली", desc: "सामान्य रूप से वाष्पोत्सर्जन को नियंत्रित करने वाले स्वस्थ सांस लेने वाले छिद्र।" }
    },
    {
      x: 65, y: 40,
      en: { title: "Optimal Chlorophyll", desc: "Dense green pigment levels indicating active high-yield photosynthesis." },
      hi: { title: "इष्टतम क्लोरोफिल", desc: "सक्रिय उच्च उपज प्रकाश संश्लेषण का संकेत देने वाला गहरा हरा रंग।" }
    },
    {
      x: 30, y: 65,
      en: { title: "Vascular Hydration", desc: "Excellent water and nutrient turgor pressure within the vein channels." },
      hi: { title: "संवहनी जलयोजन", desc: "शिरा चैनलों के भीतर उत्कृष्ट पानी और पोषक तत्वों का दबाव।" }
    }
  ]
};

const StethoscopeLayer = ({ diseaseClass, lang, darkMode, mousePos, showMagnifier, activeHotspot, setActiveHotspot, preview }) => {
  const hotspots = STETHOSCOPE_HOTSPOTS[diseaseClass] || STETHOSCOPE_HOTSPOTS.DEFAULT;
  const magnifierSize = 100;
  const zoomFactor = 2.2;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "crosshair" }}>
      {/* Hotspots */}
      {hotspots.map((spot, i) => (
        <div 
          key={i}
          onClick={(e) => { e.stopPropagation(); setActiveHotspot(i); }}
          onMouseEnter={() => setActiveHotspot(i)}
          style={{
            position: "absolute",
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: 18,
            height: 18,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: activeHotspot === i ? "#fff" : "#5a7a5a",
            border: "2px solid #fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            cursor: "pointer",
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all .2s"
          }}
        >
          {/* Pulsing Outer Ring */}
          <div style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: "2px solid #5a7a5a",
            animation: "pulse 1.5s infinite",
            opacity: 0.7,
            pointerEvents: "none"
          }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: activeHotspot === i ? "#5a7a5a" : "#fff" }}>{i + 1}</span>
        </div>
      ))}

      {/* Magnifier Glass circular lens */}
      {showMagnifier && activeHotspot === null && (
        <div style={{
          position: "absolute",
          left: mousePos.x - magnifierSize / 2,
          top: mousePos.y - magnifierSize / 2,
          width: magnifierSize,
          height: magnifierSize,
          borderRadius: "50%",
          border: "2px solid #5a7a5a",
          boxShadow: "0 0 14px rgba(0,0,0,0.6), inset 0 0 8px rgba(0,0,0,0.4)",
          backgroundImage: `url(${preview})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${100 * zoomFactor}% ${100 * zoomFactor}%`,
          backgroundPosition: `${mousePos.relX}% ${mousePos.relY}%`,
          pointerEvents: "none",
          zIndex: 8
        }} />
      )}

      {/* Info card overlay at bottom */}
      {activeHotspot !== null && (
        <div style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          right: 12,
          background: darkMode ? "rgba(28, 26, 22, 0.94)" : "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${darkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
          borderRadius: 12,
          padding: "12px 16px",
          color: darkMode ? "#f0ece4" : "#1c1c1a",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: "fadeIn .2s ease",
          zIndex: 10
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <h4 style={{ margin: 0, fontSize: 13, color: "#5a7a5a", fontWeight: 600 }}>
              🩺 {hotspots[activeHotspot][lang === "hi" ? "hi" : "en"].title}
            </h4>
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveHotspot(null); }}
              style={{ background: "none", border: "none", color: darkMode ? "#7a7268" : "#9a9589", fontSize: 16, cursor: "pointer", padding: "0 4px" }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: darkMode ? "#a0988e" : "#5a5248", lineHeight: 1.5 }}>
            {hotspots[activeHotspot][lang === "hi" ? "hi" : "en"].desc}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── CAMERA CAPTURE MODAL ────────────────────────────────────────────────────
const CameraModal = ({ open, onClose, onCapture, darkMode, t, lang }) => {
  const T = darkMode ? THEME.dark : THEME.light;
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(true);
      
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Camera access error:", err);
          setError(
            lang === "hi"
              ? "कैमरा एक्सेस करने में विफल। कृपया अनुमति दें।"
              : "Failed to access camera. Please check permissions."
          );
          setLoading(false);
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [open, lang]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        onCapture(file);
        onClose();
      }
    }, "image/jpeg", 0.9);
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "fadeIn 0.3s ease"
    }}>
      <div style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 20,
        width: "100%",
        maxWidth: 500,
        overflow: "hidden",
        boxShadow: T.shadow,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.divider}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, color: T.text, margin: 0 }}>
            📷 {lang === "hi" ? "फोटो लें" : "Take Photo"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: 0, fontSize: 18, color: T.textSub, cursor: "pointer" }}>
            ✕
          </button>
        </div>

        <div style={{ position: "relative", width: "100%", height: 320, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading && (
            <div style={{ color: "#9a9589", fontSize: 14 }}>
              {lang === "hi" ? "कैमरा शुरू हो रहा है..." : "Initializing camera..."}
            </div>
          )}
          
          {error && (
            <div style={{ padding: 20, textAlign: "center" }}>
              <p style={{ color: "#c0533a", fontSize: 14, marginBottom: 12 }}>⚠️ {error}</p>
              <button 
                onClick={onClose}
                style={{ background: "#5a7a5a", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 12 }}
              >
                {lang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          )}

          {!error && !loading && (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 220,
                height: 220,
                border: "2px dashed #78a878",
                borderRadius: 16,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
                pointerEvents: "none"
              }} />
              <p style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", margin: 0, color: "#fff", fontSize: 11, background: "rgba(0,0,0,0.6)", padding: "4px 8px" }}>
                {lang === "hi" ? "पत्ती को बीच में संरेखित करें" : "Align the leaf in the center"}
              </p>
            </>
          )}
        </div>

        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "center", gap: 12, background: T.divider }}>
          {!error && !loading && (
            <button 
              onClick={handleCapture}
              style={{
                background: "#5a7a5a",
                color: "#fff",
                border: 0,
                borderRadius: "50%",
                width: 60,
                height: 60,
                fontSize: 24,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(90,122,90,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s"
              }}
              onMouseOver={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
            >
              📸
            </button>
          )}
          <button 
            onClick={onClose}
            style={{
              background: "none",
              border: `1px solid ${T.btnBorder}`,
              borderRadius: 8,
              padding: "8px 20px",
              color: T.btnText,
              cursor: "pointer",
              fontFamily: "'Jost', sans-serif",
              fontSize: 13
            }}
          >
            {lang === "hi" ? "रद्द करें" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PDF OPTIONS MODAL ───────────────────────────────────────────────────────
const PDFOptionsModal = ({
  open,
  onClose,
  darkMode,
  t,
  lang,
  notes,
  setNotes,
  location,
  setLocation,
  includeSymptoms,
  setIncludeSymptoms,
  includeCauses,
  setIncludeCauses,
  includeTreatment,
  setIncludeTreatment,
  includeStores,
  setIncludeStores,
  onGenerate,
}) => {
  const T = darkMode ? THEME.dark : THEME.light;
  if (!open) return null;
  return (
    <>
      <div 
        onClick={onClose} 
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 1100,
          animation: "fadeIn .25s ease"
        }}
      />
      <div 
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 500,
          background: T.cardBg,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 20,
          boxShadow: T.shadow,
          zIndex: 1200,
          display: "flex",
          flexDirection: "column",
          padding: "28px",
          color: T.text,
          animation: "fadeIn .3s ease"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Lora', serif", fontSize: 18, margin: 0, fontWeight: 500 }}>
            {lang === "hi" ? "पीडीएफ रिपोर्ट अनुकूलित करें" : "Customize PDF Report"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: T.textSub, cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: "60vh", paddingRight: 4 }}>
          {/* Plant Batch / Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
              {lang === "hi" ? "पौधों का बैच / स्थान" : "Plant Batch / Location"}
            </label>
            <input 
              value={location} 
              onChange={e => setLocation(e.target.value)} 
              placeholder={lang === "hi" ? "उदा. ग्रीनहाउस ए, बेड 3" : "e.g. Greenhouse A, Row 3"}
              style={{
                background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: T.text,
                outline: "none",
                fontFamily: "'Jost', sans-serif"
              }}
            />
          </div>

          {/* Custom Field Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
              {lang === "hi" ? "कस्टम फ़ील्ड नोट्स" : "Custom Field Notes"}
            </label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder={lang === "hi" ? "निरीक्षण नोट्स या अतिरिक्त विवरण जोड़ें..." : "Add observation notes or additional details..."}
              rows={4}
              style={{
                background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${T.cardBorder}`,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: T.text,
                outline: "none",
                resize: "vertical",
                fontFamily: "'Jost', sans-serif"
              }}
            />
          </div>

          {/* Section Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
              {lang === "hi" ? "रिपोर्ट में शामिल करें" : "Include in Report"}
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={includeSymptoms} onChange={e => setIncludeSymptoms(e.target.checked)} style={{ accentColor: "#5a7a5a" }} />
                {t.symptoms}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={includeCauses} onChange={e => setIncludeCauses(e.target.checked)} style={{ accentColor: "#5a7a5a" }} />
                {t.cause}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={includeTreatment} onChange={e => setIncludeTreatment(e.target.checked)} style={{ accentColor: "#5a7a5a" }} />
                {t.treatment}
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={includeStores} onChange={e => setIncludeStores(e.target.checked)} style={{ accentColor: "#5a7a5a" }} />
                {lang === "hi" ? "पास की दुकानें" : "Nearby Stores"}
              </label>
            </div>
          </div>
        </div>

        <button 
          onClick={onGenerate}
          style={{
            marginTop: 24,
            padding: "12px 0",
            background: "#5a7a5a",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'Jost', sans-serif",
            transition: "background .2s"
          }}
          onMouseOver={e=>e.target.style.background="#4a6a4a"} 
          onMouseOut={e=>e.target.style.background="#5a7a5a"}
        >
          {lang === "hi" ? "रिपोर्ट बनाएं और प्रिंट करें" : "Generate & Print Report"}
        </button>
      </div>
    </>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const ImageUpload = ({
  history,
  setHistory,
  darkMode,
  setDarkMode,
  lang,
  setLang,
  onDashboard,
  onHistory,
  aiChatOpen,
  setAiChatOpen,
  onStores,
  scrollTarget,
  clearScrollTarget,
  restoredScan,
  clearRestoredScan,
}) => {
  const [preview, setPreview]     = useState(null);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [scanStage, setScanStage] = useState(0);
  const [dragging, setDragging]   = useState(false);
  const [error, setError]         = useState(null);
  const [langOpen, setLangOpen]   = useState(false);
  const [weather, setWeather]     = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError]     = useState(null);
  const [stores]                  = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfNotes, setPdfNotes]   = useState("");
  const [pdfLocation, setPdfLocation] = useState("");
  const [pdfIncludeSymptoms, setPdfIncludeSymptoms] = useState(true);
  const [pdfIncludeCauses, setPdfIncludeCauses] = useState(true);
  const [pdfIncludeTreatment, setPdfIncludeTreatment] = useState(true);
  const [pdfIncludeStores, setPdfIncludeStores] = useState(true);
  const [stethoscopeActive, setStethoscopeActive] = useState(false);
  const [mousePos, setMousePos]   = useState({ x: 0, y: 0, relX: 0, relY: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef();
  const cameraRef = useRef();
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const { speak, stop, speaking, supported: voiceSupported } = useVoice(lang);

  const startPlantHeartbeat = () => {
    try {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(35, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      oscillatorRef.current = osc;

      const interval = setInterval(() => {
        if (ctx.state === "suspended") return;
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.18);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.24);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
      }, 1000);

      audioContextRef.current.pulseInterval = interval;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  };

  const stopPlantHeartbeat = () => {
    try {
      if (audioContextRef.current?.pulseInterval) {
        clearInterval(audioContextRef.current.pulseInterval);
      }
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (stethoscopeActive) {
      startPlantHeartbeat();
    } else {
      stopPlantHeartbeat();
      setActiveHotspot(null);
    }
    return () => stopPlantHeartbeat();
  }, [stethoscopeActive]);

  const handleStethoscopeMouseMove = (e) => {
    if (!stethoscopeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = (x / rect.width) * 100;
    const relY = (y / rect.height) * 100;
    setMousePos({ x, y, relX, relY });
    setShowMagnifier(true);
  };

  const handleStethoscopeMouseLeave = () => {
    setShowMagnifier(false);
  };

  const t = LANGS[lang];
  const T = darkMode ? THEME.dark : THEME.light;

  useEffect(() => {
    document.title = "PlantPulse – Plant Disease Detection";
    fetchWeather();
    // Weather is requested once on entry; the user can retry from the card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restoredScan) {
      setData({ class: restoredScan.class, confidence: restoredScan.confidence });
      setPreview(restoredScan.imageUrl);
      clearRestoredScan();
    }
  }, [restoredScan, clearRestoredScan]);

  useEffect(() => {
    if (scrollTarget) {
      const el = document.getElementById(scrollTarget);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          clearScrollTarget();
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [scrollTarget, clearScrollTarget]);

  const fetchWeather = () => {
    if (!navigator.geolocation) return;
    setWeatherLoading(true);
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          if (OPENWEATHER_KEY) {
            const [curRes, foreRes] = await Promise.all([
              fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_KEY}&units=metric`),
              fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_KEY}&units=metric`)
            ]);
            const curData = await curRes.json();
            const foreData = await foreRes.json();

            const daysMap = {};
            (foreData.list || []).forEach(item => {
              const dateStr = item.dt_txt.split(" ")[0];
              if (!daysMap[dateStr]) daysMap[dateStr] = [];
              daysMap[dateStr].push(item);
            });

            const forecastDays = Object.entries(daysMap).slice(0, 3).map(([dateStr, items]) => {
              const dateObj = new Date(dateStr + "T00:00:00");
              const dateLabel = dateObj.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: 'short', month: 'short', day: 'numeric' });
              const avgTemp = items.reduce((sum, it) => sum + it.main.temp, 0) / items.length;
              const avgHumidity = Math.round(items.reduce((sum, it) => sum + it.main.humidity, 0) / items.length);
              
              return {
                dateLabel,
                temp: avgTemp,
                humidity: avgHumidity,
                wind: items.reduce((sum, it) => sum + it.wind.speed, 0) / items.length,
                description: items[Math.floor(items.length / 2)]?.weather[0]?.description || ""
              };
            });

            setWeather({
              temp: curData.main.temp,
              humidity: curData.main.humidity,
              wind: curData.wind.speed,
              city: curData.name,
              description: curData.weather[0].description,
              forecast: forecastDays
            });
          } else {
            // Fallback: wttr.in free weather API (using coordinates)
            const res = await fetch(`https://wttr.in/${latitude},${longitude}?format=j1`);
            const d = await res.json();
            const cur = d.current_condition?.[0];
            
            const forecastDays = (d.weather || []).map(day => {
              const dateObj = new Date(day.date + "T00:00:00");
              const dateLabel = dateObj.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: 'short', month: 'short', day: 'numeric' });
              const avgHumidity = day.hourly ? Math.round(day.hourly.reduce((sum, h) => sum + parseInt(h.humidity || 60), 0) / day.hourly.length) : 60;
              const avgTemp = parseFloat(day.avgtempC || 20);

              return {
                dateLabel,
                temp: avgTemp,
                humidity: avgHumidity,
                wind: parseFloat(day.hourly?.[0]?.windspeedKmph || 10) / 3.6,
                description: day.hourly?.[4]?.weatherDesc?.[0]?.value || "clear"
              };
            });

            setWeather({
              temp: parseFloat(cur?.temp_C || 20),
              humidity: parseInt(cur?.humidity || 60),
              wind: parseFloat(cur?.windspeedKmph || 10) / 3.6,
              city: d.nearest_area?.[0]?.areaName?.[0]?.value || "Your Location",
              description: cur?.weatherDesc?.[0]?.value || "",
              forecast: forecastDays
            });
          }
        } catch {
          // Provide a reasonable default so the card still renders
          const today = new Date();
          const demoForecast = [0, 1, 2].map(i => {
            const d = new Date(); d.setDate(today.getDate() + i);
            return {
              dateLabel: d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
              temp: 25 + i * 0.5,
              humidity: 65 - i * 2,
              wind: 3,
              description: "partly cloudy"
            };
          });
          setWeather({
            temp: 25,
            humidity: 65,
            wind: 3,
            city: "Your Location",
            description: "data unavailable",
            forecast: demoForecast
          });
        }
        setWeatherLoading(false);
      },
      () => { setWeatherError(t.locationError); setWeatherLoading(false); }
    );
  };

  const toggleDark = () => { const n=!darkMode; setDarkMode(n); localStorage.setItem("plantpulse_dark",String(n)); };
  const changeLang = (l) => { if (!SUPPORTED_LANGS.includes(l)) return; setLang(l); setLangOpen(false); localStorage.setItem("plantpulse_lang",l); };

  const saveToHistory = (result, imageUrl) => {
    const entry = { id:Date.now(), date:new Date().toLocaleString(), class:result.class, confidence:(parseFloat(result.confidence)*100).toFixed(1), healthy:result.class.toLowerCase().includes("healthy"), imageUrl };
    const updated = [entry,...history].slice(0,20);
    setHistory(updated);
  };

  // clearHistory removed

  const analyze = async (f) => {
    setLoading(true); setError(null); setScanStage(0);
    const stageOne = setTimeout(() => setScanStage(1), 500);
    const stageTwo = setTimeout(() => setScanStage(2), 1050);
    try {
      const form = new FormData(); form.append("file", f);
      const predictUrl = API_URL.endsWith("/predict") ? API_URL : `${API_URL.replace(/\/$/, "")}/predict`;
      const [res] = await Promise.all([
        axios.post(predictUrl, form, { headers:{"Content-Type":"multipart/form-data"} }),
        new Promise(resolve => setTimeout(resolve, 1500)),
      ]);
      if (res.status === 200) { setData(res.data); saveToHistory(res.data, URL.createObjectURL(f)); }
    } catch(e) {
      if (e.response) setError(`Server error: ${e.response.data?.detail||e.response.statusText}`);
      else if (e.request) setError(t.serverError);
      else setError("Something went wrong.");
    } finally {
      clearTimeout(stageOne); clearTimeout(stageTwo);
      setScanStage(2);
      setLoading(false);
    }
  };

  const onPick = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setData(null); setError(null);
    setPreview(URL.createObjectURL(f));
    analyze(f);
  };

  const clear = () => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setData(null); setError(null); };

  const handleVoice = () => {
    if (speaking) { stop(); return; }
    if (!data) return;
    const info = getDiseaseInfo(data.class, lang);
    const healthy = data.class.toLowerCase().includes("healthy");
    const confidence = (parseFloat(data.confidence)*100).toFixed(1);
    const text = lang === "en"
      ? `Detection result: ${data.class.replace(/_/g," ")}. Status: ${healthy?"Healthy":"Diseased"}. Confidence: ${confidence} percent. ${info?.description||""} Treatment: ${(info?.treatment||[]).join(". ")}`
      : `${t.detected}: ${data.class.replace(/_/g," ")}. ${t.confidence}: ${confidence}%. ${info?.description||""} ${t.treatment}: ${(info?.treatment||[]).join(". ")}`;
    speak(text);
  };

  const downloadPDF = async () => {
    if (!data) return;
    const info = getDiseaseInfo(data.class, lang) || {};
    const confidence = (parseFloat(data.confidence)*100).toFixed(1);
    const healthy = data.class.toLowerCase().includes("healthy");
    const severity = info.severity || "Unknown";
    const sevColor = SEVERITY_COLOR[severity] || SEVERITY_COLOR["Moderate"];
    let imageDataUrl = "";
    if (preview) {
      try { const resp=await fetch(preview); const blob=await resp.blob(); imageDataUrl=await new Promise((res)=>{const r=new FileReader();r.onloadend=()=>res(r.result);r.readAsDataURL(blob);}); } catch(e){}
    }

    const locationSectionHtml = pdfLocation.trim()
      ? `<div style="font-size:12px;color:#9a9589;margin-top:4px"><strong>Location / Batch:</strong> ${pdfLocation.trim()}</div>`
      : "";

    const notesSectionHtml = pdfNotes.trim()
      ? `<div class="section"><div class="section-title">Field Notes & Observations</div><p style="font-size:13px;line-height:1.8;background:#fafaf8;border:1px solid #e2ddd6;padding:14px 18px;border-radius:10px;font-style:italic;margin:0;">${pdfNotes.trim()}</p></div>`
      : "";

    const symptomsSectionHtml = pdfIncludeSymptoms
      ? `<div class="section"><div class="section-title">${t.symptoms}</div><ul class="list">${(info.symptoms||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>`
      : "";

    const causesSectionHtml = pdfIncludeCauses
      ? `<div class="section"><div class="section-title">${t.cause}</div><p style="font-size:13px;line-height:1.8">${info.causes||""}</p></div>`
      : "";

    const treatmentSectionHtml = pdfIncludeTreatment
      ? `<div class="two-col"><div class="section"><div class="section-title">${t.treatment}</div><ul class="list">${(info.treatment||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div>
         <div class="section"><div class="section-title">${t.prevention}</div><ul class="list">${(info.prevention||[]).map(s=>`<li>${s}</li>`).join("")}</ul></div></div>`
      : "";

    let storesSectionHtml = "";
    if (pdfIncludeStores && stores && stores.length > 0) {
      storesSectionHtml = `
      <div class="section" style="margin-top:24px;">
        <div class="section-title">Recommended Local Agri-Stores</div>
        <table style="width:100%;font-size:12px;border-collapse:collapse;margin-top:8px;">
          <thead>
            <tr style="border-bottom:2px solid #e2ddd6;text-align:left;">
              <th style="padding:6px 0;">Store Name</th>
              <th style="padding:6px 0;">Type</th>
              <th style="padding:6px 0;text-align:right;">Distance</th>
            </tr>
          </thead>
          <tbody>
            ${stores.map(s => `
              <tr style="border-bottom:1px solid #f4f1eb;">
                <td style="padding:6px 0;font-weight:500;">${s.name}</td>
                <td style="padding:6px 0;color:#7a7268;">${s.type}</td>
                <td style="padding:6px 0;text-align:right;color:#5a7a5a;">${s.distance}m</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>`;
    }

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Plant Disease Report</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap');body{font-family:'Jost',sans-serif;color:#1c1c1a;background:#fff;padding:40px;max-width:780px;margin:0 auto}.header{border-bottom:2px solid #e2ddd6;padding-bottom:24px;margin-bottom:32px;display:flex;justify-content:space-between}.brand{font-family:'Lora',serif;font-size:22px}.brand span{color:#5a7a5a}.hero{display:flex;gap:28px;margin-bottom:32px}.leaf-img{width:180px;height:140px;object-fit:cover;border-radius:12px;border:1px solid #e2ddd6;flex-shrink:0}.badge{padding:4px 12px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid;display:inline-block;margin-right:8px;margin-bottom:8px}.conf-bar{height:4px;background:#f0ece6;border-radius:4px;overflow:hidden;margin-top:8px}.conf-fill{height:100%;border-radius:4px;background:${healthy?"#5a7a5a":"#c0533a"};width:${confidence}%}.description{background:#fafaf8;border:1px solid #e2ddd6;border-radius:12px;padding:20px;margin-bottom:24px;font-size:14px;line-height:1.8}.section{margin-bottom:24px}.section-title{font-family:'Lora',serif;font-size:16px;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #e2ddd6}.list{list-style:none;padding:0}.list li{font-size:13px;padding:6px 0;border-bottom:1px solid #f4f1eb;line-height:1.6;display:flex;gap:10px}.list li::before{content:"→";color:#5a7a5a;flex-shrink:0}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:24px}.footer{margin-top:40px;padding-top:20px;border-top:1px solid #e2ddd6;font-size:11px;color:#b0a99e;text-align:center;line-height:1.8}</style></head><body>
    <div class="header"><div><div class="brand">Plant<span>Pulse</span></div><div style="font-size:12px;color:#9a9589;margin-top:2px">Plant Disease Detection Report</div>${locationSectionHtml}</div><div style="font-size:12px;color:#9a9589;text-align:right">Generated on<br/>${new Date().toLocaleString()}</div></div>
    <div class="hero">${imageDataUrl?`<img src="${imageDataUrl}" class="leaf-img" alt="Leaf"/>`:""}
    <div style="flex:1"><div style="font-size:11px;color:#b0a99e;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">${t.detected}</div>
    <div style="font-family:'Lora',serif;font-size:24px;font-weight:500;margin-bottom:12px">${data.class.replace(/_/g," ")}</div>
    <span class="badge" style="background:${healthy?"#edf5ed":"#fdf0ed"};color:${healthy?"#3d7a3d":"#c0533a"};border-color:${healthy?"#c6e0c6":"#f0c4b8"}">${healthy?"✓ "+t.healthy:"⚠ "+t.diseased}</span>
    <span class="badge" style="background:${sevColor.bg};color:${sevColor.color};border-color:${sevColor.border}">${t.severity}: ${severity}</span>
    <div style="font-size:12px;color:#9a9589;margin-top:8px;display:flex;justify-content:space-between"><span>${t.confidence}</span><span>${confidence}%</span></div>
    <div class="conf-bar"><div class="conf-fill"></div></div></div></div>
    <div class="description">${info.description||""}</div>
    ${notesSectionHtml}
    ${symptomsSectionHtml}
    ${causesSectionHtml}
    ${treatmentSectionHtml}
    ${storesSectionHtml}
    <div class="footer">PlantPulse AI Disease Detection System · © ${new Date().getFullYear()}</div></body></html>`;
    const blob = new Blob([html],{type:"text/html"});
    const url = URL.createObjectURL(blob);
    const win = window.open(url,"_blank");
    if (win) win.onload = () => setTimeout(()=>win.print(),500);
    setPdfModalOpen(false);
  };

  const confidence = data ? (parseFloat(data.confidence)*100).toFixed(1) : null;
  const healthy    = data?.class?.toLowerCase().includes("healthy");
  const info       = data ? getDiseaseInfo(data.class, lang) : null;
  const severity   = info?.severity || null;
  const sevColor   = severity ? SEVERITY_COLOR[severity] : null;
  const isSevere   = severity === "Severe";
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });

  return (
    <>
      <style>{css}</style>
      <nav className="plant-nav" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:14, padding:"14px 28px", borderBottom:`1px solid ${T.navBorder}`, background:T.navBg, backdropFilter:"blur(14px)", position:"sticky", top:0, zIndex:100 }}>
        <button onClick={()=>scrollTo("home")} style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, background:"none", border:0, cursor:"pointer", flexShrink:0 }}>
          Plant<em style={{ color:"#5a7a5a", fontStyle:"italic" }}>Pulse</em>
        </button>
        <div className="plant-nav-links" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2, color:T.btnText, flex:1 }}>
          <button className="plant-nav-link" onClick={()=>scrollTo("home")}>{t.navHome}</button>
          <button className="plant-nav-link" onClick={()=>scrollTo("scan")}>{t.navScan}</button>
          <button className="plant-nav-link" onClick={()=>scrollTo("weather")}>{t.navWeather}</button>
          <button className="plant-nav-link" onClick={onHistory}>⌕ {t.navHistory}</button>
          <button className="plant-nav-link" onClick={()=>setAiChatOpen(true)}>✦ {t.navAI}</button>
          <button className="plant-nav-link" onClick={onStores}>📍 {t.navStores}</button>
          <button className="plant-nav-link" onClick={onDashboard}>▦ {t.navDashboard}</button>
        </div>
        <div className="plant-nav-actions" style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ position:"relative" }}>
            <button onClick={()=>setLangOpen(!langOpen)} style={{ background:T.toggleBg, border:`1px solid ${T.cardBorder}`, borderRadius:8, padding:"5px 12px", fontSize:12, color:T.text, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              🌐 {LANGS[lang].label} ▾
            </button>
            {langOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 6px)", right:0, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:10, overflow:"hidden", boxShadow:T.shadow, zIndex:200, minWidth:140, animation:"fadeIn .15s ease" }}>
                {SUPPORTED_LANGS.map(code => [code, LANGS[code]]).map(([code,val]) => (
                  <button key={code} onClick={()=>changeLang(code)} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 14px", background:lang===code?(darkMode?"#2a2820":"#f4f1eb"):"transparent", border:"none", fontSize:13, color:T.text, cursor:"pointer", fontFamily:"'Jost', sans-serif" }}>
                    {val.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={toggleDark} aria-label={darkMode?"Use light theme":"Use dark theme"} style={{ background:T.toggleBg, border:`1px solid ${T.cardBorder}`, borderRadius:8, padding:"5px 10px", fontSize:16, cursor:"pointer", lineHeight:1 }}>
            {T.toggleIcon}
          </button>
        </div>
      </nav>

      <div id="home" style={{ position:"relative", minHeight:"100vh", background:T.bg, scrollMarginTop:110 }}>
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, backgroundImage:`url(${BG_URL})`, backgroundSize:"cover", backgroundPosition:"center", backgroundAttachment:"fixed", opacity:darkMode?0.07:0.12, zIndex:0, pointerEvents:"none" }} />
        {langOpen && <div onClick={()=>setLangOpen(false)} style={{ position:"fixed", inset:0, zIndex:99 }} />}

        <main style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"52px 20px 80px", gap:20 }}>
          {preview ? (
            <div className="plant-layout-grid">
              {/* ── LEFT COLUMN ── */}
              <div className="plant-layout-left">
                {/* Weather Card */}
                <div id="weather" style={{ width:"100%", maxWidth:480, scrollMarginTop:120 }}>
                  <WeatherCard t={t} darkMode={darkMode} weather={weather} weatherLoading={weatherLoading} weatherError={weatherError} onFetch={fetchWeather} />
                </div>

                {/* Upload Card Image Preview */}
                <div id="scan" style={{ width:"100%", maxWidth:480, background:T.cardBg, backdropFilter:"blur(10px)", borderRadius:16, border:`1px solid ${isSevere&&data?"#e06040":T.cardBorder}`, overflow:"hidden", boxShadow:isSevere&&data?"0 4px 32px rgba(192,83,58,0.3)":T.shadow, animation:"fadeIn .4s ease", transition:"border-color .3s, box-shadow .3s", scrollMarginTop:120 }}>
                  <div style={{ position:"relative", overflow:"hidden" }} onMouseMove={handleStethoscopeMouseMove} onMouseLeave={handleStethoscopeMouseLeave}>
                    <img src={preview} alt="Uploaded leaf" style={{ width:"100%", height:290, objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:70, background:darkMode?"linear-gradient(transparent, rgba(28,26,22,0.95))":"linear-gradient(transparent, rgba(255,255,255,0.95))" }} />
                    {loading && <ResultScanner t={t} darkMode={darkMode} stage={scanStage} />}
                    {!loading && data && stethoscopeActive && (
                      <StethoscopeLayer 
                        diseaseClass={data.class} 
                        lang={lang} 
                        darkMode={darkMode}
                        mousePos={mousePos}
                        showMagnifier={showMagnifier}
                        activeHotspot={activeHotspot}
                        setActiveHotspot={setActiveHotspot}
                        preview={preview}
                      />
                    )}
                  </div>
                  {(!loading && !data) && (
                    <div style={{ padding:"22px 26px" }}>
                      {error && <p style={{ fontSize:13, color:"#c0533a", background:darkMode?"#2a1a16":"#fdf0ed", border:"1px solid #f0c4b8", borderRadius:8, padding:"10px 14px", lineHeight:1.6 }}>⚠️ {error}</p>}
                      {!error && <p style={{ fontSize:13, color:T.textMuted, margin:0 }}>{t.processing}</p>}
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="plant-layout-right">
                {/* Severe Alert Banner */}
                {data && !loading && isSevere && <SevereAlertBanner t={t} info={info} darkMode={darkMode} />}

                {/* Diagnostic Report Card */}
                {data && !loading && !error && (
                  <div style={{ width:"100%", background:T.cardBg, backdropFilter:"blur(10px)", borderRadius:16, border:`1px solid ${isSevere?"#e06040":T.cardBorder}`, overflow:"hidden", boxShadow:T.shadow, animation:"fadeIn .4s ease" }}>
                    <div style={{ padding:"22px 26px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                        <div>
                          <p style={{ fontSize:11, color:T.textMuted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:5 }}>{t.detected}</p>
                          <p style={{ fontFamily:"'Lora', serif", fontSize:20, fontWeight:500, color:T.text, lineHeight:1.3 }}>{data.class.replace(/_/g," ")}</p>
                        </div>
                        <span style={{ flexShrink:0, marginTop:2, padding:"4px 11px", borderRadius:20, fontSize:12, fontWeight:500, background:healthy?"#edf5ed":"#fdf0ed", color:healthy?"#3d7a3d":"#c0533a", border:`1px solid ${healthy?"#c6e0c6":"#f0c4b8"}` }}>{healthy?t.healthy:t.diseased}</span>
                      </div>
                      {severity && severity !== "None" && (
                        <div style={{ marginTop:10 }}>
                          <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:sevColor.bg, color:sevColor.color, border:`1px solid ${sevColor.border}` }}>{t.severity}: {severity}</span>
                        </div>
                      )}
                      <div style={{ marginTop:16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:12, color:T.textMuted }}>{t.confidence}</span>
                          <span style={{ fontSize:13, color:T.btnText, fontWeight:500 }}>{confidence}%</span>
                        </div>
                        <div style={{ height:3, background:T.divider, borderRadius:4, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${confidence}%`, background:healthy?"#5a7a5a":"#c0533a", borderRadius:4, transition:"width 1s cubic-bezier(.16,1,.3,1)" }} />
                        </div>
                      </div>

                      {/* Voice Button */}
                      {(lang === "en" || lang === "hi") && voiceSupported && (
                        <button onClick={handleVoice} style={{ marginTop:14, width:"100%", padding:"9px 0", background:speaking?(darkMode?"#3a2820":"#fdf0ed"):(darkMode?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"), color:speaking?"#c0533a":T.btnText, border:`1px solid ${speaking?"#f0c4b8":T.btnBorder}`, borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"'Jost', sans-serif", transition:"all .2s" }}>
                          {speaking ? t.stopListening : t.listenDiagnosis}
                        </button>
                      )}

                      {/* Stethoscope Button */}
                      <button 
                        onClick={() => setStethoscopeActive(!stethoscopeActive)} 
                        style={{ 
                          marginTop: 10, 
                          width: "100%", 
                          padding: "9px 0", 
                          background: stethoscopeActive ? (darkMode ? "rgba(90,122,90,0.18)" : "#edf5ed") : (darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"), 
                          color: stethoscopeActive ? "#5a7a5a" : T.btnText, 
                          border: `1px solid ${stethoscopeActive ? "#5a7a5a" : T.btnBorder}`, 
                          borderRadius: 8, 
                          fontSize: 13, 
                          cursor: "pointer", 
                          fontFamily: "'Jost', sans-serif", 
                          transition: "all .2s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6
                        }}
                      >
                        🩺 {stethoscopeActive ? (lang === "hi" ? "स्टेथोस्कोप बंद करें" : "Deactivate Stethoscope") : (lang === "hi" ? "पत्ती स्टेथोस्कोप सक्रिय करें" : "Activate Leaf Stethoscope")}
                      </button>

                      {/* PDF Report Button */}
                      <button onClick={() => setPdfModalOpen(true)} style={{ marginTop:10, width:"100%", padding:"10px 0", background:"#5a7a5a", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"'Jost', sans-serif" }}
                        onMouseOver={e=>e.target.style.background="#4a6a4a"} onMouseOut={e=>e.target.style.background="#5a7a5a"}>
                        {t.downloadPdf}
                      </button>
                    </div>
                  </div>
                )}

                {/* Disease Info Card */}
                {data && !loading && info && (
                  <div style={{ width:"100%", background:T.cardBg, backdropFilter:"blur(10px)", borderRadius:16, border:`1px solid ${T.cardBorder}`, boxShadow:T.shadow, overflow:"hidden", animation:"fadeIn .5s ease" }}>
                    <div style={{ padding:"20px 26px 0" }}>
                      <p style={{ fontSize:11, color:T.textMuted, letterSpacing:"1px", textTransform:"uppercase", marginBottom:8 }}>{t.aboutCondition}</p>
                      <p style={{ fontFamily:"'Lora', serif", fontSize:15, color:T.text, lineHeight:1.8, marginBottom:20 }}>{info.description}</p>
                    </div>
                    {[{key:"symptoms",items:info.symptoms},{key:"cause",items:[info.causes]},{key:"treatment",items:info.treatment},{key:"prevention",items:info.prevention}].map(({key,items})=>(
                      <div key={key} style={{ borderTop:`1px solid ${T.divider}`, padding:"16px 26px" }}>
                        <p style={{ fontSize:12, color:"#5a7a5a", fontWeight:500, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:10 }}>{t[key]}</p>
                        {(items||[]).map((item,i) => (
                          <div key={i} style={{ display:"flex", gap:10, marginBottom:6 }}>
                            <span style={{ color:"#5a7a5a", flexShrink:0 }}>→</span>
                            <span style={{ fontSize:13, color:T.text, lineHeight:1.7 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading / Waiting Placeholder */}
                {!data && (
                  <div style={{ width:"100%", background:T.cardBg, backdropFilter:"blur(10px)", borderRadius:16, border:`1px solid ${T.cardBorder}`, padding:"32px 24px", textAlign:"center", boxShadow:T.shadow, animation:"fadeIn .4s ease" }}>
                    <div style={{ fontSize:28, marginBottom:12, animation:"pulse 1.2s infinite" }}>⚡</div>
                    <p style={{ fontFamily:"'Lora', serif", fontSize:16, color:T.text, marginBottom:6 }}>{loading ? (lang === "hi" ? "पत्ती का विश्लेषण किया जा रहा है..." : "Analyzing leaf patterns...") : (lang === "hi" ? "रिपोर्ट की प्रतीक्षा की जा रही है..." : "Waiting for report...")}</p>
                    <p style={{ fontSize:12, color:T.textMuted, margin:0 }}>{loading ? (lang === "hi" ? "हम रोग की पहचान करने के लिए प्रत्येक विवरण का निरीक्षण कर रहे हैं" : "We are inspecting every detail to identify the disease") : (lang === "hi" ? "कृपया एक पत्ती की छवि अपलोड करें" : "Please upload a leaf image to start detection")}</p>
                  </div>
                )}

                {/* Reset button "Try another way" */}
                <button onClick={clear} style={{ alignSelf:"center", background:"none", border:"none", cursor:"pointer", fontSize:13, color:T.textSub, textDecoration:"underline", textUnderlineOffset:3, padding:"4px 8px", animation:"fadeIn .4s ease" }}>
                  {t.tryAnother}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign:"center", marginBottom:16, animation:"fadeIn .5s ease" }}>
                <h1 style={{ fontFamily:"'Lora', serif", fontSize:"clamp(28px, 5vw, 44px)", fontWeight:400, color:T.text, lineHeight:1.35, marginBottom:12 }}>
                  {t.hero1}<br /><em style={{ color:"#5a7a5a" }}>{t.hero2}</em>
                </h1>
                <p style={{ fontSize:14, color:T.textSub, lineHeight:1.8 }}>{t.heroSub}</p>
              </div>

              {/* Weather Card */}
              <div id="weather" style={{ width:"100%", maxWidth:480, scrollMarginTop:120 }}>
                <WeatherCard t={t} darkMode={darkMode} weather={weather} weatherLoading={weatherLoading} weatherError={weatherError} onFetch={fetchWeather} />
              </div>

              {/* Upload Card Dropzone */}
              <div id="scan" style={{ width:"100%", maxWidth:480, background:T.cardBg, backdropFilter:"blur(10px)", borderRadius:16, border:`1px solid ${T.cardBorder}`, overflow:"hidden", boxShadow:T.shadow, animation:"fadeIn .4s ease", transition:"border-color .3s, box-shadow .3s", scrollMarginTop:120 }}>
                <div onDragOver={(e)=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={(e)=>{e.preventDefault();setDragging(false);onPick(e.dataTransfer.files[0]);}}
                  style={{ padding:"56px 32px", textAlign:"center", background:dragging?(darkMode?"#1e1c18":"#f2f5f2"):"transparent", transition:"background .2s", borderBottom:`1px solid ${T.cardBorder}` }}>
                  <input ref={inputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={(e)=>onPick(e.target.files[0])} />
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={(e)=>onPick(e.target.files[0])} />
                  <div style={{ fontSize:34, marginBottom:14 }}>🌿</div>
                  <p style={{ fontFamily:"'Lora', serif", fontSize:18, color:T.text, marginBottom:6 }}>{t.dropTitle}</p>
                  <p style={{ fontSize:13, color:T.textMuted, marginBottom:22 }}>{t.dropSub}</p>
                  <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
                    <span onClick={()=>inputRef.current?.click()} style={{ display:"inline-block", padding:"8px 20px", border:`1px solid ${T.btnBorder}`, borderRadius:8, fontSize:13, color:T.btnText, cursor:"pointer", transition:"all .2s" }} onMouseOver={e=>e.target.style.background="rgba(255,255,255,0.05)"} onMouseOut={e=>e.target.style.background="transparent"}>{t.chooseFile}</span>
                    <span 
                      onClick={() => {
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                        if (isMobile) {
                          cameraRef.current?.click();
                        } else {
                          setCameraOpen(true);
                        }
                      }} 
                      style={{ display:"inline-block", padding:"8px 20px", border:`1px solid ${T.btnBorder}`, borderRadius:8, fontSize:13, color:T.btnText, cursor:"pointer", transition:"all .2s", background:darkMode?"rgba(90,122,90,0.18)":"#edf5ed" }} 
                      onMouseOver={e=>e.target.style.background=darkMode?"rgba(90,122,90,0.28)":"#e2ede2"} 
                      onMouseOut={e=>e.target.style.background=darkMode?"rgba(90,122,90,0.18)":"#edf5ed"}
                    >
                      {t.takePhoto}
                    </span>
                  </div>
                </div>
                <div style={{ padding:"22px 26px" }}>
                  <p style={{ fontSize:13, color:T.textMuted, margin:0 }}>{t.supports}</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <PDFOptionsModal 
        open={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        darkMode={darkMode}
        t={t}
        lang={lang}
        notes={pdfNotes}
        setNotes={setPdfNotes}
        location={pdfLocation}
        setLocation={setPdfLocation}
        includeSymptoms={pdfIncludeSymptoms}
        setIncludeSymptoms={setPdfIncludeSymptoms}
        includeCauses={pdfIncludeCauses}
        setIncludeCauses={setPdfIncludeCauses}
        includeTreatment={pdfIncludeTreatment}
        setIncludeTreatment={setPdfIncludeTreatment}
        includeStores={pdfIncludeStores}
        setIncludeStores={setPdfIncludeStores}
        onGenerate={downloadPDF}
      />

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={onPick}
        darkMode={darkMode}
        t={t}
        lang={lang}
      />

      {/* Floating Chat Button */}
      <button 
        onClick={() => setAiChatOpen(!aiChatOpen)} 
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#5a7a5a",
          color: "#fff",
          border: "none",
          boxShadow: "0 4px 16px rgba(90,122,90,0.4)",
          cursor: "pointer",
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "transform 0.25s ease, background 0.25s ease",
          outline: "none"
        }}
        onMouseOver={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {aiChatOpen ? "✕" : "✦"}
      </button>

      {/* Floating Chat Popup Window */}
      {aiChatOpen && (
        <div style={{
          position: "fixed",
          bottom: isMaximized ? 30 : 100,
          right: 30,
          width: isMaximized ? 800 : 380,
          height: isMaximized ? 700 : 520,
          maxWidth: "calc(100vw - 60px)",
          maxHeight: isMaximized ? "calc(100vh - 80px)" : "calc(100vh - 150px)",
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 16,
          boxShadow: T.shadow,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Chat content wrapper */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
            <AIChat 
              t={t} 
              darkMode={darkMode} 
              diseaseClass={data?.class} 
              lang={lang} 
              weather={weather} 
              onClose={() => setAiChatOpen(false)}
              onMaximize={() => setIsMaximized(!isMaximized)}
              isMaximized={isMaximized}
            />
          </div>
        </div>
      )}

      {/* Drawer component removed */}
    </>
  );
};
