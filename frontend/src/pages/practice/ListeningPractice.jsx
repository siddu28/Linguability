import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "./practice.css";

function ListeningPractice() {
    const [list, setList] = useState([]);
    const [index, setIndex] = useState(0);
    const [searchParams] = useSearchParams();
    const lang = searchParams.get("lang") || "english";

    useEffect(() => {
        // Fetch data for specific language
        fetch(`http://localhost:3001/api/practice/${lang}/listening`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setList(data);
                } else {
                    console.error("Invalid data format received");
                    setList([]);
                }
            })
            .catch(err => console.error("Error fetching practice data:", err));
    }, [lang]);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);

        // Map language IDs to BCP 47 language tags
        const langMap = {
            'english': 'en-US',
            'hindi': 'hi-IN',
            'tamil': 'ta-IN',
            'telugu': 'te-IN'
        };

        utterance.lang = langMap[lang] || 'en-US';
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    const next = () => {
        setIndex((prev) => (prev + 1) % list.length);
    };

    if (!list.length) return (
        <>
            <Navbar />
            <div className="practice-page">
                <p>Loading {lang} practice...</p>
            </div>
        </>
    );

    const current = list[index];

    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-card">
                    <h2>🎧 Listening Practice ({lang})</h2>
                    <p className="practice-instruction">Listen and convert the speech to text (mental check)</p>
                    <button onClick={() => speak(current.text)} className="play-btn">
                        🔊 Play Audio
                    </button>
                    <button onClick={next} className="next-btn">Next ➡</button>
                </div>
            </div>
        </>
    );
}

export default ListeningPractice;
