import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./practice.css";

function PronunciationPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [spoken, setSpoken] = useState("");
    const [result, setResult] = useState(null);
    const [searchParams] = useSearchParams();
    const lang = searchParams.get("lang") || "english";

    useEffect(() => {
        fetch(`http://localhost:3001/api/practice/${lang}/pronunciation`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setWords(data);
                } else {
                    console.error("Invalid data format received");
                    setWords([]);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    const startRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();

        // Map language IDs to BCP 47 language tags for recognition
        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN'
        };
        recognition.lang = langMap[lang] || "en-US";

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setSpoken(text);
            checkPronunciation(text);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        recognition.start();
    };

    const checkPronunciation = async (spokenText) => {
        const current = words[index];

        try {
            const res = await fetch("http://localhost:3001/api/practice/check-pronunciation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expected: current.text, spoken: spokenText }),
            });

            const data = await res.json();
            setResult(data.isMatch);
        } catch (error) {
            console.error("Error checking pronunciation:", error);
        }
    };

    const next = () => {
        setIndex((prev) => (prev + 1) % words.length);
        setSpoken("");
        setResult(null);
    };

    if (!words.length) return (
        <>
            <Navbar />
            <div className="practice-page">
                <p>Loading {lang} pronunciation...</p>
            </div>
        </>
    );

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>🎤 Pronunciation Practice ({lang})</h2>
                    <h3>Say: {words[index].text}</h3>

                    <button onClick={startRecognition} className="record-btn">
                        🎤 Speak
                    </button>

                    {spoken && <p>You said: {spoken}</p>}
                    {result !== null && (
                        <p className={result ? "correct" : "wrong"}>
                            {result ? "Correct ✅" : "Try Again ❌"}
                        </p>
                    )}

                    <button className="next-btn" onClick={next}>Next ➡</button>
                </div>
            </div>
        </>
    );
}

export default PronunciationPractice;
