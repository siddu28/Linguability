# Linguability 🌐

**Accessible Language Learning Platform for Learners with Learning Disabilities**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Linguability is a cloud-based, multi-modal language learning platform specifically designed to support learners with cognitive, linguistic, or sensory learning disabilities such as dyslexia, ADHD, autism spectrum-related processing challenges, or auditory comprehension difficulties.

---

## ✨ Key Features

### 🎯 Personalized Onboarding
- Interactive card-based questionnaire to understand learning goals
- Self-identification of learning challenges (dyslexia, ADHD, autism, auditory processing)
- Customizable daily learning time commitment
- Preference selection for audio, visual, or text-to-speech focused learning

### ♿ Accessibility & Assistive Features
- **Dyslexia-friendly fonts** with adjustable spacing and sizing
- **High contrast themes** and dark/light mode toggle
- **Text-to-Speech (TTS)** support using ResponsiveVoice for Hindi language
- **Adjustable pacing** and distraction-free navigation
- **Large clickable targets** and clear visual hierarchy
- **Reduced animations** mode for users with vestibular sensitivities

### 📚 Structured Learning Modules
- **Lessons**: Progressive language lessons with words, numbers, and sentences
- **Pronunciation Practice**: Speech-to-text enabled pronunciation training with real-time feedback
- **Assessments & Quizzes**: Multiple question types with save/resume functionality
- **Progress Tracking**: Visual progress indicators and completion statistics

### 👥 Collaborative Learning
- **Study Rooms**: Real-time collaborative spaces for group learning
- **Shared Activities**: Flashcards, pronunciation challenges, and quizzes
- **Video/Audio Chat**: Built-in communication tools (voice/video/screen sharing)
- **Activity Feed**: Live updates during collaborative sessions

### 🎨 User Experience
- Modern, premium UI with smooth animations and micro-interactions
- Responsive design for desktop and mobile devices
- Profile management with avatar selection
- Notification system for learning reminders and achievements

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **React Router v6** for navigation
- **Lucide React** for consistent iconography
- **Vanilla CSS** with CSS custom properties for theming

### Backend
- **Supabase** for authentication, database, and real-time subscriptions
- **PostgreSQL** database with Row Level Security (RLS)
- **Google OAuth** for seamless authentication
- **Express.js** API server (for extended functionality)

### APIs & Services
- **ResponsiveVoice.js** for Text-to-Speech (Hindi language support)
- **Web Speech API** for speech recognition in pronunciation practice
- **Supabase Realtime** for collaborative study room features

---

## 📁 Project Structure

```
Linguability/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx    # Navigation with profile dropdown
│   │   │   ├── LessonViewer.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── PronunciationTest.jsx
│   │   │   └── ...
│   │   ├── pages/            # Route pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Lessons.jsx
│   │   │   ├── Assessments.jsx
│   │   │   ├── Practice.jsx
│   │   │   ├── StudyRooms.jsx
│   │   │   ├── PronunciationPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   └── Login.jsx
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── lib/              # Utilities and database functions
│   │   │   ├── supabaseClient.js
│   │   │   └── database.js
│   │   ├── data/             # Static lesson content
│   │   │   ├── wordsData.js
│   │   │   ├── numbersData.js
│   │   │   ├── sentencesData.js
│   │   │   ├── pronunciationData.js
│   │   │   └── quizData.js
│   │   └── hooks/            # Custom React hooks
│   └── index.html
├── backend/
│   ├── server.js             # Express.js server
│   ├── routes/               # API routes
│   └── data/                 # Backend data files
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/siddu28/Linguability.git
   cd Linguability
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Backend Setup (Optional)

```bash
cd backend
npm install
node server.js
```

---

## 🗄️ Database Schema

The application uses Supabase with the following main tables:

| Table | Description |
|-------|-------------|
| `profiles` | User profile data including learning challenges and preferences |
| `user_settings` | Accessibility settings (font size, contrast, TTS, etc.) |
| `lesson_progress` | Tracks individual lesson completion and progress |
| `assessment_results` | Stores quiz and assessment scores |
| `pronunciation_results` | Records pronunciation practice attempts |
| `quiz_progress` | Enables save/resume functionality for quizzes |
| `notifications` | User notification history |

---

## 🎨 Accessibility Settings

Users can customize their experience with:

| Setting | Options |
|---------|---------|
| Font Size | Small, Medium, Large, Extra Large |
| Contrast | Normal, High Contrast, Dark Mode |
| Text-to-Speech | Enable/Disable with speed control |
| Dyslexia Mode | OpenDyslexic font, increased spacing |
| Reduced Motion | Minimize animations |
| Reading Guide | Visual guide overlay |

---

## 🌍 Localization

- Primary focus on **Hindi** language learning
- Text-to-speech support for Hindi pronunciation
- Content designed for Indian learners with cultural relevance

---

## 👥 Team

Developed as part of an academic project demonstrating:
- Thoughtful accessibility and inclusivity
- Technical sophistication with modern web technologies
- Social relevance in addressing learning barriers

---

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend infrastructure
- [ResponsiveVoice](https://responsivevoice.org) for TTS capabilities
- [Lucide](https://lucide.dev) for beautiful icons
- Research on accessibility guidelines from W3C WAI

---

<p align="center">
  Made with ❤️ for inclusive education
</p>
</CodeContent>
