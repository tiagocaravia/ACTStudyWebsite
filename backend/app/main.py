from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ACT Study API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ACT Study API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/questions")
async def get_questions():
    return {
        "questions": [
            {
                "id": 1,
                "subject": "math",
                "question": "What is 2 + 2?",
                "choices": ["2", "3", "4", "5"],
                "correct_answer": "4"
            }
        ]
    }