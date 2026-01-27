import Navbar from '../components/Navbar'
import Card from '../components/Card'
import './Lessons.css'

function Lessons() {
    const lessons = [
        {
            id: 1,
            language: 'Hindi',
            title: 'Hindi Basics',
            lessons: [
                { id: 1, title: 'Lesson 1: Introduction to Hindi', completed: true },
                { id: 2, title: 'Lesson 2: Hindi Alphabets', completed: true },
                { id: 3, title: 'Lesson 3: Common Greetings', completed: false, inProgress: true },
                { id: 4, title: 'Lesson 4: Numbers 1-10', completed: false },
            ]
        },
        {
            id: 2,
            language: 'Tamil',
            title: 'Tamil Basics',
            lessons: [
                { id: 1, title: 'Lesson 1: Introduction to Tamil', completed: false },
                { id: 2, title: 'Lesson 2: Tamil Alphabets', completed: false },
            ]
        },
    ]

    return (
        <div className="lessons-page">
            <Navbar />

            <main className="lessons-content">
                <div className="lessons-header">
                    <h1 className="lessons-title">Lessons</h1>
                    <p className="lessons-subtitle">Choose a lesson to start learning</p>
                </div>

                <div className="lessons-list">
                    {lessons.map((course) => (
                        <Card key={course.id} className="course-card">
                            <h2 className="course-title">{course.title}</h2>
                            <p className="course-language">{course.language}</p>

                            <div className="lesson-items">
                                {course.lessons.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className={`lesson-item ${lesson.completed ? 'completed' : ''} ${lesson.inProgress ? 'in-progress' : ''}`}
                                    >
                                        <div className="lesson-status">
                                            {lesson.completed && <span className="check">✓</span>}
                                            {lesson.inProgress && <span className="progress-dot" />}
                                            {!lesson.completed && !lesson.inProgress && <span className="empty-dot" />}
                                        </div>
                                        <span className="lesson-name">{lesson.title}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Lessons
