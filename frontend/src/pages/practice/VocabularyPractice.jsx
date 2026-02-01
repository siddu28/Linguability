import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "./practice.css";

function VocabularyPractice() {
    const [words, setWords] = useState([]);
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        fetch("http://localhost:3001/api/practice")
            .then(res => res.json())
            .then(data => setWords(data.english.vocabulary));
    }, []);

    const nextWord = () => {
        setIndex((prev) => (prev + 1) % words.length);
        setShowAnswer(false);
    };

    if (!words.length) return <p>Loading...</p>;

    const current = words[index];

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>📚 Vocabulary Practice</h2>
                    <h3>{current.word}</h3>

                    {showAnswer ? (
                        <>
                            <p><b>Meaning:</b> {current.meaning}</p>
                            <p><b>Example:</b> {current.example}</p>
                        </>
                    ) : (
                        <button onClick={() => setShowAnswer(true)}>Show Meaning</button>
                    )}

                    <button onClick={nextWord}>Next ➡</button>


                </div>
            </div>
        </>
    );
}


export default VocabularyPractice;
