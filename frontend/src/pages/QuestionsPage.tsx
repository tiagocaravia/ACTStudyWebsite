import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgressDashboard from '../components/ProgressDashboard';
import './QuestionsPage.css';

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
  const [searchParams] = useSearchParams();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get('subject') || 'all'
  );
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(() => {
    const saved = localStorage.getItem('act_user_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [showUserIdInput, setShowUserIdInput] = useState<boolean>(!userId);
  const questionStartTimes = useRef<{[key: number]: number}>({});

  const API_URL = 'https://actstudywebsite.onrender.com';

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => setApiStatus('API connection failed'));

    // Check for subject in URL params
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setSelectedSubject(subjectParam);
      fetchQuestions(subjectParam);
    } else {
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchQuestions = (subject?: string) => {
    setLoading(true);
    const url = subject && subject !== 'all' 
      ? `${API_URL}/api/questions?subject=${subject}&limit=20`
      : `${API_URL}/api/questions?limit=20`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    fetchQuestions(subject);
    setUserAnswers({});
    setShowResults({});
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
    
    if (!questionStartTimes.current[questionId]) {
      questionStartTimes.current[questionId] = Date.now();
    }
  };

  const checkAnswer = async (questionId: number) => {
    setShowResults({
      ...showResults,
      [questionId]: true
    });

    if (userId && userAnswers[questionId]) {
      const startTime = questionStartTimes.current[questionId] || Date.now();
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      try {
        await fetch(`${API_URL}/api/track-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            question_id: questionId,
            user_answer: userAnswers[questionId],
            time_spent_seconds: timeSpent
          })
        });
      } catch (error) {
        console.error('Error tracking answer:', error);
      }
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: {[key: string]: string} = {
      math: '#61dafb',
      english: '#f39c12',
      reading: '#9b59b6',
      science: '#2ecc71'
    };
    return colors[subject] || '#61dafb';
  };

  const handleUserIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    const id = parseInt(input.value, 10);
    if (!isNaN(id) && id > 0) {
      setUserId(id);
      localStorage.setItem('act_user_id', id.toString());
      setShowUserIdInput(false);
    }
  };

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1>ACT Practice Questions</h1>
        <div className="header-actions">
          <button 
            className="summary-button"
            onClick={() => navigate('/summary')}
          >
            View Summary
          </button>
        </div>
      </div>

      {/* User ID Input */}
      {showUserIdInput ? (
        <div className="user-id-prompt">
          <h3>Set Your User ID</h3>
          <p>Enter a user ID to track your progress and get personalized AI feedback</p>
          <form onSubmit={handleUserIdSubmit} className="user-id-form">
            <input
              type="number"
              placeholder="User ID (e.g., 1)"
              min="1"
              className="user-id-input"
            />
            <button type="submit" className="user-id-submit">
              Set ID
            </button>
          </form>
        </div>
      ) : userId && (
        <div className="user-id-display">
          <span>User ID: <strong>{userId}</strong></span>
          <button
            onClick={() => {
              setShowUserIdInput(true);
              setUserId(null);
              localStorage.removeItem('act_user_id');
            }}
            className="change-user-id"
          >
            Change
          </button>
        </div>
      )}

      {/* Progress Dashboard */}
      {userId && <ProgressDashboard userId={userId} API_URL={API_URL} />}
      
      {/* Subject Filter */}
      <div className="subject-filter">
        <button 
          onClick={() => handleSubjectChange('all')} 
          className={`subject-btn ${selectedSubject === 'all' ? 'active' : ''}`}
        >
          All Subjects
        </button>
        {['math', 'english', 'reading', 'science'].map(subject => (
          <button
            key={subject}
            onClick={() => handleSubjectChange(subject)}
            className={`subject-btn ${selectedSubject === subject ? 'active' : ''}`}
            style={{ 
              backgroundColor: selectedSubject === subject ? getSubjectColor(subject) : '#444'
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
              <div key={q.id} className="question-card" style={{ borderColor: getSubjectColor(q.subject) }}>
                {/* Question Header */}
                <div className="question-header">
                  <span className="subject-badge" style={{ backgroundColor: getSubjectColor(q.subject) }}>
                    {q.subject}
                  </span>
                  <span className="difficulty-badge">
                    {q.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <p className="question-text">
                  <strong>Q{index + 1}:</strong> {q.question_text}
                </p>

                {/* Answer Choices */}
                <div className="choices-container">
                  {q.choices.map((choice: string, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={() => !showResult && handleAnswerSelect(q.id, choice)}
                      className={`choice ${showResult && choice === q.correct_answer ? 'correct' : ''} ${showResult && choice === userAnswer && !isCorrect ? 'incorrect' : ''} ${userAnswer === choice ? 'selected' : ''}`}
                      style={{
                        backgroundColor: 
                          showResult && choice === q.correct_answer ? '#2ecc71' :
                          showResult && choice === userAnswer && !isCorrect ? '#e74c3c' :
                          userAnswer === choice ? '#3498db' : '#1a1d23',
                        cursor: showResult ? 'default' : 'pointer'
                      }}
                    >
                      {choice}
                    </div>
                  ))}
                </div>

                {/* Check Answer Button */}
                {!showResult && userAnswer && (
                  <button onClick={() => checkAnswer(q.id)} className="check-button">
                    Check Answer
                  </button>
                )}

                {/* Result and Explanation */}
                {showResult && (
                  <div className={`result ${isCorrect ? 'correct-result' : 'incorrect-result'}`}>
                    <p className="result-message">
                      {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
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

