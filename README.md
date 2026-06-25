# 🌿 PlantPulse — Intelligent Plant Disease Detection System

PlantPulse is a state-of-the-art, responsive web application designed to help farmers, horticulturists, and gardeners identify plant diseases instantly and access actionable treatments. It combines deep learning image classification with an interactive geospatial store locator, micro-climate disease risk projections, custom report generation, and context-aware Gemini AI chat assistants.

---

## 🚀 Live Links
- **Frontend URL**: [https://plant-detection-system.vercel.app/](https://plant-detection-system.vercel.app/)
- **Backend API URL**: [https://plantpulse-api.onrender.com/](https://plantpulse-api.onrender.com/)

---

## ✨ Features

### 1. 📷 Multi-Platform Image Capture & Scanning
- **Native Mobile Support**: Directly triggers native mobile camera environment modes for high-resolution leaf snapshots.
- **Desktop Webcam Capture**: Opens an in-app webcam viewport overlay with a centering placement guide.
- **Holographic Scan Overlay**: A custom Canvas scanning interface featuring animated grid guidelines, sweeping laser beams, and rotating HUD indicators.

### 2. 🤖 Context-Aware AI Diagnostics (Gemini & Local fallback)
- **Google Gemini Integration**: Features a settings panel to link a personal Google AI Studio API key. The chat assistant is primed with context-aware system prompts (including diagnosed disease, local weather metrics, and active language) for highly personalized agronomy tips.
- **Smart Offline Fallback**: Automatically degrades to local keyword parsing if no API key is provided, ensuring seamless functionality.
- **Auto-healing Model Router**: Dynamically scans available models if the default model throws a `404`, matching the best active endpoint (e.g., `gemini-2.5-flash`, `gemini-1.5-flash`).

### 3. 🗺️ Agri-Stores Interactive Leaflet Map
- **Geospatial Pin Plotting**: Uses Leaflet maps (Voyager light tiles / CartoDB dark tiles depending on theme) to plot nearby agricultural nurseries and chemical/fertilizer dealers.
- **Directions & Routing**: Tapping any pin centers the map and links directly to Google Maps navigation routing.
- **Side-by-Side Responsive Grid**: Features a desktop-inspired horizontal split screen on mobile viewports for simultaneous list browsing and map navigation.

### 4. 🌦️ Weather & 3-Day Disease Risk Projection
- **High-Precision Geolocation weather**: Queries high-precision coordinates to fetch real-time local weather.
- **Micro-Climate Forecasting**: Calculates a multi-day disease risk projection (Low/Moderate/High) by running atmospheric humidity, wind speed, and temperature conditions through a custom risk algorithm.

### 5. 📂 Persistent Scan History (IndexedDB + LocalStorage)
- **Session-Proof Database**: Stores binary leaf image files on the user's browser using IndexedDB, bypassing the 5MB `localStorage` limit.
- **Fluid Archive Screen**: Grid view of past scans featuring hover-lift animations, confidence graphs, diagnostic badges, and card-specific deletion animations.
- **One-Click Restore**: Click any card to restore the diagnostic results and zoomed leaf overlay onto the home workspace.

### 6. 🎧 Leaf Stethoscope & Audio Synthesizer
- **Coordinate Hotspots**: Generates pulsing coordinate pins mapped specifically to individual disease symptoms.
- **Physiological Tooltips**: Hovering pins reveals physiological status readouts (e.g., Chlorosis ratio, necrotic cores).
- **Vascular Sound Synth**: Uses the browser's Web Audio API to synthesize low-frequency dual-tone pulses (simulating plant vascular fluids) in real-time.

### 7. 📝 Customizable PDF Reports
- Allows users to include/exclude Symptoms, Causes, Prevention, and Store Tables.
- Input fields for field observations and custom batch notes, packaging everything into a styled PDF.

### 8. 🗣️ Bilingual Voice Assistant (English & Hindi)
- Supports Speech-to-Text inputs and Text-to-Speech responses.
- Natural Voice Scoring system automatically filters out robotic system voices and prioritizes premium local accents.

---

## 🛠️ Technology Stack

- **Frontend**: React (SPA), Leaflet (Mapping), Web Audio API, Web Speech API, Vanilla CSS.
- **Backend**: FastAPI (Python), Quantized TFLite (`ai-edge-litert`), Uvicorn.
- **Models**: TensorFlow/Keras plant classification models quantized to lightweight TFLite format (~10MB) for low-memory environments (Render Free Tier compatible).

---

## 📦 Local Setup Instructions

### 1. Prerequisites
- Python 3.9 - 3.11
- Node.js (v16+) & npm

### 2. Backend Setup
1. Navigate to the API folder:
   ```bash
   cd api
   ```
2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_WEATHER_KEY=your_openweathermap_api_key
   ```
4. Start the React development server:
   ```bash
   npm start
   ```

---

## 🚀 Deployment Guide

### Frontend (Vercel)
The React app is pre-configured for instant deployment on Vercel:
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Environment Variables**: Make sure to set `REACT_APP_API_URL` pointing to your live FastAPI domain.

### Backend (Render Free Tier)
Because Render free instances limit resources to 512MB RAM, the backend has been migrated to use `ai-edge-litert` (TensorFlow Lite runtime) with a quantized `.tflite` model. This runs comfortably under 100MB RAM.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Web service type**: Python Web Service.

## 👨‍💻 Made By
- **Aniket Kumar Singh**
- **BTech CSE**
- **VIT Bhopal University (2024-2028)**
