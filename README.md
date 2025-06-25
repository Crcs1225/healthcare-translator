# 🩺 Real-Time Medical Translator

A mobile-first web application that enables multilingual communication in healthcare settings through voice-to-text transcription, real-time translation, and text-to-speech playback.

## 🚀 Live Demo

🔗 [View Live App](https://healthcare-translator-gules.vercel.app/)

## 📽️ One-Minute Video Introduction

▶️ [Watch Live Demo](https://loom.com/your-video-link)

---

## 🧠 Features

- 🎙️ **Voice-to-Text** using Web Speech API
- 🌍 **Real-Time Translation** using Generative AI (Gemini/OpenAI)
- 🔊 **Text-to-Speech** with speaker voice selection
- 📱 **Mobile-First Design** using Tailwind CSS
- 💬 **Dual Transcript Display** (original + translated)
- 🌐 **Language Selector** with searchable dropdown
- 👤 **Voice Selector** with avatars for TTS playback

---

## 🛠️ Technologies Used

| Stack            | Tool/Library                        |
|------------------|-------------------------------------|
| Frontend         | HTML, JavaScript, Tailwind CSS      |
| Speech-to-Text   | Web Speech API                      |
| Translation      | Google Generative AI (Gemini) API   |
| Text-to-Speech   | Web SpeechSynthesis API             |
| Deployment       | Vercel (or Cursor/V0)               |

---

## 🧪 Testing & QA

- ✅ Fallbacks and errors for microphone/translation/voice issues
- ✅ Responsive on mobile and desktop
- ✅ Graceful degradation on unsupported browsers
- ✅ Language filtering and validation included

---

## 🧩 Project Structure

```bash
/ (root)

├── static/
│   ├── js/app.js        # All JS logic (voice, translation, TTS)
│   └── css/style.css    # Tailwind or custom CSS
├── templates
│   ├── index.html       # Main UI
├── utils
│   ├── translate.py     # Function for translating
├── app.py               # app entry point
├── .env                 # API keys (ignored in Git)
├── requirements.txt     # Dependencies
├── .gitignore           # Security measure
├── vercel.json          # Deployment config
└── README.md
---
```bash

## ⚙️ How to Run Locally

```bash
# Clone the repository
git clone https://github.com/Crcs1225/medical-translator
cd medical-translator

# Install dependencies
pip install -r requirements.txt

# Set your Google API Key (create a .env file or export it)
export GOOGLE_API_KEY=your-api-key  # Or use a .env manager

# Run the app
python app.py

## 🖼️ Screenshots

### 🎤 Speak Section
![Speak Section](https://i.imgur.com/CyMWzyW.png)

### 🌐 Translate Section
![Translate Section](https://i.imgur.com/bW7s0Lo.png)

### 🔊 Listen Section
![Listen Section](https://i.imgur.com/pxuxGlo.png)

### 🏠 Home Page
![Home Page](https://i.imgur.com/C8c1NQM.png)


