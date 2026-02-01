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

  // Parse question text to separate passage from actual question
  const parseQuestionContent = (questionText: string) => {
    // Check if this is a passage-based question
    const passageMatch = questionText.match(/^Passage:\s*(.+?)(\n\n|\n[A-Z])/s);
    
    if (passageMatch) {
      const passageEnd = passageMatch.index! + passageMatch[0].length;
      const passage = passageMatch[1].trim();
      const restOfQuestion = questionText.substring(passageEnd).trim();
      return { passage, question: restOfQuestion, hasPassage: true };
    }
    
    return { passage: "", question: questionText, hasPassage: false };
  };

  const { passage, question, hasPassage } = parseQuestionContent(currentQuestion.question_text);

  // Render data table for science questions
  const renderDataTable = (text: string) => {
    // Check if text contains a data table format
    const tableMatch = text.match(/([A-Za-z\s\(\)]+):\s*[\d,\s\-\>]+\s*\n+([A-Za-z\s\(\)]+):\s*[\d,\s\-\>]+/);
    
    if (tableMatch) {
      return (
        <div className="data-table-container">
          <table className="data-table">
            <tbody>
              {text.split('\n').filter(line => line.trim()).map((line, idx) => {
                const [header, ...values] = line.split(':');
                if (!values.length) return null;
                const cells = values[0].split(/[\|,,\->]+/).map(v => v.trim()).filter(v => v);
                return (
                  <tr key={idx}>
                    <th>{header.trim()}</th>
                    {cells.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

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
        {/* Split-pane layout */}
        <div className="question-split-pane">
          
          {/* Left panel - Passage/Data */}
          <div className="question-panel question-panel-left">
            {hasPassage ? (
              <div className="passage-content">
                {renderDataTable(passage) || (
                  <pre>{passage}</pre>
                )}
              </div>
            ) : (
              <div className="passage-content">
                <p style={{ color: '#999', fontStyle: 'italic' }}>
                  This is a direct question. See the question and answer choices on the right.
                </p>
              </div>
            )}
            
            {/* Explanation appears in left panel when shown */}
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
          </div>

          {/* Right panel - Question and Answer Choices */}
          <div className="question-panel question-panel-right">
            <div className="question-meta-split">
              <span className={`difficulty ${currentQuestion.difficulty}`}>
                {currentQuestion.difficulty?.toUpperCase()}
              </span>
              <span className="subject">{currentQuestion.subject}</span>
            </div>

            {hasPassage ? (
              <>
                <p className="question-label">Question</p>
                <div className="question-text-split">
                  <h2>{question}</h2>
                </div>
              </>
            ) : (
              <div className="question-text-split">
                <h2>{question}</h2>
              </div>
            )}

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
      </div>
    </div>
  );
};

export default QuestionsPage;

