// src/pages/QuestionsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProgressDashboard from "../components/ProgressDashboard";
import { useSession } from "../hooks/useSession";
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
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get("subject") || "all"
  );
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const questionStartTimes = useRef<{ [key: number]: number }>({});

  const { sessionId, startSession, submitAnswer, finishSession, results } = useSession();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  // ---------------------------
  // Fetch questions from API
  // ---------------------------
  const fetchQuestions = async (subject?: string) => {
    setLoading(true);
    try {
      const query = subject && subject !== "all" ? `?subject=${subject}&limit=20` : "?limit=20";
      const res = await fetch(`${API_URL}/questions${query}`);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Handle subject filter
  // ---------------------------
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    fetchQuestions(subject);
    setUserAnswers({});
    setShowResults({});
  };

  // ---------------------------
  // Handle answer selection
  // ---------------------------
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers({ ...userAnswers, [questionId]: answer });
    if (!questionStartTimes.current[questionId]) {
      questionStartTimes.current[questionId] = Date.now();
    }
  };

  // ---------------------------
  // Check answer (submit to session)
  // ---------------------------
  const handleCheckAnswer = async (questionId: number) => {
    setShowResults({ ...showResults, [questionId]: true });
    const userAnswer = userAnswers[questionId];
    if (!userAnswer) return;

    // Start session if not already started
    if (!sessionId) {
      try {
        await startSession();
      } catch (err) {
        console.error("Failed to start session:", err);
        return;
      }
    }

    const timeSpent = Math.floor(
      (Date.now() - (questionStartTimes.current[questionId] || Date.now())) / 1000
    );

    try {
      await submitAnswer(questionId, userAnswer, timeSpent);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  // ---------------------------
  // Finish session
  // ---------------------------
  const handleFinishSession = async () => {
    if (!sessionId) return;
    try {
      await finishSession();
      alert("Session finished! Check your dashboard for results.");
    } catch (err) {
      console.error("Error finishing session:", err);
    }
  };

  // ---------------------------
  // Start session & fetch questions on mount
  // ---------------------------
  useEffect(() => {
    const initialize = async () => {
      if (!sessionId) {
        try {
          await startSession();
        } catch (error) {
          console.error("Error starting session:", error);
        }
      }
      const subjectParam = searchParams.get("subject");
      fetchQuestions(subjectParam || undefined);
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ---------------------------
  // Redirect to login if not authenticated
  // ---------------------------
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  // ---------------------------
  // Get color by subject
  // ---------------------------
  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      math: "#61dafb",
      english: "#f39c12",
      reading: "#9b59b6",
      science: "#2ecc71",
    };
    return colors[subject] || "#61dafb";
  };

  if (authLoading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="loading">Redirecting to login...</div>;

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1>ACT Practice Questions</h1>
        <div>
          <button className="summary-button" onClick={() => navigate("/summary")}>
            View Summary
          </button>
          <button className="finish-session-btn" onClick={handleFinishSession}>
            Finish Session
          </button>
        </div>
      </div>

      {/* Progress Dashboard */}
      <ProgressDashboard userId={user.id} API_URL={API_URL} />

      {/* Subject Filter */}
      <div className="subject-filter">
        <button
          onClick={() => handleSubjectChange("all")}
          className={`subject-btn ${selectedSubject === "all" ? "active" : ""}`}
        >
          All Subjects
        </button>
        {["math", "english", "reading", "science"].map((subject) => (
          <button
            key={subject}
            onClick={() => handleSubjectChange(subject)}
            className={`subject-btn ${selectedSubject === subject ? "active" : ""}`}
            style={{
              backgroundColor: selectedSubject === subject ? getSubjectColor(subject) : "#444",
            }}
          >
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="questions-container">
        {loading ? (
          <p className="loading">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="no-questions">No questions found.</p>
        ) : (
          questions.map((q, index) => {
            const userAnswer = userAnswers[q.id];
            const showResult = showResults[q.id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div
                key={q.id}
                className="question-card"
                style={{ borderColor: getSubjectColor(q.subject) }}
              >
                {/* Question Header */}
                <div className="question-header">
                  <span
                    className="subject-badge"
                    style={{ backgroundColor: getSubjectColor(q.subject) }}
                  >
                    {q.subject}
                  </span>
                  <span className="difficulty-badge">{q.difficulty}</span>
                </div>

                {/* Question Text */}
                <p className="question-text">
                  <strong>Q{index + 1}:</strong> {q.question_text}
                </p>

                {/* Answer Choices */}
                <div className="choices-container">
                  {q.choices.map((choice, idx) => (
                    <div
                      key={idx}
                      onClick={() => !showResult && handleAnswerSelect(q.id, choice)}
                      className={`choice ${
                        showResult && choice === q.correct_answer ? "correct" : ""
                      } ${
                        showResult && choice === userAnswer && !isCorrect ? "incorrect" : ""
                      } ${userAnswer === choice ? "selected" : ""}`}
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

                {/* Check Answer Button */}
                {!showResult && userAnswer && (
                  <button onClick={() => handleCheckAnswer(q.id)} className="check-button">
                    Check Answer
                  </button>
                )}

                {/* Result and Explanation */}
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
