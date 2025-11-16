import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const { user, token, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(
    searchParams.get('subject') || 'all'
  );
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState<boolean>(true);
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

    if (user && userAnswers[questionId]) {
      const startTime = questionStartTimes.current[questionId] || Date.now();
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      try {
        await fetch(`${API_URL}/api/track-answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({
            user_id: user.id,
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="questions-page"><div className="loading">Loading...</div></div>;
  }

  if (!user) {
    return null; // Will redirect
  }

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

      {/* Progress Dashboard */}
      <ProgressDashboard userId={user.id} API_URL={API_URL} />
      
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

