import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./practice.css";

function VocabularyPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [searchParams] = useSearchParams();
    const lang = searchParams.get("lang") || "english";

    useEffect(() => {
        fetch(`http://localhost:3001/api/practice/${lang}/vocabulary`)
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

    const nextWord = () => {
        setIndex((prev) => (prev + 1) % words.length);
        setShowAnswer(false);
    };

    if (!words.length) return (
        <>
            <Navbar />
            <div className="practice-page">
                <p>Loading {lang} vocabulary...</p>
            </div>
        </>
    );

    const current = words[index];

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>📚 Vocabulary Practice ({lang})</h2>
                    <h3>{current.word}</h3>

                    {showAnswer ? (
                        <>
                            <p><b>Meaning:</b> {current.meaning}</p>
                            <p><b>Example:</b> {current.example}</p>
                        </>
                    ) : (
                        <button onClick={() => setShowAnswer(true)}>Show Meaning</button>
                    )}

                    <button className="next-btn" onClick={nextWord}>Next ➡</button>
                </div>
            </div>
        </>
    );
}

export default VocabularyPractice;
