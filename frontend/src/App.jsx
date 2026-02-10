import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Logout from './pages/Logout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Lessons from './pages/Lessons'
import Practice from './pages/Practice'
import Profile from './pages/Profile'
import Assessments from './pages/Assessments'
import QuizPage from './pages/QuizPage'
import PronunciationPage from './pages/PronunciationPage'
import StudyRooms from './pages/StudyRooms'
import StudyRoom from './pages/StudyRoom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

const VocabularyPractice = lazy(() => import("./pages/practice/VocabularyPractice"));
const ListeningPractice = lazy(() => import("./pages/practice/ListeningPractice"));
const PronunciationPractice = lazy(() => import("./pages/practice/PronunciationPractice"));

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="loading-state">Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/logout" element={<Logout />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <Notifications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/lessons"
                            element={
                                <ProtectedRoute>
                                    <Lessons />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/practice"
                            element={
                                <ProtectedRoute>
                                    <Practice />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/practice/vocabulary"
                            element={
                                <ProtectedRoute>
                                    <VocabularyPractice />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/practice/listening"
                            element={
                                <ProtectedRoute>
                                    <ListeningPractice />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/practice/pronunciation"
                            element={
                                <ProtectedRoute>
                                    <PronunciationPractice />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/assessments"
                            element={
                                <ProtectedRoute>
                                    <Assessments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/study-rooms"
                            element={
                                <ProtectedRoute>
                                    <StudyRooms />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/study-rooms/:roomId"
                            element={
                                <ProtectedRoute>
                                    <StudyRoom />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Suspense>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/onboarding" element={<Onboarding />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <ProtectedRoute>
                                <Notifications />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/lessons"
                        element={
                            <ProtectedRoute>
                                <Lessons />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/practice"
                        element={
                            <ProtectedRoute>
                                <Practice />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assessments"
                        element={
                            <ProtectedRoute>
                                <Assessments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assessments/quiz/:quizId"
                        element={
                            <ProtectedRoute>
                                <QuizPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/assessments/pronunciation/:testId"
                        element={
                            <ProtectedRoute>
                                <PronunciationPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/study-rooms"
                        element={
                            <ProtectedRoute>
                                <StudyRooms />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/study-rooms/:roomId"
                        element={
                            <ProtectedRoute>
                                <StudyRoom />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
