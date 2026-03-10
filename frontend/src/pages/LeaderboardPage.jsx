import Navbar from '../components/Navbar'
import Leaderboard from '../components/Leaderboard'
import Card from '../components/Card'
import './LeaderboardPage.css'

function LeaderboardPage() {
    return (
        <div className="leaderboard-page">
            <Navbar />
            <main className="leaderboard-content">
                <div className="leaderboard-header">
                    <h1>Leaderboard</h1>
                    <p>Compete with other learners and climb the ranks!</p>
                </div>
                <Card className="leaderboard-main-card">
                    <Leaderboard />
                </Card>
            </main>
        </div>
    )
}

export default LeaderboardPage
