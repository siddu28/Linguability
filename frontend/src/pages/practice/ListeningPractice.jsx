import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import "./Practice.css";

function ListeningPractice() {
    const [list, setList] = useState([]);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        fetch("http://localhost:3001/api/practice")
            .then(res => res.json())
            .then(data => setList(data.english.listening));
    }, []);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    const next = () => {
        setIndex((prev) => (prev + 1) % list.length);
    };

    if (!list.length) return <p>Loading...</p>;

    const current = list[index];

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>🎧 Listening Practice</h2>
                    <button onClick={() => speak(current.text)} className="play-btn">
                        🔊 Play Audio
                    </button>
                    <button onClick={next}>Next ➡</button>
                </div>
            </div>

        </>
    );
}

export default ListeningPractice;
