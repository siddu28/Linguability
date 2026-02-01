import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Practice.css";

export default function Practice() {
    return (
        <>
            <Navbar />
            <div className="practice-page">
                <div className="practice-content">
                    <h1 className="practice-title">Practice Arena</h1>
                    <p className="practice-subtitle">Master your skills with interactive exercises</p>

                    <div className="practice-grid">
                        <Link to="/practice/pronunciation" className="practice-card">
                            <div className="practice-icon">🎤</div>
                            <h2>Pronunciation</h2>
                            <p>Perfect your accent with real-time feedback.</p>
                            <button className="practice-btn">Start Practice</button>
                        </Link>

                        <Link to="/practice/listening" className="practice-card">
                            <div className="practice-icon">🎧</div>
                            <h2>Listening</h2>
                            <p>Train your ears with diverse audio clips.</p>
                            <button className="practice-btn">Start Practice</button>
                        </Link>

                        <Link to="/practice/vocabulary" className="practice-card">
                            <div className="practice-icon">📚</div>
                            <h2>Vocabulary</h2>
                            <p>Expand your word bank with flashcards.</p>
                            <button className="practice-btn">Start Practice</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
