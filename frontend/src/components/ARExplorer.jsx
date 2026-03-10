import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as tf from '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { Camera, Volume2, Plus, X, Loader, CameraOff, RefreshCw, ArrowLeft, Home, Sparkles } from 'lucide-react'
import './ARExplorer.css'

// Word translations (English, Hindi, Telugu, Tamil)
const translations = {
  person: { hindi: 'व्यक्ति', telugu: 'వ్యక్తి', tamil: 'நபர்' },
  bicycle: { hindi: 'साइकिल', telugu: 'సైకిల్', tamil: 'மிதிவண்டி' },
  car: { hindi: 'कार', telugu: 'కారు', tamil: 'கார்' },
  motorcycle: { hindi: 'मोटरसाइकिल', telugu: 'మోటార్ సైకిల్', tamil: 'மோட்டார் சைக்கிள்' },
  airplane: { hindi: 'हवाई जहाज', telugu: 'విమానం', tamil: 'விமானம்' },
  bus: { hindi: 'बस', telugu: 'బస్సు', tamil: 'பேருந்து' },
  train: { hindi: 'ट्रेन', telugu: 'రైలు', tamil: 'ரயில்' },
  truck: { hindi: 'ट्रक', telugu: 'ట్రక్కు', tamil: 'டிரக்' },
  boat: { hindi: 'नाव', telugu: 'పడవ', tamil: 'படகு' },
  'traffic light': { hindi: 'ट्रैफिक लाइट', telugu: 'ట్రాఫిక్ లైట్', tamil: 'போக்குவரத்து விளக்கு' },
  bench: { hindi: 'बेंच', telugu: 'బెంచ్', tamil: 'பெஞ்ச்' },
  bird: { hindi: 'पक्षी', telugu: 'పక్షి', tamil: 'பறவை' },
  cat: { hindi: 'बिल्ली', telugu: 'పిల్లి', tamil: 'பூனை' },
  dog: { hindi: 'कुत्ता', telugu: 'కుక్క', tamil: 'நாய்' },
  horse: { hindi: 'घोड़ा', telugu: 'గుర్రం', tamil: 'குதிரை' },
  sheep: { hindi: 'भेड़', telugu: 'గొర్రె', tamil: 'செம்மறி ஆடு' },
  cow: { hindi: 'गाय', telugu: 'ఆవు', tamil: 'பசு' },
  elephant: { hindi: 'हाथी', telugu: 'ఏనుగు', tamil: 'யானை' },
  bear: { hindi: 'भालू', telugu: 'ఎలుగుబంటి', tamil: 'கரடி' },
  zebra: { hindi: 'ज़ेबरा', telugu: 'జీబ్రా', tamil: 'வரிக்குதிரை' },
  giraffe: { hindi: 'जिराफ़', telugu: 'జిరాఫీ', tamil: 'ஒட்டகச்சிவிங்கி' },
  backpack: { hindi: 'बैकपैक', telugu: 'బ్యాక్‌ప్యాక్', tamil: 'முதுகுப்பை' },
  umbrella: { hindi: 'छाता', telugu: 'గొడుగు', tamil: 'குடை' },
  handbag: { hindi: 'हैंडबैग', telugu: 'హ్యాండ్‌బ్యాగ్', tamil: 'கைப்பை' },
  tie: { hindi: 'टाई', telugu: 'టై', tamil: 'டை' },
  suitcase: { hindi: 'सूटकेस', telugu: 'సూట్‌కేస్', tamil: 'சூட்கேஸ்' },
  bottle: { hindi: 'बोतल', telugu: 'బాటిల్', tamil: 'பாட்டில்' },
  cup: { hindi: 'कप', telugu: 'కప్పు', tamil: 'கோப்பை' },
  fork: { hindi: 'कांटा', telugu: 'ఫోర్క్', tamil: 'முள்கரண்டி' },
  knife: { hindi: 'चाकू', telugu: 'కత్తి', tamil: 'கத்தி' },
  spoon: { hindi: 'चम्मच', telugu: 'చెంచా', tamil: 'கரண்டி' },
  bowl: { hindi: 'कटोरा', telugu: 'గిన్నె', tamil: 'கிண்ணம்' },
  banana: { hindi: 'केला', telugu: 'అరటిపండు', tamil: 'வாழைப்பழம்' },
  apple: { hindi: 'सेब', telugu: 'ఆపిల్', tamil: 'ஆப்பிள்' },
  sandwich: { hindi: 'सैंडविच', telugu: 'శాండ్విచ్', tamil: 'சாண்ட்விச்' },
  orange: { hindi: 'संतरा', telugu: 'నారింజ', tamil: 'ஆரஞ்சு' },
  carrot: { hindi: 'गाजर', telugu: 'క్యారెట్', tamil: 'கேரட்' },
  pizza: { hindi: 'पिज़्ज़ा', telugu: 'పిజ్జా', tamil: 'பீட்சா' },
  cake: { hindi: 'केक', telugu: 'కేక్', tamil: 'கேக்' },
  chair: { hindi: 'कुर्सी', telugu: 'కుర్చీ', tamil: 'நாற்காலி' },
  couch: { hindi: 'सोफ़ा', telugu: 'సోఫా', tamil: 'சோபா' },
  'potted plant': { hindi: 'गमले का पौधा', telugu: 'కుండీ మొక్క', tamil: 'தொட்டி செடி' },
  bed: { hindi: 'बिस्तर', telugu: 'మంచం', tamil: 'கட்டில்' },
  'dining table': { hindi: 'डाइनिंग टेबल', telugu: 'డైనింగ్ టేబుల్', tamil: 'சாப்பாட்டு மேசை' },
  tv: { hindi: 'टीवी', telugu: 'టీవీ', tamil: 'டிவி' },
  laptop: { hindi: 'लैपटॉप', telugu: 'ల్యాప్‌టాప్', tamil: 'மடிக்கணினி' },
  mouse: { hindi: 'माउस', telugu: 'మౌస్', tamil: 'மவுஸ்' },
  remote: { hindi: 'रिमोट', telugu: 'రిమోట్', tamil: 'ரிமோட்' },
  keyboard: { hindi: 'कीबोर्ड', telugu: 'కీబోర్డ్', tamil: 'விசைப்பலகை' },
  'cell phone': { hindi: 'मोबाइल फोन', telugu: 'మొబైల్ ఫోన్', tamil: 'கைபேசி' },
  microwave: { hindi: 'माइक्रोवेव', telugu: 'మైక్రోవేవ్', tamil: 'மைக்ரோவேவ்' },
  oven: { hindi: 'ओवन', telugu: 'ఓవెన్', tamil: 'அடுப்பு' },
  refrigerator: { hindi: 'रेफ्रिजरेटर', telugu: 'రిఫ్రిజిరేటర్', tamil: 'குளிர்சாதனப்பெட்டி' },
  book: { hindi: 'किताब', telugu: 'పుస్తకం', tamil: 'புத்தகம்' },
  clock: { hindi: 'घड़ी', telugu: 'గడియారం', tamil: 'கடிகாரம்' },
  vase: { hindi: 'फूलदान', telugu: 'పూల కుండ', tamil: 'பூச்சாடி' },
  scissors: { hindi: 'कैंची', telugu: 'కత్తెర', tamil: 'கத்தரிக்கோல்' },
  'teddy bear': { hindi: 'टेडी बियर', telugu: 'టెడ్డీ బేర్', tamil: 'டெடி பியர்' },
  toothbrush: { hindi: 'टूथब्रश', telugu: 'టూత్ బ్రష్', tamil: 'பல் தூரிகை' },
  'wine glass': { hindi: 'गिलास', telugu: 'గ్లాస్', tamil: 'கண்ணாடி' },
  'sports ball': { hindi: 'गेंद', telugu: 'బంతి', tamil: 'பந்து' },
  kite: { hindi: 'पतंग', telugu: 'గాలిపటం', tamil: 'காத்தாடி' },
  skateboard: { hindi: 'स्केटबोर्ड', telugu: 'స్కేట్‌బోర్డ్', tamil: 'ஸ்கேட்போர்டு' },
  surfboard: { hindi: 'सर्फबोर्ड', telugu: 'సర్ఫ్‌బోర్డ్', tamil: 'அலைப்பலகை' },
  sink: { hindi: 'सिंक', telugu: 'సింక్', tamil: 'சிங்க்' },
  toilet: { hindi: 'शौचालय', telugu: 'టాయిలెట్', tamil: 'கழிப்பறை' },
  donut: { hindi: 'डोनट', telugu: 'డోనట్', tamil: 'டோனட்' },
  broccoli: { hindi: 'ब्रोकली', telugu: 'బ్రోకలీ', tamil: 'ப்ரோக்கோலி' },
  'hot dog': { hindi: 'हॉट डॉग', telugu: 'హాట్ డాగ్', tamil: 'ஹாட் டாக்' },
}

const ARExplorer = () => {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [model, setModel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [error, setError] = useState(null)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [savedWords, setSavedWords] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState('telugu')
  const [lastSpoken, setLastSpoken] = useState('')
  const [showToast, setShowToast] = useState(false)
  const animationRef = useRef(null)
  const streamRef = useRef(null)

  // Load the COCO-SSD model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true)
        await tf.ready()
        const loadedModel = await cocoSsd.load()
        setModel(loadedModel)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading model:', err)
        setError('Failed to load AI model. Please refresh the page.')
        setIsLoading(false)
      }
    }
    loadModel()

    // Load speech synthesis voices
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setIsCameraOn(true)
          detectObjects()
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  // Stop camera - FIXED to clear canvas properly
  const stopCamera = () => {
    // Stop animation frame first
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
    
    setIsCameraOn(false)
    setDetectedObjects([])
  }

  // Object detection loop
  const detectObjects = useCallback(async () => {
    if (!model || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const detect = async () => {
      if (!isCameraOn && !streamRef.current) return

      try {
        const predictions = await model.detect(video)
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Draw bounding boxes and labels
        const uniqueObjects = []
        predictions.forEach(prediction => {
          if (prediction.score > 0.5) {
            const [x, y, width, height] = prediction.bbox
            const label = prediction.class.toLowerCase()

            // Draw box
            ctx.strokeStyle = '#4CAF50'
            ctx.lineWidth = 3
            ctx.strokeRect(x, y, width, height)

            // Draw label background
            ctx.fillStyle = '#4CAF50'
            const textWidth = ctx.measureText(label.toUpperCase()).width
            ctx.fillRect(x, y - 30, textWidth + 20, 30)

            // Draw label text
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 16px Poppins, sans-serif'
            ctx.fillText(label.toUpperCase(), x + 10, y - 10)

            // Track unique objects
            if (!uniqueObjects.find(o => o.label === label)) {
              uniqueObjects.push({
                label,
                confidence: Math.round(prediction.score * 100),
                translation: translations[label] || null
              })
            }
          }
        })

        setDetectedObjects(uniqueObjects)
      } catch (err) {
        console.error('Detection error:', err)
      }

      animationRef.current = requestAnimationFrame(detect)
    }

    detect()
  }, [model, isCameraOn])

  // Speak word using backend TTS proxy (supports all Indian languages)
  const speakWord = (word, language = 'en') => {
    // Language codes for Google TTS
    const langCodes = {
      en: 'en',
      hindi: 'hi',
      telugu: 'te',
      tamil: 'ta'
    }
    
    const lang = langCodes[language] || 'en'
    const encodedText = encodeURIComponent(word)
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/practice/tts?text=${encodedText}&lang=${lang}`
    
    const audio = new Audio(url)
    audio.play().catch(err => {
      console.error('TTS failed:', err)
      // Fallback to Web Speech API
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = language === 'en' ? 'en-US' : `${lang}-IN`
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    })
    
    setLastSpoken(word)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  // Add word to saved list
  const saveWord = (obj) => {
    if (!savedWords.find(w => w.label === obj.label)) {
      setSavedWords([...savedWords, obj])
    }
  }

  // Remove word from saved list
  const removeWord = (label) => {
    setSavedWords(savedWords.filter(w => w.label !== label))
  }

  // Go back to dashboard
  const goBack = () => {
    stopCamera()
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="ar-explorer-page">
        <div className="ar-explorer-loading">
          <div className="ar-loading-animation">
            <Sparkles className="ar-sparkle" />
            <Loader className="ar-spinner" />
          </div>
          <h2>Loading AI Vision...</h2>
          <p>Preparing object detection model</p>
          <div className="ar-loading-bar">
            <div className="ar-loading-progress"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="ar-explorer-page">
        <div className="ar-explorer-error">
          <CameraOff size={64} />
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <div className="ar-error-actions">
            <button onClick={() => navigate('/dashboard')} className="ar-back-btn">
              <Home size={18} />
              Go Home
            </button>
            <button onClick={() => window.location.reload()} className="ar-retry-btn">
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const languageFlags = {
    telugu: '🇮🇳',
    hindi: '🇮🇳', 
    tamil: '🇮🇳',
    en: '🇬🇧'
  }

  return (
    <div className="ar-explorer-page">
      {/* Top Navigation Bar */}
      <div className="ar-topbar">
        <button onClick={goBack} className="ar-nav-btn">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        
        <div className="ar-title-section">
          <Camera size={24} />
          <h1>AR Word Explorer</h1>
        </div>

        <button onClick={() => navigate('/dashboard')} className="ar-nav-btn ar-home-btn">
          <Home size={20} />
        </button>
      </div>

      <div className="ar-container">
        {/* Language Selector - Styled as Pills */}
        <div className="ar-language-pills">
          <span className="ar-lang-label">Learn in:</span>
          {[
            { code: 'telugu', name: 'Telugu', flag: 'తె' },
            { code: 'hindi', name: 'Hindi', flag: 'हि' },
            { code: 'tamil', name: 'Tamil', flag: 'த' },
          ].map(lang => (
            <button
              key={lang.code}
              className={`ar-lang-pill ${selectedLanguage === lang.code ? 'active' : ''}`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <span className="ar-lang-flag">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>

        <div className="ar-main">
          {/* Camera Feed */}
          <div className="ar-camera-section">
            <div className="ar-camera-wrapper">
              <div className={`ar-camera-container ${isCameraOn ? 'active' : ''}`}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ display: 'none' }}
                />
                <canvas ref={canvasRef} className="ar-canvas" />
                
                {!isCameraOn && (
                  <div className="ar-camera-placeholder">
                    <div className="ar-placeholder-icon">
                      <Camera size={48} />
                    </div>
                    <h3>Camera is Off</h3>
                    <p>Click the button below to start exploring</p>
                  </div>
                )}
              </div>
              
              {/* Camera Control Button */}
              <div className="ar-camera-controls">
                {!isCameraOn ? (
                  <button onClick={startCamera} className="ar-control-btn ar-start-btn">
                    <Camera size={22} />
                    <span>Start Camera</span>
                  </button>
                ) : (
                  <button onClick={stopCamera} className="ar-control-btn ar-stop-btn">
                    <CameraOff size={22} />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            </div>

            {/* Instructions */}
            {isCameraOn && (
              <div className="ar-instructions">
                <Sparkles size={16} />
                <span>Point your camera at objects around you to learn their names!</span>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="ar-results-panel">
            {/* Detected Objects */}
            <div className="ar-card ar-detected-card">
              <div className="ar-card-header">
                <span className="ar-card-icon">🔍</span>
                <h3>Detected Objects</h3>
                {detectedObjects.length > 0 && (
                  <span className="ar-badge">{detectedObjects.length}</span>
                )}
              </div>
              <div className="ar-card-content">
                {detectedObjects.length === 0 ? (
                  <div className="ar-empty-state">
                    <p>{isCameraOn ? 'Looking for objects...' : 'Start camera to detect objects'}</p>
                  </div>
                ) : (
                  <ul className="ar-object-list">
                    {detectedObjects.map((obj, idx) => (
                      <li key={idx} className="ar-object-item">
                        <div className="ar-object-main">
                          <div className="ar-object-words">
                            <span className="ar-word-english">{obj.label}</span>
                            {obj.translation && obj.translation[selectedLanguage] && (
                              <span className="ar-word-translation">
                                {obj.translation[selectedLanguage]}
                              </span>
                            )}
                          </div>
                          <span className="ar-confidence-badge">{obj.confidence}%</span>
                        </div>
                        <div className="ar-object-actions">
                          <button 
                            onClick={() => speakWord(obj.label, 'en')}
                            className="ar-action-btn"
                            title="Hear in English"
                          >
                            🇬🇧 <Volume2 size={14} />
                          </button>
                          {obj.translation && obj.translation[selectedLanguage] && (
                            <button 
                              onClick={() => speakWord(obj.translation[selectedLanguage], selectedLanguage)}
                              className="ar-action-btn ar-action-primary"
                              title={`Hear in ${selectedLanguage}`}
                            >
                              {languageFlags[selectedLanguage]} <Volume2 size={14} />
                            </button>
                          )}
                          <button 
                            onClick={() => saveWord(obj)}
                            className="ar-action-btn ar-action-save"
                            title="Save to vocabulary"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Saved Vocabulary */}
            <div className="ar-card ar-vocab-card">
              <div className="ar-card-header">
                <span className="ar-card-icon">📚</span>
                <h3>My Vocabulary</h3>
                <span className="ar-badge">{savedWords.length}</span>
              </div>
              <div className="ar-card-content">
                {savedWords.length === 0 ? (
                  <div className="ar-empty-state">
                    <p>Tap <Plus size={14} style={{display: 'inline', verticalAlign: 'middle'}} /> to save words</p>
                  </div>
                ) : (
                  <ul className="ar-vocab-list">
                    {savedWords.map((word, idx) => (
                      <li key={idx} className="ar-vocab-item">
                        <div className="ar-vocab-words">
                          <strong>{word.label}</strong>
                          {word.translation && word.translation[selectedLanguage] && (
                            <span>{word.translation[selectedLanguage]}</span>
                          )}
                        </div>
                        <button 
                          onClick={() => removeWord(word.label)}
                          className="ar-remove-btn"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="ar-toast">
          <Volume2 size={18} />
          <span>Playing: "{lastSpoken}"</span>
        </div>
      )}
    </div>
  )
}

export default ARExplorer
