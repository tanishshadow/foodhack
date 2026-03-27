# 🍽️ FoodHack

AI-powered pantry management and meal planning system.

---

## Features

* Invoice scanning → auto pantry update
* AI meal generation based on pantry
* Nutrition tracking
* Health profile personalization

---

## Architecture

* Frontend: Next.js
* Backend: FastAPI
* AI: Local models (Ollama) / fallback mode

---

## 🛠️ Local Setup

```bash
git clone <repo>
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

##  Running with AI (Optional)

Install Ollama:

https://ollama.com

```bash
ollama pull llama3
ollama pull llava
ollama serve
```

---



## Future Improvements

* Better OCR accuracy
* More accurate nutrition engine
* Cloud-hosted AI inference

---
