// src/pages/QuestionsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../hooks/useSession";
import ProgressDashboard from "../components/ProgressDashboard";
import "./QuestionsPage.css";

interface Question {
  id: number;
  subject: string;
  question_text: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { sessionId, startSession, submitAnswer, finishSession, answers, results } = useSession();
  const [searchParams] = useSearchParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get("subject") || "all"
  );
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const questionStartTimes = useRef<{ [key: number]: number }>({});

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  // Start session automatically on mount
  useEffect(() => {
    if (user && !sessionId) {
      setSessionLoading(true);
      startSession()
        .catch(console.error)
        .finally(() => setSessionLoading(false));
    }
  }, [user, sessionId, startSession]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Fetch questions from backend
  const fetchQuestions = (subject?: string) => {
    setLoadingQuestions(true);
    const url = subject && subject !== "all"
      ? `${API_URL}/questions?subject=${subject}&limit=20`
      : `${API_URL}/questions?limit=20`;

    fetch(url)
      .then(res => res.json())
      .then(data => setQuestions(data.questions))
      .catch(console.error)
      .finally(() => setLoadingQuestions(false));
  };

  useEffect(() => {
    fetchQuestions(selectedSubject !== "all" ? selectedSubject : undefined);
  }, [selectedSubject]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setUserAnswers({});
    setShowResults({});
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (!questionStartTimes.current[questionId]) {
      questionStartTimes.current[questionId] = Date.now();
    }
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleCheckAnswer = async (q: Question) => {
    const answer = userAnswers[q.id];
    if (!answer || !sessionId) return;

    const timeSpent = Math.floor(
      (Date.now() - (questionStartTimes.current[q.id] || Date.now())) / 1000
    );

    try {
      await submitAnswer(q.id, answer, timeSpent);
      setShowResults(prev => ({ ...prev, [q.id]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishSession = async () => {
    if (!sessionId) return;
    try {
      await finishSession();
      navigate("/summary");
    } catch (err) {
      console.error(err);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      math: "#61dafb",
      english: "#f39c12",
      reading: "#9b59b6",
      science: "#2ecc71",
    };
    return colors[subject] || "#61dafb";
  };

  if (authLoading || sessionLoading) {
    return <div className="questions-page">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1>ACT Practice Questions</h1>
        <div className="header-actions">
          <button onClick={handleFinishSession} disabled={!sessionId}>
            Finish Session
          </button>
        </div>
      </div>

      <ProgressDashboard userId={user.id} API_URL={API_URL} />

      <div className="subject-filter">
        <button
          onClick={() => handleSubjectChange("all")}
          className={selectedSubject === "all" ? "active" : ""}
        >
          All Subjects
        </button>
        {["math", "english", "reading", "science"].map(subj => (
          <button
            key={subj}
            onClick={() => handleSubjectChange(subj)}
            style={{
              backgroundColor: selectedSubject === subj ? getSubjectColor(subj) : "#444",
            }}
          >
            {subj.charAt(0).toUpperCase() + subj.slice(1)}
          </button>
        ))}
      </div>

      <div className="questions-container">
        {loadingQuestions ? (
          <p>Loading questions...</p>
        ) : questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          questions.map((q, idx) => {
            const userAnswer = userAnswers[q.id];
            const showResult = showResults[q.id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div
                key={q.id}
                className="question-card"
                style={{ borderColor: getSubjectColor(q.subject) }}
              >
                <div className="question-header">
                  <span
                    className="subject-badge"
                    style={{ backgroundColor: getSubjectColor(q.subject) }}
                  >
                    {q.subject}
                  </span>
                  <span className="difficulty-badge">{q.difficulty}</span>
                </div>
                <p className="question-text">
                  <strong>Q{idx + 1}:</strong> {q.question_text}
                </p>
                <div className="choices-container">
                  {q.choices.map((choice, idx) => (
                    <div
                      key={idx}
                      onClick={() => !showResult && handleAnswerSelect(q.id, choice)}
                      className={`choice ${
                        showResult && choice === q.correct_answer
                          ? "correct"
                          : showResult && choice === userAnswer && !isCorrect
                          ? "incorrect"
                          : userAnswer === choice
                          ? "selected"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          showResult && choice === q.correct_answer
                            ? "#2ecc71"
                            : showResult && choice === userAnswer && !isCorrect
                            ? "#e74c3c"
                            : userAnswer === choice
                            ? "#3498db"
                            : "#1a1d23",
                        cursor: showResult ? "default" : "pointer",
                      }}
                    >
                      {choice}
                    </div>
                  ))}
                </div>
                {!showResult && userAnswer && (
                  <button onClick={() => handleCheckAnswer(q)} className="check-button">
                    Check Answer
                  </button>
                )}
                {showResult && (
                  <div className={`result ${isCorrect ? "correct-result" : "incorrect-result"}`}>
                    <p className="result-message">{isCorrect ? "✓ Correct!" : "✗ Incorrect"}</p>
                    <p className="correct-answer">
                      <strong>Correct Answer:</strong> {q.correct_answer}
                    </p>
                    <p className="explanation">
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;
