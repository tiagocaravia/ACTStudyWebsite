import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./QuestionsPage.css";

interface Question {
  id: number;
  subject: string;
  question_text: string;
  choices?: string[];
  correct_answer?: string;
  explanation?: string;
  difficulty?: string;
}

interface Answer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/questions?limit=10`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="questions-page">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="questions-page">
        <div className="questions-header">
          <h1>ACT Practice</h1>
        </div>
        <div className="empty-state">
          <h2>No questions available yet</h2>
          <p>Questions will be added soon.</p>
          <button className="btn-summary" onClick={() => navigate("/summary")}>
            View Summary
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    setAnswers([...answers, newAnswer]);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      // Session finished - save stats to sessionStorage and navigate to summary
      const correctCount = answers.filter((a) => a.isCorrect).length;
      const incorrectCount = answers.filter((a) => !a.isCorrect).length;
      const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
      const avgTime =
        answers.length > 0 ? Math.round(totalTime / answers.length) : 0;
      const accuracy =
        answers.length > 0
          ? Math.round((correctCount / answers.length) * 100)
          : 0;

      const stats = {
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        incorrectAnswers: incorrectCount,
        skipped: 0,
        accuracy,
        averageTimePerQuestion: avgTime,
        totalTime,
      };

      sessionStorage.setItem("sessionStats", JSON.stringify(stats));
      navigate("/summary");
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      navigate("/summary");
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-header">
        <div className="header-left">
          <h1>ACT Practice</h1>
          <p>Welcome, {user?.full_name || user?.email}</p>
        </div>
        <button className="btn-summary" onClick={() => navigate("/summary")}>
          Summary
        </button>
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="question-container">
        <div className="question-meta">
          <span className={`difficulty ${currentQuestion.difficulty}`}>
            {currentQuestion.difficulty?.toUpperCase()}
          </span>
          <span className="subject">{currentQuestion.subject}</span>
        </div>

        <div className="question-text">
          <h2>{currentQuestion.question_text}</h2>
        </div>

        <div className="choices-grid">
          {currentQuestion.choices?.map((choice, idx) => {
            const labels = ["A", "B", "C", "D"];
            const isSelected = selectedAnswer === choice;
            const isCorrect = choice === currentQuestion.correct_answer;

            let choiceClass = "choice-button";
            if (showExplanation) {
              if (isCorrect) choiceClass += " correct";
              if (isSelected && !isCorrect) choiceClass += " incorrect";
            }
            if (isSelected && !showExplanation) choiceClass += " selected";

            return (
              <button
                key={idx}
                className={choiceClass}
                onClick={() => !showExplanation && setSelectedAnswer(choice)}
                disabled={showExplanation}
              >
                <span className="choice-label">{labels[idx]}</span>
                <span className="choice-text">{choice}</span>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="explanation-box">
            <div className={`result-badge ${currentAnswer?.isCorrect ? "correct" : "incorrect"}`}>
              {currentAnswer?.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </div>
            <div className="explanation-content">
              <h3>Explanation</h3>
              <p>{currentQuestion.explanation || "No explanation available."}</p>
              <p className="time-info">Time spent: {currentAnswer?.timeSpent}s</p>
            </div>
          </div>
        )}

        <div className="button-group">
          {!showExplanation && (
            <>
              <button className="btn-secondary" onClick={handleSkip}>
                Skip
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </button>
            </>
          )}
          {showExplanation && (
            <button className="btn-primary" onClick={handleNext}>
              {currentQuestionIndex === questions.length - 1 ? "Finish" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
