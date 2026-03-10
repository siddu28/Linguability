import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { savePracticeProgress, getPracticeProgress, getLearnedWords } from "../../lib/database";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import Tesseract from "tesseract.js";
import {
    ArrowLeft, ChevronRight, PenTool, Type, Eraser, RotateCcw,
    CheckCircle2, XCircle, Send, Lightbulb, Palette, ScanSearch, Edit3, Loader
} from "lucide-react";
import "./WritingPractice.css";
import "./practice.css";

// Map our language names to Tesseract language codes
// Use native script only (not +eng) to avoid confusing the OCR engine
const TESSERACT_LANGS = {
    english: "eng",
    hindi: "hin",
    tamil: "tam",
    telugu: "tel",
};

const PEN_COLORS = [
    { name: "Black", value: "#1e293b" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#22c55e" },
    { name: "Purple", value: "#a855f7" },
];

const PEN_SIZES = [2, 4, 6, 8];

function WritingPractice() {
    const [prompts, setPrompts] = useState([]);
    const [index, setIndex] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const lang = searchParams.get("lang") || "english";
    const saveTimeoutRef = useRef(null);

    // Canvas state
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState("#1e293b");
    const [penSize, setPenSize] = useState(6);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Input mode: "draw" or "type"
    const [inputMode, setInputMode] = useState("draw");
    const [typedResponse, setTypedResponse] = useState("");

    // OCR state
    const [isRecognizing, setIsRecognizing] = useState(false);
    const [recognizedText, setRecognizedText] = useState("");
    const [ocrDone, setOcrDone] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);

    // Evaluation state
    const [evaluation, setEvaluation] = useState(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [showHint, setShowHint] = useState(false);

    // Scores for animation
    const [animatedScore, setAnimatedScore] = useState(0);

    const langNames = {
        english: "English",
        hindi: "Hindi",
        tamil: "Tamil",
        telugu: "Telugu",
    };

    // ===================== DATA LOADING =====================
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                // Load static prompts (fast, instant)
                const staticRes = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/evaluate/prompts/${lang}`
                );
                const staticData = await staticRes.json();
                
                if (cancelled) return;
                
                if (Array.isArray(staticData) && staticData.length > 0) {
                    setPrompts(staticData);
                    
                    // Restore saved progress
                    if (user?.id) {
                        const saved = await getPracticeProgress(user.id, lang, "writing");
                        if (!cancelled && saved) {
                            const restoredIndex = Math.min(saved.current_index, staticData.length - 1);
                            setIndex(restoredIndex);
                            setCompletedCount(saved.completed_count || 0);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching writing prompts:", err);
            } finally {
                if (!cancelled) setProgressLoaded(true);
            }
        }

        loadData();
        return () => {
            cancelled = true;
        };
    }, [lang, user?.id]);

    // ===================== PROGRESS SAVING =====================
    const saveProgress = (newIndex, newCompletedCount) => {
        if (!user?.id) return;
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            savePracticeProgress(user.id, {
                language: lang,
                practice_type: "writing",
                current_index: newIndex,
                completed_count: newCompletedCount,
            });
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (user?.id && prompts.length > 0) {
                savePracticeProgress(user.id, {
                    language: lang,
                    practice_type: "writing",
                    current_index: index,
                    completed_count: completedCount,
                });
            }
        };
    }, [user?.id, lang, index, completedCount, prompts.length]);

    // ===================== CANVAS DRAWING =====================
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = 300 * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = "300px";

        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Draw guidelines
        drawGuidelines(ctx, rect.width, 300);
    }, []);

    useEffect(() => {
        if (inputMode === "draw") {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(initCanvas, 50);
            return () => clearTimeout(timer);
        }
    }, [inputMode, index, initCanvas]);

    // Reinit on window resize
    useEffect(() => {
        const handleResize = () => {
            if (inputMode === "draw") initCanvas();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [inputMode, initCanvas]);

    function drawGuidelines(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Horizontal center line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Horizontal baseline
        ctx.beginPath();
        ctx.moveTo(0, height * 0.75);
        ctx.lineTo(width, height * 0.75);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.restore();
    }

    function getCanvasCoords(e) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function startDrawing(e) {
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { x, y } = getCanvasCoords(e);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        setIsDrawing(true);
        setHasDrawn(true);
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const { x, y } = getCanvasCoords(e);

        ctx.lineTo(x, y);
        ctx.stroke();
    }

    function stopDrawing() {
        setIsDrawing(false);
    }

    function clearCanvas() {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const rect = canvas.parentElement.getBoundingClientRect();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGuidelines(ctx, rect.width, 300);
        setHasDrawn(false);
    }

    // ===================== OCR RECOGNITION =====================

    /**
     * Preprocess the canvas image for better OCR accuracy:
     * 1. Fill white background (canvas is transparent by default)
     * 2. Upscale 2x for higher resolution input
     * 3. Convert to grayscale
     * 4. Apply contrast boost + binarization (black text on white bg)
     */
    function preprocessCanvasForOCR(sourceCanvas) {
        const dpr = window.devicePixelRatio || 1;
        const srcW = sourceCanvas.width;
        const srcH = sourceCanvas.height;

        // Scale factor for upscaling (higher res = better OCR)
        const scale = 2;
        const outW = srcW * scale;
        const outH = srcH * scale;

        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = outW;
        tmpCanvas.height = outH;
        const tmpCtx = tmpCanvas.getContext("2d");

        // Step 1: White background
        tmpCtx.fillStyle = "#ffffff";
        tmpCtx.fillRect(0, 0, outW, outH);

        // Step 2: Draw original content upscaled
        tmpCtx.drawImage(sourceCanvas, 0, 0, outW, outH);

        // Step 3: Grayscale + contrast boost + binarization
        const imageData = tmpCtx.getImageData(0, 0, outW, outH);
        const data = imageData.data;

        // Convert to grayscale and find min/max for contrast stretching
        const grayValues = [];
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            grayValues.push(gray);
        }

        // Find a good threshold using a percentile approach
        // Ink pixels are typically dark, background is white
        const sorted = [...grayValues].sort((a, b) => a - b);
        // Use the 15th percentile as a rough ink detection threshold
        const darkThreshold = Math.min(sorted[Math.floor(sorted.length * 0.15)], 180);
        // Binarization threshold: anything darker than midpoint becomes black
        const binThreshold = (darkThreshold + 255) / 2;

        for (let i = 0; i < grayValues.length; i++) {
            const idx = i * 4;
            const gray = grayValues[i];

            // Contrast stretch then binarize
            const val = gray < binThreshold ? 0 : 255;
            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
            data[idx + 3] = 255;
        }

        tmpCtx.putImageData(imageData, 0, 0);
        return tmpCanvas.toDataURL("image/png");
    }

    async function handleRecognize() {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;

        setIsRecognizing(true);
        setOcrProgress(0);
        setRecognizedText("");
        setOcrDone(false);

        try {
            // Preprocess image for better OCR accuracy
            const processedDataUrl = preprocessCanvasForOCR(canvas);
            const tessLang = TESSERACT_LANGS[lang] || "eng";

            const result = await Tesseract.recognize(processedDataUrl, tessLang, {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                },
                // PSM 7 = Treat the image as a single text line
                tessedit_pageseg_mode: "7",
            });

            let text = result.data.text.trim();
            // Clean up common OCR artifacts
            text = text.replace(/[\n\r]+/g, " ").trim();
            setRecognizedText(text);
            setOcrDone(true);

            if (!text) {
                setRecognizedText("");
            }
        } catch (err) {
            console.error("OCR error:", err);
            setRecognizedText("");
            setOcrDone(true);
        } finally {
            setIsRecognizing(false);
        }
    }

    // ===================== EVALUATION =====================
    async function handleSubmit() {
        // In draw mode, use recognized text; in type mode, use typed text
        const responseText =
            inputMode === "draw" ? recognizedText : typedResponse;

        if (!responseText.trim()) return;

        setIsEvaluating(true);
        setEvaluation(null);
        setAnimatedScore(0);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/evaluate/written`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language: lang,
                        promptId: prompts[index].id,
                        userResponse: responseText.trim(),
                        ...(prompts[index].hint ? { expectedText: prompts[index].hint } : {}),
                    }),
                }
            );

            const data = await res.json();
            setEvaluation(data);

            // Animate score
            const target = data.overallScore;
            let current = 0;
            const step = Math.max(1, Math.floor(target / 30));
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                setAnimatedScore(current);
            }, 20);
        } catch (err) {
            console.error("Error evaluating response:", err);
            setEvaluation({
                overallScore: 0,
                feedback: {
                    summary: "Could not evaluate your response. Please try again.",
                    details: [],
                },
                isCorrect: false,
            });
        } finally {
            setIsEvaluating(false);
        }
    }

    // ===================== NAVIGATION =====================
    function nextPrompt() {
        const newIndex = (index + 1) % prompts.length;
        const newCompleted = completedCount + 1;
        setIndex(newIndex);
        setCompletedCount(newCompleted);
        setEvaluation(null);
        setTypedResponse("");
        setRecognizedText("");
        setOcrDone(false);
        setOcrProgress(0);
        setShowHint(false);
        setHasDrawn(false);
        setAnimatedScore(0);
        saveProgress(newIndex, newCompleted);

        if (inputMode === "draw") {
            setTimeout(clearCanvas, 100);
        }
    }

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            if (e.key === "Enter" && evaluation) {
                nextPrompt();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [evaluation, prompts, index, completedCount]);

    // ===================== RENDER =====================
    if (!prompts.length || !progressLoaded) {
        return (
            <div className="practice-layout">
                <Navbar />
                <div className="practice-page">
                    <p>Loading {langNames[lang]} writing prompts...</p>
                </div>
            </div>
        );
    }

    const current = prompts[index];

    function getScoreColor(score) {
        if (score >= 80) return "#22c55e";
        if (score >= 60) return "#eab308";
        if (score >= 40) return "#f97316";
        return "#ef4444";
    }

    return (
        <div className="practice-layout">
            <Navbar />

            <div className="practice-page">
                {/* Top Progress Bar */}
                <div className="practice-top-progress">
                    <span>
                        Prompt {index + 1} of {prompts.length}
                    </span>
                    <div className="top-progress-bar">
                        <div
                            className="top-progress-fill"
                            style={{
                                width: `${((index + 1) / prompts.length) * 100}%`,
                                backgroundColor: "var(--color-success)",
                            }}
                        />
                    </div>
                    <span>{Math.round(((index + 1) / prompts.length) * 100)}% complete</span>
                </div>

                <div className="practice-card practice-card-animated" key={index}>
                    {/* Header */}
                    <div className="practice-header-nav">
                        <button
                            className="back-btn"
                            onClick={() => navigate(`/practice?lang=${lang}`)}
                        >
                            <ArrowLeft size={16} /> Back to Practice
                        </button>
                        {completedCount > 0 && (
                            <span
                                style={{
                                    marginLeft: "auto",
                                    fontSize: "0.85rem",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {completedCount} prompts completed
                            </span>
                        )}
                    </div>

                    {/* Prompt Display */}
                    <div className="writing-prompt-display">
                        <div className="writing-prompt-badge">
                            <PenTool size={16} />
                            <span>{current.category}</span>
                        </div>
                        <h2 className="writing-prompt-text">{current.prompt}</h2>

                        {/* Hint toggle */}
                        <button
                            className={`writing-hint-btn ${showHint ? "active" : ""}`}
                            onClick={() => setShowHint(!showHint)}
                        >
                            <Lightbulb size={14} />
                            {showHint ? "Hide" : "Show"} Reference
                        </button>
                        {showHint && (
                            <div className="writing-hint-box">
                                <span className="writing-hint-label">Expected:</span>
                                <span className="writing-hint-text">{current.hint}</span>
                            </div>
                        )}
                    </div>

                    {/* Mode Toggle */}
                    <div className="writing-mode-toggle">
                        <button
                            className={`mode-toggle-btn ${inputMode === "draw" ? "active" : ""}`}
                            onClick={() => setInputMode("draw")}
                        >
                            <PenTool size={16} />
                            Draw
                        </button>
                        <button
                            className={`mode-toggle-btn ${inputMode === "type" ? "active" : ""}`}
                            onClick={() => setInputMode("type")}
                        >
                            <Type size={16} />
                            Type
                        </button>
                    </div>

                    {/* Drawing Canvas */}
                    {inputMode === "draw" && (
                        <div className="writing-canvas-container">
                            {/* Canvas Toolbar */}
                            <div className="canvas-toolbar">
                                <div className="toolbar-left">
                                    <div className="pen-color-picker">
                                        <button
                                            className="toolbar-btn color-btn"
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                            title="Change pen color"
                                        >
                                            <Palette size={16} />
                                            <span
                                                className="color-dot"
                                                style={{ backgroundColor: penColor }}
                                            />
                                        </button>
                                        {showColorPicker && (
                                            <div className="color-dropdown">
                                                {PEN_COLORS.map((c) => (
                                                    <button
                                                        key={c.value}
                                                        className={`color-option ${penColor === c.value ? "selected" : ""}`}
                                                        style={{ backgroundColor: c.value }}
                                                        onClick={() => {
                                                            setPenColor(c.value);
                                                            setShowColorPicker(false);
                                                        }}
                                                        title={c.name}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pen-size-picker">
                                        {PEN_SIZES.map((size) => (
                                            <button
                                                key={size}
                                                className={`size-btn ${penSize === size ? "active" : ""}`}
                                                onClick={() => setPenSize(size)}
                                                title={`Pen size ${size}`}
                                            >
                                                <span
                                                    className="size-dot"
                                                    style={{
                                                        width: `${size + 4}px`,
                                                        height: `${size + 4}px`,
                                                    }}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="toolbar-right">
                                    <button
                                        className="toolbar-btn"
                                        onClick={clearCanvas}
                                        title="Clear canvas"
                                    >
                                        <Eraser size={16} />
                                        Clear
                                    </button>
                                </div>
                            </div>

                            {/* Canvas */}
                            <canvas
                                ref={canvasRef}
                                className="writing-canvas"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />

                            {/* OCR Recognition Section */}
                            {!ocrDone && !evaluation && (
                                <div className="ocr-action-section">
                                    <Button
                                        variant="primary"
                                        onClick={handleRecognize}
                                        disabled={!hasDrawn || isRecognizing}
                                        style={{ minWidth: "220px" }}
                                    >
                                        {isRecognizing ? (
                                            <>
                                                <Loader size={18} className="spin-icon" />
                                                Recognizing... {ocrProgress}%
                                            </>
                                        ) : (
                                            <>
                                                <ScanSearch size={18} /> Recognize My Writing
                                            </>
                                        )}
                                    </Button>
                                    {isRecognizing && (
                                        <div className="ocr-progress-bar">
                                            <div
                                                className="ocr-progress-fill"
                                                style={{ width: `${ocrProgress}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recognized Text (editable) */}
                            {ocrDone && !evaluation && (
                                <div className="ocr-result-section">
                                    <label className="confirm-label">
                                        <ScanSearch size={14} />
                                        Recognized text (you can edit if needed):
                                    </label>
                                    <div className="ocr-result-box">
                                        <input
                                            type="text"
                                            className="confirm-input"
                                            value={recognizedText}
                                            onChange={(e) => setRecognizedText(e.target.value)}
                                            placeholder="No text recognized — try writing more clearly or edit here"
                                        />
                                        <button
                                            className="toolbar-btn retry-btn"
                                            onClick={() => {
                                                setOcrDone(false);
                                                setRecognizedText("");
                                            }}
                                            title="Re-recognize"
                                        >
                                            <RotateCcw size={14} /> Retry
                                        </button>
                                    </div>
                                    {!recognizedText.trim() && (
                                        <p className="ocr-hint">
                                            💡 Tip: Write larger characters with a thicker pen for better recognition
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Type Mode */}
                    {inputMode === "type" && (
                        <div className="writing-type-container">
                            <textarea
                                className="writing-textarea"
                                value={typedResponse}
                                onChange={(e) => setTypedResponse(e.target.value)}
                                placeholder={`Type your ${langNames[lang]} answer here...`}
                                rows={4}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey && typedResponse.trim() && !evaluation) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Submit / Next Buttons */}
                    {!evaluation ? (
                        <div className="action-buttons" style={{ marginTop: "1.5rem" }}>
                            {/* In draw mode, only show Submit after OCR is done */}
                            {(inputMode === "type" || (inputMode === "draw" && ocrDone)) && (
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={
                                        (inputMode === "type" && !typedResponse.trim()) ||
                                        (inputMode === "draw" && !recognizedText.trim()) ||
                                        isEvaluating
                                    }
                                    style={{ minWidth: "200px" }}
                                >
                                    {isEvaluating ? (
                                        <><Loader size={18} className="spin-icon" /> Analyzing...</>
                                    ) : (
                                        <>
                                            <Send size={18} /> Submit Answer
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ============ EVALUATION RESULTS ============ */}
                            <div className="writing-evaluation-results">
                                {/* Score Circle */}
                                <div className="evaluation-score-section">
                                    <div
                                        className="score-circle"
                                        style={{
                                            "--score-color": getScoreColor(evaluation.overallScore),
                                            "--score-deg": `${(animatedScore / 100) * 360}deg`,
                                        }}
                                    >
                                        <span className="score-number">{animatedScore}</span>
                                        <span className="score-label">/ 100</span>
                                    </div>
                                    <div className="score-verdict">
                                        {evaluation.isCorrect ? (
                                            <span className="verdict-correct">
                                                <CheckCircle2 size={20} /> Correct!
                                            </span>
                                        ) : (
                                            <span className="verdict-incorrect">
                                                <XCircle size={20} /> Needs Improvement
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Feedback Summary */}
                                <div className="evaluation-summary">
                                    <p>{evaluation.feedback?.summary}</p>
                                </div>

                                {/* Expected Answer */}
                                <div className="evaluation-expected">
                                    <span className="expected-label">Expected Answer:</span>
                                    <span className="expected-text">{evaluation.expected}</span>
                                </div>

                                {/* Your Answer */}
                                <div className="evaluation-yours">
                                    <span className="yours-label">Your Answer:</span>
                                    <span className="yours-text">{evaluation.userResponse}</span>
                                </div>

                                {/* Detailed Breakdown */}
                                {evaluation.feedback?.details?.length > 0 && (
                                    <div className="evaluation-details">
                                        <h4 className="details-title">Detailed Breakdown</h4>
                                        <div className="details-grid">
                                            {evaluation.feedback.details.map((detail, i) => (
                                                <div key={i} className="detail-card">
                                                    <div className="detail-header">
                                                        <span className="detail-aspect">{detail.aspect}</span>
                                                        <span
                                                            className="detail-score"
                                                            style={{ color: getScoreColor(detail.score) }}
                                                        >
                                                            {detail.score}%
                                                        </span>
                                                    </div>
                                                    <div className="detail-bar">
                                                        <div
                                                            className="detail-fill"
                                                            style={{
                                                                width: `${detail.score}%`,
                                                                backgroundColor: getScoreColor(detail.score),
                                                            }}
                                                        />
                                                    </div>
                                                    <p className="detail-comment">{detail.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Accepted Alternatives */}
                                {evaluation.acceptedAlternatives?.length > 1 && (
                                    <div className="evaluation-alternatives">
                                        <h4 className="alternatives-title">Also accepted:</h4>
                                        <div className="alternatives-list">
                                            {evaluation.acceptedAlternatives
                                                .slice(0, 5)
                                                .map((alt, i) => (
                                                    <span key={i} className="alternative-chip">
                                                        {alt}
                                                    </span>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Next Button */}
                            <div className="action-buttons" style={{ marginTop: "1.5rem" }}>
                                <Button
                                    variant="primary"
                                    onClick={nextPrompt}
                                    style={{ minWidth: "200px" }}
                                >
                                    Next Prompt <ChevronRight size={18} />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WritingPractice;
