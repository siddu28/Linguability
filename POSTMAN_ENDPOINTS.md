# Linguability — Postman API Endpoints

## Setup

### Base URLs
- **Supabase:** `https://qmoflreegstjebzzdoft.supabase.co`
- **Express Backend:** `http://localhost:3001` (requires `npm run dev` in backend folder)

### Your User ID
```
ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```

### Required Headers (for all Supabase endpoints)
| Key | Value |
|-----|-------|
| `apikey` | `sb_publishable_DZmxAmQje9MCykm_xEMgdA__osjJvz0` |
| `Authorization` | `Bearer <your-token>` |

### How to Get Your Token
1. Open `http://localhost:5173/` and log in with Google
2. Open DevTools (F12) → Console
3. Run:
   ```js
   JSON.parse(localStorage.getItem('sb-qmoflreegstjebzzdoft-auth-token')).access_token
   ```
4. Copy the token and use it in the `Authorization` header as `Bearer <token>`

> ⚠️ Token expires in ~1 hour. Refresh from browser console when you get `401`.

---

## 🔐 Auth

### 1. Get Current User
```
GET  https://qmoflreegstjebzzdoft.supabase.co/auth/v1/user
```
**Headers:** apikey + Authorization
**Returns:** User profile, email, Google metadata

---

## 👤 Profile

### 2. Get User Profile
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/profiles?select=*&id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Full name, learning challenges, onboarding status

---

## ⚙️ User Settings (Accessibility)

### 3. Get User Settings
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/user_settings?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Font size, font family, focus mode, high contrast, TTS, reading speed, etc.

---

## 📖 Lesson Progress

### 4. Get Lesson Progress
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/lesson_progress?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Lessons with status (completed/in_progress), progress_percent, timestamps

---

## 🎯 Practice Progress

### 5. Get Practice Progress
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/practice_progress?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Vocabulary, listening, pronunciation practice — current_index, score, difficulty

---

## 📝 Assessment Results

### 6. Get Assessment Results
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/assessment_results?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Quiz scores, total questions, answers, timestamps

---

## 🎤 Pronunciation Results

### 7. Get Pronunciation Results
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/pronunciation_results?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Pronunciation test scores and attempts

---

## 💾 Quiz Progress (Save/Resume)

### 8. Get Quiz Progress
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/quiz_progress?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** In-progress quiz state — quiz_id, current_index, answers, score

---

## 🔔 Notifications

### 9. Get Notifications
```
GET  https://qmoflreegstjebzzdoft.supabase.co/rest/v1/notifications?select=*&user_id=eq.ea3cc308-97d6-43de-ac6e-25c1af8e6b81
```
**Returns:** Notifications with title, message, is_read, type

---

## 🖥️ Express Backend Endpoints

> No auth headers needed — just paste the URL and Send.

### 10. Health Check
```
GET  http://localhost:3001/api/health
```

### 11. Get All Languages (Lessons)
```
GET  http://localhost:3001/api/lessons/languages
```

### 12. Get Lesson Words
```
GET  http://localhost:3001/api/lessons/english/words
GET  http://localhost:3001/api/lessons/english/numbers
GET  http://localhost:3001/api/lessons/english/sentences
GET  http://localhost:3001/api/lessons/hindi/words
GET  http://localhost:3001/api/lessons/tamil/words
GET  http://localhost:3001/api/lessons/telugu/words
```

### 13. Get Practice Languages
```
GET  http://localhost:3001/api/practice/languages
```

### 14. Get Pronunciation Practice Words
```
GET  http://localhost:3001/api/practice/english/pronunciation
GET  http://localhost:3001/api/practice/hindi/pronunciation
GET  http://localhost:3001/api/practice/tamil/pronunciation
GET  http://localhost:3001/api/practice/telugu/pronunciation
```

### 15. Get Listening Practice
```
GET  http://localhost:3001/api/practice/english/listening
GET  http://localhost:3001/api/practice/hindi/listening
GET  http://localhost:3001/api/practice/tamil/listening
GET  http://localhost:3001/api/practice/telugu/listening
```

### 16. Get Vocabulary Practice
```
GET  http://localhost:3001/api/practice/english/vocabulary
GET  http://localhost:3001/api/practice/hindi/vocabulary
GET  http://localhost:3001/api/practice/tamil/vocabulary
GET  http://localhost:3001/api/practice/telugu/vocabulary
```

### 17. Check Pronunciation (POST)
```
POST  http://localhost:3001/api/practice/check-pronunciation
```
**Body** (raw → JSON):
```json
{
  "expected": "hello",
  "spoken": "helo"
}
```
**Returns:** `{ isMatch, score, expected, spoken }`

### 18. Check Pronunciation — Lessons (POST)
```
POST  http://localhost:3001/api/lessons/check-pronunciation
```
**Body** (raw → JSON):
```json
{
  "expected": "hello",
  "spoken": "helo",
  "languageId": "english"
}
```
**Returns:** `{ isMatch, expected, spoken, confidence }`

### 19. Text-to-Speech (TTS Proxy)
```
GET  http://localhost:3001/api/practice/tts?text=hello&lang=en
GET  http://localhost:3001/api/practice/tts?text=namaste&lang=hi
GET  http://localhost:3001/api/practice/tts?text=vanakkam&lang=ta
GET  http://localhost:3001/api/practice/tts?text=namaskaram&lang=te
```
**Returns:** Audio file (audio/mpeg) — Save response to file to play it.
