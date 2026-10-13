import { useState, useEffect, useRef } from "react"

const API_KEY = import.meta.env.VITE_API_KEY

const SYSTEM_PROMPT = `You are F.R.I.D.A.Y. (Fully Responsive Intelligent Digital Assistant Youth), Tony Stark's AI assistant. You are smart, witty, slightly formal, and occasionally call the user "Boss". Write in natural spoken sentences. Avoid markdown symbols. Keep answers concise. Never break character.`

const BOOT_LINES = [
  "INITIALIZING F.R.I.D.A.Y. CORE SYSTEMS...",
  "LOADING NEURAL INTERFACE MODULES...",
  "CONNECTING TO GLOBAL INTELLIGENCE NETWORK...",
  "CALIBRATING VOICE SYNTHESIS ENGINE...",
  "ALL SYSTEMS NOMINAL. GOOD TO GO, BOSS.",
]

const SUGGESTIONS = [
  "What's happening in the world today?",
  "Latest AI news this week",
  "Who won the latest cricket match?",
  "Give me a morning briefing",
  "What's the weather in Mumbai?",
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body {
    background: #020c1b;
    font-family: 'Share Tech Mono', monospace;
    height: 100%;
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    position: fixed;
  }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: #00d4ff33; border-radius: 2px; }
  .bg-grid { position: fixed; inset: 0; background-image: linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px); background-size: 40px 40px; pointer-events: none; z-index: 0; }
  .scan-line { position: fixed; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00d4ff25, transparent); pointer-events: none; z-index: 1; animation: scanMove 7s linear infinite; }
  @keyframes scanMove { from { top: 0; } to { top: 100vh; } }
  
  /* Boot screen */
  .boot-screen { position: fixed; inset: 0; background: #020c1b; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
  .reactor { position: relative; width: clamp(80px, 22vw, 110px); height: clamp(80px, 22vw, 110px); margin-bottom: clamp(20px, 5vh, 36px); }
  .r-ring1 { position: absolute; inset: 0; border-radius: 50%; border: 2px solid #00d4ff44; animation: spin 3s linear infinite; }
  .r-ring2 { position: absolute; inset: 12%; border-radius: 50%; border: 2px dashed #0080ff55; animation: spinR 2s linear infinite; }
  .r-ring3 { position: absolute; inset: 24%; border-radius: 50%; border: 2px solid #00d4ff77; animation: spin 1.5s linear infinite; }
  .r-core  { position: absolute; inset: 33%; border-radius: 50%; background: radial-gradient(circle, #00d4ff, #0060c0); box-shadow: 0 0 30px #00d4ff, 0 0 60px #00d4ff55; animation: glow 2s ease-in-out infinite; }
  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes spinR { to { transform: rotate(-360deg); } }
  @keyframes glow  { 0%,100% { opacity:0.8; transform:scale(1); } 50% { opacity:1; transform:scale(1.07); } }
  .boot-title { font-family: 'Rajdhani', sans-serif; color: #00d4ff; font-size: clamp(22px, 6vw, 28px); letter-spacing: clamp(4px, 1.5vw, 8px); font-weight: 700; margin-bottom: 6px; text-align: center; }
  .boot-sub { color: #0080ff66; font-size: clamp(8px, 2vw, 10px); letter-spacing: 2px; margin-bottom: clamp(20px, 4vh, 32px); text-align: center; }
  .boot-lines { width: 100%; max-width: 380px; }
  .boot-line { font-size: clamp(9.5px, 2.5vw, 11px); margin-bottom: 7px; padding-left: 12px; border-left: 2px solid #00d4ff22; color: #00d4ff44; transition: all 0.3s; word-break: break-word; }
  .boot-line.active { color: #00d4ff; border-left-color: #00d4ff; }
  .boot-line.done { color: #00d4ff55; border-left-color: #00d4ff33; }
  .blink { animation: blink 0.6s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  .boot-bar-wrap { width: 100%; max-width: 380px; height: 2px; background: #00d4ff11; margin-top: 20px; border-radius: 2px; overflow: hidden; }
  .boot-bar { height: 100%; background: linear-gradient(90deg, #0060ff, #00d4ff); box-shadow: 0 0 10px #00d4ff; transition: width 0.45s ease; }
  
  /* Main App Container */
  .app {
    display: flex;
    flex-direction: column;
    height: 100%;
    height: 100dvh;
    max-width: 860px;
    margin: 0 auto;
    padding: 0 16px;
    padding-top: env(safe-area-inset-top, 0px);
    position: relative;
    z-index: 2;
    animation: fadeUp 0.5s ease;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  
  /* Header */
  .header { display: flex; align-items: center; justify-content: space-between; padding: 12px 0 10px; border-bottom: 1px solid #00d4ff18; gap: 8px; flex-shrink: 0; }
  .header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .mini-reactor { position: relative; width: 38px; height: 38px; flex-shrink: 0; }
  .mini-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid #00d4ff44; animation: spin 3s linear infinite; }
  .mini-core { position: absolute; inset: 7px; border-radius: 50%; background: radial-gradient(circle, #00d4ff, #0050a0); box-shadow: 0 0 12px #00d4ff88; animation: glow 2s ease-in-out infinite; }
  .app-title { font-family: 'Rajdhani', sans-serif; color: #00d4ff; font-size: clamp(17px, 4vw, 20px); letter-spacing: 3px; font-weight: 700; white-space: nowrap; }
  .app-sub { color: #00d4ff44; font-size: clamp(7.5px, 1.8vw, 9px); letter-spacing: 1.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .wave { display: flex; align-items: center; gap: 2px; height: 26px; }
  .wave-bar { width: 3px; border-radius: 2px; background: linear-gradient(180deg, #00d4ff, #0060c0); transition: all 0.3s; }
  .wave-bar.on { animation: waveBounce 0.5s ease-in-out infinite alternate; }
  .wave-bar.off { height: 4px !important; opacity: 0.2; }
  @keyframes waveBounce { from { transform: scaleY(0.5); } to { transform: scaleY(2.2); } }
  .mute-btn { background: transparent; border: 1px solid #00d4ff44; border-radius: 6px; padding: 4px 8px; color: #00d4ffaa; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .mute-btn:hover, .mute-btn:active { background: #00d4ff11; }
  .status { text-align: right; }
  .status-label { color: #00ff8844; font-size: 8px; letter-spacing: 1px; }
  .status-value { font-size: 10px; letter-spacing: 1.5px; font-weight: 600; white-space: nowrap; }
  
  /* Messages */
  .messages { flex: 1; overflow-y: auto; padding: 14px 2px; display: flex; flex-direction: column; -webkit-overflow-scrolling: touch; }
  .msg-row { display: flex; margin-bottom: 14px; animation: fadeUp 0.3s ease; }
  .msg-row.user { justify-content: flex-end; }
  .msg-row.ai { justify-content: flex-start; }
  .av { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; flex-shrink: 0; }
  .av-ai { background: linear-gradient(135deg, #00d4ff, #0050a0); color: #fff; font-size: 13px; margin-right: 8px; box-shadow: 0 0 12px #00d4ff55; border: 1.5px solid #00d4ff44; transition: box-shadow 0.3s; }
  .av-ai.speaking { box-shadow: 0 0 24px #00d4ff; }
  .av-user { background: linear-gradient(135deg, #1a4a80, #0a2050); color: #aad4ff; font-size: 10px; margin-left: 8px; border: 1.5px solid #0060ff44; }
  .bubble { max-width: 78%; padding: 11px 15px; font-family: 'Share Tech Mono', monospace; font-size: 13.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; backdrop-filter: blur(8px); }
  .bubble-ai { background: linear-gradient(135deg, #0a1628ee, #0d1f38ee); border: 1px solid #00d4ff33; color: #a8d8ef; border-radius: 18px 18px 18px 4px; }
  .bubble-user { background: linear-gradient(135deg, #0060c0cc, #003080cc); border: 1px solid #0090ff55; color: #c8e8ff; border-radius: 18px 18px 4px 18px; }
  .bubble-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
  .bubble-time { font-size: 9.5px; color: #ffffff33; }
  .speak-btn { background: none; border: none; cursor: pointer; font-size: 14px; color: #00d4ff55; padding: 0 0 0 8px; transition: color 0.2s; }
  .speak-btn:hover, .speak-btn:active { color: #00d4ff; }
  .typing-wrap { background: #0a1628ee; border: 1px solid #00d4ff33; border-radius: 18px 18px 18px 4px; padding: 10px 16px; display: flex; gap: 6px; align-items: center; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #00d4ff; animation: dotPop 1.2s ease-in-out infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPop { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }
  
  /* Suggestions */
  .suggestions { margin-bottom: 10px; flex-shrink: 0; }
  .sug-label { color: #00d4ff44; font-size: 8.5px; letter-spacing: 2px; margin-bottom: 6px; }
  .sug-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
  .sug-btn { background: rgba(0, 212, 255, 0.04); border: 1px solid #00d4ff28; border-radius: 20px; padding: 6px 12px; color: #00d4ff99; font-size: 11px; font-family: 'Share Tech Mono', monospace; cursor: pointer; transition: all 0.2s; text-align: left; }
  .sug-btn:hover, .sug-btn:active { background: #00d4ff18; border-color: #00d4ff66; color: #00d4ff; }
  
  .voice-error { color: #ff7777; font-size: 11px; text-align: center; padding: 6px 10px; margin-bottom: 6px; background: #ff000011; border-radius: 6px; border: 1px solid #ff444422; }
  .transcript-preview { color: #00d4ffaa; font-size: 11.5px; text-align: center; background: #00d4ff0a; padding: 4px 10px; border-radius: 8px; border: 1px solid #00d4ff22; margin-bottom: 6px; }
  
  /* Input Area */
  .input-row {
    display: flex;
    gap: 8px;
    padding: 10px 0 max(10px, env(safe-area-inset-bottom, 10px));
    border-top: 1px solid #00d4ff18;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .input-wrap {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #0a1628cc;
    border: 1px solid #00d4ff33;
    border-radius: 12px;
    padding: 8px 12px;
    transition: border-color 0.3s;
    min-width: 0;
  }
  .input-wrap.listening { border-color: #ff444466; }
  .input-arrow { color: #00d4ff44; font-size: 11px; padding-bottom: 2px; flex-shrink: 0; }
  .text-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #a8d8ef;
    font-size: 15px;
    line-height: 1.4;
    font-family: 'Share Tech Mono', monospace;
    caret-color: #00d4ff;
    resize: none;
    min-height: 22px;
    max-height: 90px;
    overflow-y: auto;
    width: 100%;
  }
  .text-input:focus { outline: none; }
  .text-input::placeholder { color: #00d4ff33; }
  .mic-area { display: flex; flex-direction: column; align-items: center; gap: 3px; flex-shrink: 0; }
  .mic-btn { position: relative; width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #0a1628, #0d2040); border: 2px solid #00d4ff44; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: all 0.25s; flex-shrink: 0; }
  .mic-btn.on { background: linear-gradient(135deg, #cc2222, #ff4444); border-color: #ff6666; box-shadow: 0 0 20px #ff444488; animation: micGlow 1.2s ease-in-out infinite; }
  .mic-btn.off { box-shadow: 0 0 10px #00d4ff22; }
  @keyframes micGlow { 0%,100% { box-shadow: 0 0 10px #ff444455; } 50% { box-shadow: 0 0 28px #ff4444aa; } }
  .mic-ring { position: absolute; inset: -5px; border-radius: 50%; border: 2px solid #ff4444; animation: ringOut 1.5s ease-out infinite; pointer-events: none; }
  .mic-ring:nth-child(2) { animation-delay: 0.4s; }
  .mic-ring:nth-child(3) { animation-delay: 0.8s; }
  @keyframes ringOut { 0% { transform:scale(1); opacity:0.7; } 100% { transform:scale(1.9); opacity:0; } }
  .mic-label { color: #00d4ff44; font-size: 8px; letter-spacing: 1.5px; transition: color 0.3s; }
  .mic-label.on { color: #ff7777; }
  .send-btn { width: 46px; height: 46px; border-radius: 12px; border: 1px solid #00d4ff44; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; flex-shrink: 0; }
  .send-btn.active { background: linear-gradient(135deg, #0060c0, #00d4ff); color: #fff; box-shadow: 0 0 16px #00d4ff55; }
  .send-btn.inactive { background: #00d4ff08; color: #00d4ff22; cursor: not-allowed; }

  /* Mobile Responsive Breakpoints */
  @media (max-width: 600px) {
    .app { padding: 0 12px; }
    .header { padding: 8px 0; gap: 6px; }
    .mini-reactor { width: 32px; height: 32px; }
    .wave { display: none; } /* Conserves space for titles and controls */
    .mute-btn { padding: 3px 6px; font-size: 9px; }
    .status-value { font-size: 9.5px; letter-spacing: 1px; }
    .status-label { font-size: 7.5px; }
    .bubble { max-width: 86%; font-size: 13px; padding: 10px 13px; }
    .av { width: 30px; height: 30px; font-size: 11px; }
    .av-ai { margin-right: 6px; }
    .av-user { margin-left: 6px; }
    .sug-wrap {
      flex-wrap: nowrap;
      overflow-x: auto;
      gap: 6px;
      padding-bottom: 4px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .sug-wrap::-webkit-scrollbar { display: none; }
    .sug-btn { flex-shrink: 0; font-size: 10.5px; padding: 5px 11px; white-space: nowrap; }
    .text-input { font-size: 16px; } /* Prevents iOS Safari input focus auto-zoom */
    .mic-btn, .send-btn { width: 44px; height: 44px; font-size: 17px; }
  }

  @media (max-width: 380px) {
    .app { padding: 0 8px; }
    .app-title { font-size: 15px; letter-spacing: 2px; }
    .app-sub { display: none; }
    .bubble { max-width: 89%; font-size: 12.5px; padding: 9px 12px; }
    .mic-label { display: none; }
    .mic-btn, .send-btn { width: 40px; height: 40px; font-size: 16px; }
    .input-wrap { padding: 6px 10px; }
  }
`

export default function App() {
  const [booted,     setBooted]     = useState(false)
  const [bootStep,   setBootStep]   = useState(0)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState("")
  const [loading,    setLoading]    = useState(false)
  const [listening,  setListening]  = useState(false)
  const [speaking,   setSpeaking]   = useState(false)
  const [speakIdx,   setSpeakIdx]   = useState(null)
  const [transcript, setTranscript] = useState("")
  const [autoSpeak,  setAutoSpeak]  = useState(true)
  const [voiceError, setVoiceError] = useState("")
  const [micSupport, setMicSupport] = useState(true)
  const [liveSearching, setLiveSearching] = useState(false)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const recognRef = useRef(null)
  const synthRef  = useRef(window.speechSynthesis)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) setMicSupport(false)
  }, [])

  useEffect(() => {
    if (bootStep < BOOT_LINES.length) {
      const t = setTimeout(() => setBootStep(s => s + 1), 500)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setBooted(true)
        const greeting = "Good day Boss. I am F.R.I.D.A.Y. online and fully operational. Type your command or use the microphone. What do you need?"
        setMessages([{ role: "assistant", content: greeting, time: now() }])
      }, 700)
      return () => clearTimeout(t)
    }
  }, [bootStep])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  function speakText(text, msgIndex) {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const clean = text.replace(/[*_`#>\[\]]/g, "").replace(/\n+/g, ". ").trim()
    const utterance = new SpeechSynthesisUtterance(clean)
    const voices = synthRef.current.getVoices()
    const pick =
      voices.find(v => /samantha|karen|victoria|zira/i.test(v.name)) ||
      voices.find(v => v.lang.startsWith("en-US")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0]
    if (pick) utterance.voice = pick
    utterance.rate = 1.0
    utterance.pitch = 1.05
    utterance.volume = 1
    utterance.onstart = () => { setSpeaking(true);  setSpeakIdx(msgIndex) }
    utterance.onend   = () => { setSpeaking(false); setSpeakIdx(null) }
    utterance.onerror = () => { setSpeaking(false); setSpeakIdx(null) }
    synthRef.current.speak(utterance)
  }

  function stopSpeaking() {
    synthRef.current?.cancel()
    setSpeaking(false)
    setSpeakIdx(null)
  }

  function startMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    stopSpeaking()
    setVoiceError("")
    setTranscript("")
    const rec = new SR()
    rec.lang = "en-US"
    rec.interimResults = true
    rec.continuous = false
    let finalText = ""
    rec.onstart  = () => setListening(true)
    rec.onresult = (e) => {
      let interim = ""
      finalText = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t
        else interim += t
      }
      setTranscript(finalText || interim)
    }
    rec.onerror = (e) => {
      setListening(false)
      setTranscript("")
      if (e.error === "not-allowed") setVoiceError("Microphone blocked. Allow mic access in browser.")
      else if (e.error === "no-speech") setVoiceError("No speech detected. Try again.")
      else setVoiceError("Voice error: " + e.error)
    }
    rec.onend = () => {
      setListening(false)
      setTranscript("")
      if (finalText.trim()) callGemini([...messages, { role: "user", content: finalText.trim(), time: now() }], finalText.trim())
    }
    recognRef.current = rec
    rec.start()
  }

  function stopMic() {
    recognRef.current?.stop()
    setListening(false)
    setTranscript("")
  }

  function sendMessage() {
    const userText = input.trim()
    if (!userText || loading) return
    setInput("")
    const userMsg = { role: "user", content: userText, time: now() }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    callGemini(newHistory, userText)
  }

  async function callGemini(history, userPrompt) {
    if (!API_KEY) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "API Key missing Boss. Please ensure VITE_API_KEY is configured in .env.",
        time: now(),
      }])
      setLoading(false)
      return
    }

    setLoading(true)
    const promptText = userPrompt || history[history.length - 1]?.content || ""

    // 1. Fetch live telemetry / satellite / real-time feeds
    let liveIntel = null
    try {
      setLiveSearching(true)
      const intelRes = await fetch(`/api/live?q=${encodeURIComponent(promptText)}`, {
        signal: AbortSignal.timeout(2500)
      })
      const intelData = await intelRes.json()
      if (intelData?.success && intelData.liveIntel) {
        liveIntel = intelData.liveIntel
      }
    } catch (e) {
      console.warn("Live intel fetch skipped:", e)
    } finally {
      setLiveSearching(false)
    }

    try {
      const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const todayTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const dynamicSystemPrompt = `${SYSTEM_PROMPT}\nCURRENT TEMPORAL ANCHOR: Today is ${todayDate} at ${todayTime}. When real-time intelligence feed data is attached, use it as current truth to report up-to-date facts concisely and accurately in character.`

      const contents = history.map((m, idx) => {
        if (idx === history.length - 1 && m.role === "user" && liveIntel) {
          return {
            role: "user",
            parts: [{ text: `[REAL-TIME LIVE INTELLIGENCE FEEDS]:\n${liveIntel}\n\nUSER COMMAND: ${m.content}` }]
          }
        }
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }
      })

      const candidateModels = [
        "gemini-3.1-flash-lite",
        "gemini-3.1-flash-lite-preview",
        "gemini-3-flash-preview",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash"
      ]
      let reply = ""
      let lastError = ""

      for (const model of candidateModels) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: dynamicSystemPrompt }] }
              }),
              signal: AbortSignal.timeout(6000)
            }
          )

          const data = await res.json()
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            reply = data.candidates[0].content.parts[0].text
            break
          } else if (data.error) {
            console.warn(`Model ${model} returned error:`, data.error)
            lastError = data.error.message || ""
          }
        } catch (e) {
          console.warn(`Error querying model ${model}:`, e.message || e)
        }
      }

      if (!reply) {
        reply = lastError ? `Neural uplink note, Boss: ${lastError}` : "All systems nominal, but no response was received, Boss."
      }

      const aiMsg = { role: "assistant", content: reply.trim(), time: now() }
      setMessages(prev => {
        const next = [...prev, aiMsg]
        if (autoSpeak) setTimeout(() => speakText(reply.trim(), next.length - 1), 100)
        return next
      })

    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Neural uplink error Boss. " + err.message,
        time: now(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function autoResize(e) {
    e.target.style.height = "auto"
    e.target.style.height = e.target.scrollHeight + "px"
  }

  return (
    <>
      <style>{styles}</style>
      <div className="bg-grid" />
      <div className="scan-line" />

      {!booted && (
        <div className="boot-screen">
          <div className="reactor">
            <div className="r-ring1" /><div className="r-ring2" />
            <div className="r-ring3" /><div className="r-core" />
          </div>
          <div className="boot-title">F.R.I.D.A.Y.</div>
          <div className="boot-sub">FULLY RESPONSIVE INTELLIGENT DIGITAL ASSISTANT</div>
          <div className="boot-lines">
            {BOOT_LINES.map((line, i) => (
              <div key={i} className={`boot-line ${i < bootStep-1 ? "done" : i === bootStep-1 ? "active" : ""}`}>
                {i < bootStep-1 ? "✓ " : i === bootStep-1 ? "► " : "  "}
                {i <= bootStep-1 ? line : ""}
                {i === bootStep-1 && <span className="blink">█</span>}
              </div>
            ))}
          </div>
          <div className="boot-bar-wrap">
            <div className="boot-bar" style={{ width: `${(bootStep / BOOT_LINES.length) * 100}%` }} />
          </div>
        </div>
      )}

      {booted && (
        <div className="app">
          <div className="header">
            <div className="header-left">
              <div className="mini-reactor">
                <div className="mini-ring" /><div className="mini-core" />
              </div>
              <div>
                <div className="app-title">F.R.I.D.A.Y.</div>
                <div className="app-sub">STARK INDUSTRIES AI ● ALL SYSTEMS ONLINE</div>
              </div>
            </div>
            <div className="header-right">
              <div className="wave">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className={`wave-bar ${speaking ? "on" : "off"}`}
                    style={{ height: speaking ? `${6 + Math.sin(i*0.8)*8+4}px` : "4px", animationDelay: `${i*0.05}s` }}
                  />
                ))}
              </div>
              <button className="mute-btn" onClick={() => { stopSpeaking(); setAutoSpeak(v => !v) }}>
                {autoSpeak ? "🔊 AUTO" : "🔇 MUTED"}
              </button>
              <div className="status">
                <div className="status-label">STATUS</div>
                <div className="status-value" style={{ color: liveSearching ? "#ffbb00" : "#00ff88" }}>
                  {liveSearching ? "● SATELLITE SCAN" : "● ACTIVE"}
                </div>
              </div>
            </div>
          </div>

          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg-row ${msg.role === "user" ? "user" : "ai"}`}>
                {msg.role === "assistant" && (
                  <div className={`av av-ai ${speakIdx===i && speaking ? "speaking" : ""}`}>F</div>
                )}
                <div className={`bubble ${msg.role === "assistant" ? "bubble-ai" : "bubble-user"}`}>
                  {msg.content}
                  <div className="bubble-footer">
                    <span className="bubble-time">{msg.time}</span>
                    {msg.role === "assistant" && (
                      <button className="speak-btn"
                        onClick={() => speaking && speakIdx===i ? stopSpeaking() : speakText(msg.content, i)}>
                        {speaking && speakIdx===i ? "🔊" : "🔈"}
                      </button>
                    )}
                  </div>
                </div>
                {msg.role === "user" && <div className="av av-user">YOU</div>}
              </div>
            ))}
            {loading && (
              <div className="msg-row ai">
                <div className="av av-ai">F</div>
                <div className="typing-wrap">
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="suggestions">
              <div className="sug-label">SUGGESTED QUERIES</div>
              <div className="sug-wrap">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="sug-btn"
                    onClick={() => {
                      const userMsg = { role: "user", content: s, time: now() }
                      const newHistory = [...messages, userMsg]
                      setMessages(newHistory)
                      callGemini(newHistory, s)
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {voiceError && <div className="voice-error">⚠ {voiceError}</div>}
          {listening && transcript && <div className="transcript-preview">🎤 "{transcript}"</div>}

          <div className="input-row">
            <div className={`input-wrap ${listening ? "listening" : ""}`}>
              <span className="input-arrow">▶</span>
              <textarea
                ref={inputRef}
                className="text-input"
                value={listening ? "" : input}
                onChange={e => !listening && setInput(e.target.value)}
                onKeyDown={handleKey}
                onInput={autoResize}
                placeholder={listening ? "Listening..." : "Enter command, Boss..."}
                readOnly={listening}
                rows={1}
              />
            </div>
            {micSupport && (
              <div className="mic-area">
                <button className={`mic-btn ${listening ? "on" : "off"}`}
                  onClick={listening ? stopMic : startMic}>
                  {listening && (<><div className="mic-ring"/><div className="mic-ring"/><div className="mic-ring"/></>)}
                  {listening ? "⏹" : "🎤"}
                </button>
                <span className={`mic-label ${listening ? "on" : ""}`}>{listening ? "LISTENING" : "VOICE"}</span>
              </div>
            )}
            <button
              className={`send-btn ${!input.trim() || loading || listening ? "inactive" : "active"}`}
              onClick={sendMessage}
              disabled={!input.trim() || loading || listening}>
              ⚡
            </button>
          </div>
        </div>
      )}
    </>
  )
}