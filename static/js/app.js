
let recognition;
let finalTranscript = '';
let inactivityTimer = null;

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micStatus = document.getElementById("micStatus");
  const micPulse = document.getElementById("micPulse");
  const micButton = document.getElementById("micButton");

  if (!SpeechRecognition) {
    micStatus.textContent = "Speech Recognition not supported in this browser.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;

  // Disable continuous mode on mobile to avoid duplication bug
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  recognition.continuous = !isMobile;

  finalTranscript = '';
  document.getElementById("original").value = '';
  document.getElementById("transcriptToTranslate").value = '';
  micStatus.textContent = "Listening...";
  micPulse?.classList.remove("hidden");
  micButton?.classList.remove("bg-blue-500");
  micButton?.classList.add("bg-red-600");

  recognition.onresult = (event) => {
    let interim = '';
    resetInactivityTimer();

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript.trim();
      if (event.results[i].isFinal) {
        finalTranscript = mergeCleanedTranscript(finalTranscript, transcript);
      } else {
        interim = mergeCleanedTranscript('', transcript);
      }
    }

    const combined = finalTranscript + interim;
    document.getElementById("original").value = combined;
    document.getElementById("transcriptToTranslate").value = combined;
  };

  recognition.onerror = (event) => {
    micStatus.textContent = `Error: ${event.error}`;
    stopMicVisuals();
  };

  recognition.onend = () => {
    clearTimeout(inactivityTimer);
    micStatus.textContent = "Listening ended. Click again to speak.";
    stopMicVisuals();
  };

  recognition.start();
}

function stopMicVisuals() {
  const micPulse = document.getElementById("micPulse");
  const micButton = document.getElementById("micButton");
  micPulse?.classList.add("hidden");
  micButton?.classList.remove("bg-red-600");
  micButton?.classList.add("bg-blue-500");
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (recognition) recognition.stop();
  }, 3000);
}

function mergeCleanedTranscript(existing, incoming) {
  const combined = (existing + ' ' + incoming).trim();
  const words = combined.split(/\s+/);

  const cleaned = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i] !== words[i - 1]) {
      cleaned.push(words[i]);
    }
  }

  return cleaned.join(' ') + ' ';
}

const languages = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Assamese", "Aymara", "Azerbaijani", "Bambara", "Basque",
  "Belarusian", "Bengali", "Bhojpuri", "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chinese (Simplified)", "Chinese (Traditional)",
  "Corsican", "Croatian", "Czech", "Danish", "Dhivehi", "Dogri", "Dutch", "English", "Esperanto", "Estonian", "Ewe",
  "Filipino", "Finnish", "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Guarani", "Gujarati",
  "Haitian Creole", "Hausa", "Hawaiian", "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Ilocano",
  "Indonesian", "Irish", "Italian", "Japanese", "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Konkani",
  "Korean", "Krio", "Kurdish (Kurmanji)", "Kurdish (Sorani)", "Kyrgyz", "Lao", "Latin", "Latvian", "Lingala", "Lithuanian",
  "Luganda", "Luxembourgish", "Macedonian", "Maithili", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi",
  "Meiteilon (Manipuri)", "Mizo", "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Nyanja (Chichewa)", "Odia (Oriya)",
  "Oromo", "Pashto", "Persian", "Polish", "Portuguese", "Punjabi", "Quechua", "Romanian", "Russian", "Samoan",
  "Sanskrit", "Scots Gaelic", "Sepedi", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala", "Slovak", "Slovenian",
  "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tagalog (Filipino)", "Tajik", "Tamil", "Tatar", "Telugu",
  "Thai", "Tigrinya", "Tsonga", "Turkish", "Turkmen", "Twi (Akan)", "Ukrainian", "Urdu", "Uyghur", "Uzbek",
  "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

const languageSelect = document.getElementById("languageSelect");

languages.forEach(lang => {
  const opt = document.createElement("option");
  opt.value = lang;
  opt.textContent = lang;
  languageSelect.appendChild(opt);
});

async function sendToTranslate() {
  const text = document.getElementById("transcriptToTranslate").value.trim();
  const lang = document.getElementById("languageSelect").value;
  const btnText = document.getElementById("translateBtnText");
  const loader = document.getElementById("translateLoader");
  const translated = document.getElementById("translated");
  const successMsg = document.getElementById("translateStatus");
  const errorMsg = document.getElementById("translateError");

  // Hide all status messages initially
  successMsg.classList.add("hidden");
  errorMsg.classList.add("hidden");

  // Fallback: No voice recorded
  if (!text) {
    const alertBox = document.getElementById("translateAlert");
    const alertMsg = document.getElementById("translateAlertMessage");

    alertMsg.textContent = "No transcript to translate. Please record your voice first.";
    alertBox.classList.remove("hidden");

    showSection('speak-section'); // Navigate to speak section
    return;
  }

  if (!lang) {
    errorMsg.textContent = "Please select a target language.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Show loading state
  btnText.textContent = "Translating...";
  loader.classList.remove("hidden");

  try {
    const res = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target_language: lang })
    });

    const data = await res.json();

    if (data.translated) {
      translated.value = data.translated;
      successMsg.textContent = " Translation complete.";
      successMsg.classList.remove("hidden");
    } else {
      translated.value = "";
      errorMsg.textContent = data.error || " Translation failed. Please try again.";
      errorMsg.classList.remove("hidden");
    }

  } catch (err) {
    translated.value = "";
    errorMsg.textContent = " Server error. Please try again.";
    errorMsg.classList.remove("hidden");
  }

  btnText.textContent = "Translate Text";
  loader.classList.add("hidden");
}

// Function to filter and render language options
function filterLanguages() {
  const searchInput = document.getElementById("languageSearch").value.toLowerCase();
  const languageSelect = document.getElementById("languageSelect");

  // Clear current options
  languageSelect.innerHTML = "";

  // Filter based on input
  const filtered = languages.filter(lang => lang.toLowerCase().includes(searchInput));

  // Repopulate dropdown
  filtered.forEach(lang => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = lang;
    languageSelect.appendChild(opt);
  });

  // Optionally auto-select the first match
  if (filtered.length > 0) {
    languageSelect.selectedIndex = 0;
  }
}

// Initial full list render
filterLanguages(); // Call this once on page load to populate the dropdown
const languageCodeToCountryMap = {
    'en-US': 'United States', 'en-GB': 'United Kingdom', 'en-AU': 'Australia', 'en-CA': 'Canada', 'en-IN': 'India',
    'es-ES': 'Spain', 'es-MX': 'Mexico', 'fr-FR': 'France', 'fr-CA': 'Canada', 'de-DE': 'Germany',
    'it-IT': 'Italy', 'ja-JP': 'Japan', 'ko-KR': 'South Korea', 'pt-BR': 'Brazil', 'ru-RU': 'Russia',
    'zh-CN': 'China (Mainland)', 'zh-TW': 'Taiwan', 'nl-NL': 'Netherlands', 'pl-PL': 'Poland', 'sv-SE': 'Sweden',
    'ar-SA': 'Saudi Arabia', 'da-DK': 'Denmark', 'fi-FI': 'Finland', 'hi-IN': 'India', 'id-ID': 'Indonesia',
    'no-NO': 'Norway', 'th-TH': 'Thailand', 'tr-TR': 'Turkey', 'uk-UA': 'Ukraine', 'vi-VN': 'Vietnam',
    'af-ZA': 'South Africa', 'sq-AL': 'Albania', 'am-ET': 'Ethiopia', 'hy-AM': 'Armenia', 'az-AZ': 'Azerbaijan',
    'eu-ES': 'Spain (Basque)', 'be-BY': 'Belarus', 'bn-BD': 'Bangladesh', 'bs-BA': 'Bosnia and Herzegovina',
    'bg-BG': 'Bulgaria', 'my-MM': 'Myanmar', 'ca-ES': 'Spain (Catalan)', 'ceb-PH': 'Philippines (Cebuano)',
    'ny-MW': 'Malawi', 'hr-HR': 'Croatian', 'cs-CZ': 'Czech Republic', 'el-GR': 'Greece', 'eo-EO': 'Esperanto',
    'et-EE': 'Estonia', 'fil-PH': 'Philippines (Filipino)', 'ka-GE': 'Georgia', 'gu-IN': 'India (Gujarati)',
    'ht-HT': 'Haiti', 'ha-NG': 'Nigeria (Hausa)', 'haw-US': 'United States (Hawaiian)', 'he-IL': 'Israel',
    'hmn-CN': 'China (Hmong)', 'hu-HU': 'Hungary', 'is-IS': 'Iceland', 'ig-NG': 'Nigeria (Igbo)',
    'ga-IE': 'Ireland', 'jv-ID': 'Indonesia (Javanese)', 'kn-IN': 'India (Kannada)', 'kk-KZ': 'Kazakhstan',
    'km-KH': 'Cambodia', 'ku-TR': 'Turkey (Kurdish)', 'ky-KG': 'Kyrgyzstan', 'lo-LA': 'Laos', 'la-VA': 'Latin',
    'lv-LV': 'Latvia', 'lt-LT': 'Lithuania', 'lb-LU': 'Luxembourg', 'mk-MK': 'North Macedonia', 'mg-MG': 'Madagascar',
    'ms-MY': 'Malaysia', 'ml-IN': 'India (Malayalam)', 'mt-MT': 'Malta', 'mi-NZ': 'New Zealand (Maori)',
    'mr-IN': 'India (Marathi)', 'mn-MN': 'Mongolia', 'ne-NP': 'Nepal', 'ps-AF': 'Afghanistan', 'fa-IR': 'Iran',
    'pa-IN': 'India (Punjabi)', 'ro-RO': 'Romania', 'sm-WS': 'Samoa', 'gd-GB': 'United Kingdom (Scots Gaelic)',
    'sr-RS': 'Serbia', 'st-LS': 'Lesotho', 'sn-ZW': 'Zimbabwe', 'sd-IN': 'India (Sindhi)', 'si-LK': 'Sri Lanka',
    'sk-SK': 'Slovakia', 'sl-SI': 'Slovenia', 'so-SO': 'Somalia', 'su-ID': 'Indonesia (Sundanese)',
    'sw-KE': 'Kenya (Swahili)', 'tg-TJ': 'Tajikistan', 'ta-IN': 'India (Tamil)', 'te-IN': 'India (Telugu)',
    'ur-PK': 'Pakistan (Urdu)', 'uz-UZ': 'Uzbekistan', 'cy-GB': 'United Kingdom (Welsh)', 'xh-ZA': 'South Africa (Xhosa)',
    'yi-US': 'United States (Yiddish)', 'yo-NG': 'Nigeria (Yoruba)', 'zu-ZA': 'South Africa (Zulu)'
};
function getCountryFromLanguageCode(langCode) {
    const country = languageCodeToCountryMap[langCode];
    if (country) {
        return country;
    }
    // Fallback for codes like "en" (without country suffix) or unknown ones
    const parts = langCode.split('-');
    if (parts.length > 1) {
        const countryCode = parts[1].toUpperCase();
        // Attempt to map common 2-letter country codes if available, otherwise return the code
        const commonCountryCodes = {
            'US': 'United States', 'GB': 'United Kingdom', 'ES': 'Spain', 'FR': 'France', 'DE': 'Germany',
            'IT': 'Italy', 'JP': 'Japan', 'KR': 'South Korea', 'BR': 'Brazil', 'RU': 'Russia',
            'CN': 'China', 'TW': 'Taiwan', 'NL': 'Netherlands', 'PL': 'Poland', 'SE': 'Sweden',
            'IN': 'India', 'AU': 'Australia', 'CA': 'Canada', 'IE': 'Ireland', 'ZA': 'South Africa',
            'BD': 'Bangladesh', 'BE': 'Belgium', 'BY': 'Belarus', 'CH': 'Switzerland', 'CL': 'Chile',
            'CO': 'Colombia', 'DK': 'Denmark', 'ET': 'Ethiopia', 'FI': 'Finland', 'GR': 'Greece',
            'HU': 'Hungary', 'IL': 'Israel', 'ID': 'Indonesia', 'MX': 'Mexico', 'NO': 'Norway',
            'PH': 'Philippines', 'PT': 'Portugal', 'RO': 'Romania', 'SA': 'Saudi Arabia', 'SK': 'Slovakia',
            'TH': 'Thailand', 'TR': 'Turkey', 'UA': 'Ukraine', 'VN': 'Vietnam'
        };
        return commonCountryCodes[countryCode] || countryCode; // Return mapped name or just the code
    }
    return langCode; // Return original if no specific country part
}

let selectedVoice = null;

// Populate available voices and show avatars

let allVoices = [];

function populateVoices() {
  const voices = window.speechSynthesis.getVoices();
  const voiceOptionsDiv = document.getElementById("voiceOptions");
  const countryFilter = document.getElementById("countryFilter");

  voiceOptionsDiv.innerHTML = "";
  countryFilter.innerHTML = `<option value="">All Countries</option>`;

  if (voices.length === 0) {
    document.getElementById("voiceOptions").innerHTML = `
      <div class="text-red-600 text-sm text-center">
        No speech synthesis voices available on your device.
        Please try on a desktop browser like Chrome or Edge.
      </div>`;
  }

  const googleVoices = voices.filter(v => v.name.includes("Google") && !v.name.includes("Premium"));
  allVoices = googleVoices.length > 0 ? googleVoices : voices.filter(v => !v.name.includes("Premium"));

  // Get unique countries
  const countrySet = new Set();
  allVoices.forEach(v => {
    const country = getCountryFromLanguageCode(v.lang);
    if (country) countrySet.add(country);
  });

  [...countrySet].sort().forEach(country => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.textContent = country;
    countryFilter.appendChild(opt);
  });

  filterVoices(); // Initial render
}

function filterVoices() {
  const query = document.getElementById("voiceSearch").value.toLowerCase();
  const selectedCountry = document.getElementById("countryFilter").value;
  const voiceOptionsDiv = document.getElementById("voiceOptions");

  const matches = allVoices.filter(v => {
    const name = v.name.toLowerCase();
    const country = getCountryFromLanguageCode(v.lang);
    return (!query || name.includes(query) || country.toLowerCase().includes(query)) &&
           (!selectedCountry || country === selectedCountry);
  });

  voiceOptionsDiv.innerHTML = "";

  matches.slice(0, 10).forEach((voice, index) => {
    const div = document.createElement("div");
    const country = getCountryFromLanguageCode(voice.lang);
    const label = voice.name.replace(/Google|Online|\(.+?\)/g, "").trim();
    const avatarText = label[0] || "V";

    div.className = `voice-avatar border-2 border-gray-300 rounded-lg p-2 text-center hover:border-indigo-500 cursor-pointer transition`;
    div.innerHTML = `
      <img src="https://placehold.co/100x100/4f46e5/ffffff?text=${avatarText}" class="mx-auto mb-2 rounded-full shadow" />
      <p class="text-sm font-medium text-gray-800">${label}</p>
      <p class="text-xs text-gray-500">${country}</p>
    `;

    div.onclick = () => {
      selectedVoice = voice;
      document.querySelectorAll(".voice-avatar").forEach(v => v.classList.remove("ring-2", "ring-indigo-500"));
      div.classList.add("ring-2", "ring-indigo-500");
    };

    if (index === 0) {
      selectedVoice = voice;
      div.classList.add("ring-2", "ring-indigo-500");
    }

    voiceOptionsDiv.appendChild(div);
  });
}

// Speak translation using selected voice
function speakTranslation() {
  const text = document.getElementById("translated")?.value || "";
  const errorBox = document.getElementById("ttsError");
  const errorMsg = document.getElementById("ttsErrorMessage");

  // If no text to speak, show UI error
  if (!text.trim()) {
    if (errorBox && errorMsg) {
      errorMsg.textContent = "No translated text to speak.";
      errorBox.classList.remove("hidden");
      setTimeout(() => errorBox.classList.add("hidden"), 5000);
    }
    return;
  }
  // ✅ Cancel before new utterance
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;

  // Catch speech synthesis errors
  utterance.onerror = (event) => {
    console.error("TTS Error:", event.error);
    if (errorBox && errorMsg) {
      errorMsg.textContent = `Text-to-Speech failed: ${event.error}`;
      errorBox.classList.remove("hidden");
      setTimeout(() => errorBox.classList.add("hidden"), 5000);
    }
  };

  // Hide previous errors before speaking
  if (errorBox) {
    errorBox.classList.add("hidden");
    errorMsg.textContent = "";
  }

  window.speechSynthesis.speak(utterance);
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
} else {
  // Fallback in case the event doesn't fire
  setTimeout(populateVoices, 500);
}

//Toggle the navigation menu on smaller screens
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('hidden');
}
//Show a specific section and hide others
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll("section").forEach(section => {
    section.classList.add("hidden-section");
    section.classList.remove("active-section");
  });

  // Show the selected section
  const active = document.getElementById(sectionId);
  if (active) {
    active.classList.remove("hidden-section");
    active.classList.add("active-section");

    // Scroll to the section, offsetting fixed header height (~4rem)
    const offsetTop = active.offsetTop - 80;
    window.scrollTo({ top: offsetTop > 0 ? offsetTop : 0, behavior: 'smooth' });
  }
}



//DOM for initialization of TTS
document.addEventListener("DOMContentLoaded", () => {
  if (typeof speechSynthesis !== "undefined") {
    // When voices are ready (especially on mobile)
    speechSynthesis.onvoiceschanged = () => {
      populateVoices();
    };

    // Call once in case voices are already available
    populateVoices();
  }
});