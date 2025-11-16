import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ProgressDashboard from './components/ProgressDashboard';

interface Question {
  id: number;
  subject: string;
  question_text: string;
  choices: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number | null>(() => {
    // Try to get userId from localStorage
    const saved = localStorage.getItem('act_user_id');
    return saved ? parseInt(saved, 10) : null;
  });
  const [showUserIdInput, setShowUserIdInput] = useState<boolean>(!userId);
  const questionStartTimes = useRef<{[key: number]: number}>({});

  const API_URL = 'https://actstudywebsite.onrender.com';

  useEffect(() => {
    // Test API connection
    fetch(`${API_URL}/`)
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => setApiStatus('API connection failed'));

    // Fetch questions
    fetchQuestions();
  }, []);

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
    
    // Track when user starts answering (if not already tracked)
    if (!questionStartTimes.current[questionId]) {
      questionStartTimes.current[questionId] = Date.now();
    }
  };

  const checkAnswer = async (questionId: number) => {
    setShowResults({
      ...showResults,
      [questionId]: true
    });

    // Track the answer if userId is set
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
    <div className="App">
      <header className="App-header">
        <h1>ACT Study Website</h1>
        <p style={{ fontSize: '14px', color: '#888' }}>API Status: {apiStatus}</p>
        
        {/* User ID Input */}
        {showUserIdInput ? (
          <div style={{ 
            margin: '20px 0', 
            padding: '20px', 
            background: '#282c34', 
            borderRadius: '10px',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '15px' }}>Set Your User ID</h3>
            <p style={{ fontSize: '14px', color: '#888', marginBottom: '15px' }}>
              Enter a user ID to track your progress and get personalized AI feedback
            </p>
            <form onSubmit={handleUserIdSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                placeholder="User ID (e.g., 1)"
                min="1"
                style={{
                  padding: '10px',
                  borderRadius: '5px',
                  border: 'none',
                  flex: 1,
                  fontSize: '16px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#61dafb',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#000'
                }}
              >
                Set ID
              </button>
            </form>
          </div>
        ) : userId && (
          <div style={{ 
            margin: '20px 0', 
            padding: '10px 20px', 
            background: '#282c34', 
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '400px'
          }}>
            <span>User ID: <strong>{userId}</strong></span>
            <button
              onClick={() => {
                setShowUserIdInput(true);
                setUserId(null);
                localStorage.removeItem('act_user_id');
              }}
              style={{
                padding: '5px 15px',
                backgroundColor: '#444',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '12px'
              }}
            >
              Change
            </button>
          </div>
        )}

        {/* Progress Dashboard */}
        {userId && <ProgressDashboard userId={userId} API_URL={API_URL} />}
        
        {/* Subject Filter */}
        <div style={{ margin: '20px 0' }}>
          <button onClick={() => handleSubjectChange('all')} 
                  style={{ 
                    margin: '0 5px', 
                    padding: '10px 20px',
                    backgroundColor: selectedSubject === 'all' ? '#61dafb' : '#444',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    color: 'white'
                  }}>
            All Subjects
          </button>
          {['math', 'english', 'reading', 'science'].map(subject => (
            <button key={subject}
                    onClick={() => handleSubjectChange(subject)}
                    style={{ 
                      margin: '0 5px', 
                      padding: '10px 20px',
                      backgroundColor: selectedSubject === subject ? getSubjectColor(subject) : '#444',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      color: 'white',
                      textTransform: 'capitalize'
                    }}>
              {subject}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div style={{ width: '100%', maxWidth: '800px', textAlign: 'left' }}>
          {loading ? (
            <p>Loading questions...</p>
          ) : questions.length === 0 ? (
            <p>No questions found.</p>
          ) : (
            questions.map((q, index) => {
              const userAnswer = userAnswers[q.id];
              const showResult = showResults[q.id];
              const isCorrect = userAnswer === q.correct_answer;

              return (
                <div key={q.id} style={{ 
                  marginBottom: '30px', 
                  padding: '20px', 
                  background: '#282c34', 
                  borderRadius: '10px',
                  border: `2px solid ${getSubjectColor(q.subject)}`
                }}>
                  {/* Question Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ 
                      backgroundColor: getSubjectColor(q.subject), 
                      padding: '5px 10px', 
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'capitalize'
                    }}>
                      {q.subject}
                    </span>
                    <span style={{ 
                      backgroundColor: '#444', 
                      padding: '5px 10px', 
                      borderRadius: '5px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {q.difficulty}
                    </span>
                  </div>

                  {/* Question Text */}
                  <p style={{ fontSize: '18px', marginBottom: '15px' }}>
                    <strong>Q{index + 1}:</strong> {q.question_text}
                  </p>

                  {/* Answer Choices */}
                  <div style={{ marginBottom: '15px' }}>
                    {q.choices.map((choice: string, idx: number) => (
                      <div key={idx} 
                           onClick={() => !showResult && handleAnswerSelect(q.id, choice)}
                           style={{ 
                             padding: '10px',
                             margin: '5px 0',
                             backgroundColor: 
                               showResult && choice === q.correct_answer ? '#2ecc71' :
                               showResult && choice === userAnswer && !isCorrect ? '#e74c3c' :
                               userAnswer === choice ? '#3498db' : '#1a1d23',
                             borderRadius: '5px',
                             cursor: showResult ? 'default' : 'pointer',
                             border: userAnswer === choice ? '2px solid white' : '2px solid transparent',
                             transition: 'all 0.2s'
                           }}>
                        {choice}
                      </div>
                    ))}
                  </div>

                  {/* Check Answer Button */}
                  {!showResult && userAnswer && (
                    <button onClick={() => checkAnswer(q.id)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#61dafb',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              color: '#000'
                            }}>
                      Check Answer
                    </button>
                  )}

                  {/* Result and Explanation */}
                  {showResult && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      backgroundColor: isCorrect ? '#27ae6030' : '#e74c3c30',
                      borderRadius: '5px'
                    }}>
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold',
                        color: isCorrect ? '#2ecc71' : '#e74c3c'
                      }}>
                        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                      </p>
                      <p style={{ marginTop: '10px' }}>
                        <strong>Correct Answer:</strong> {q.correct_answer}
                      </p>
                      <p style={{ marginTop: '10px', color: '#bbb' }}>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </header>
    </div>
  );
}

export default App;