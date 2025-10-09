import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    // Test API connection
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(data => setApiStatus(data.message))
      .catch(err => setApiStatus('API connection failed'));

    // Fetch sample questions
    fetch('http://localhost:8000/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data.questions))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>ACT Study Website</h1>
        <p>API Status: {apiStatus}</p>
        
        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h2>Sample Questions:</h2>
          {questions.map(q => (
            <div key={q.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#282c34', borderRadius: '8px' }}>
              <p><strong>Q{q.id}:</strong> {q.question}</p>
              <ul>
                {q.choices.map((choice: string, idx: number) => (
                  <li key={idx}>{choice}</li>
                ))}
              </ul>
              <p style={{ color: '#61dafb' }}>Answer: {q.correct_answer}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;