import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "./practice.css";

function PronunciationPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [spoken, setSpoken] = useState("");
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/api/practice")
            .then(res => res.json())
            .then(data => setWords(data.english.pronunciation));
    }, []);

    const startRecognition = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setSpoken(text);
            checkPronunciation(text);
        };

        recognition.start();
    };

    const checkPronunciation = async (spokenText) => {
        const current = words[index];

        const res = await fetch("http://localhost:3001/api/practice/check-pronunciation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expected: current.text, spoken: spokenText }),
        });

        const data = await res.json();
        setResult(data.isMatch);
    };

    const next = () => {
        setIndex((prev) => (prev + 1) % words.length);
        setSpoken("");
        setResult(null);
    };

    if (!words.length) return <p>Loading...</p>;

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>🎤 Pronunciation Practice</h2>
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

                    <button onClick={next}>Next ➡</button>
                </div>
            </div>
        </>
    );
}


export default PronunciationPractice;
