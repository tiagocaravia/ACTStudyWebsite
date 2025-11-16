import React, { useState, useEffect } from 'react';

interface Analytics {
  user_id: number;
  total_answered: number;
  total_correct: number;
  overall_accuracy: number;
  by_subject: {
    [key: string]: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
  by_difficulty: {
    [key: string]: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
  weak_areas: Array<{
    subject: string;
    accuracy: number;
    total_attempted: number;
    priority: string;
  }>;
}

interface AIFeedback {
  feedback: string;
  recommendations: string[];
  analytics_summary: {
    overall_accuracy: number;
    total_answered: number;
    weak_areas_count: number;
  };
  ai_generated: boolean;
}

interface ProgressDashboardProps {
  userId: number | null;
  API_URL: string;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId, API_URL }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'feedback'>('overview');

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
      fetchAIFeedback();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchAnalytics = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/analytics/${userId}`);
      const data = await response.json();
      setAnalytics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const fetchAIFeedback = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/ai-feedback/${userId}`);
      const data = await response.json();
      setAiFeedback(data);
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return '#2ecc71';
    if (accuracy >= 70) return '#f39c12';
    if (accuracy >= 60) return '#e67e22';
    return '#e74c3c';
  };

  if (!userId) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#282c34', 
        borderRadius: '10px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <p>Please set a user ID to view your progress</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#282c34', 
        borderRadius: '10px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <p>Loading your progress...</p>
      </div>
    );
  }

  if (!analytics || analytics.total_answered === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#282c34', 
        borderRadius: '10px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <h2>📊 Progress Dashboard</h2>
        <p>Start answering questions to see your progress and get personalized feedback!</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#282c34', 
      borderRadius: '10px',
      margin: '20px 0'
    }}>
      <h2 style={{ marginBottom: '20px' }}>📊 Progress Dashboard</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #444' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'overview' ? '#61dafb' : 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '2px solid #61dafb' : 'none',
            marginBottom: '-2px'
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'subjects' ? '#61dafb' : 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderBottom: activeTab === 'subjects' ? '2px solid #61dafb' : 'none',
            marginBottom: '-2px'
          }}
        >
          By Subject
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'feedback' ? '#61dafb' : 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            borderBottom: activeTab === 'feedback' ? '2px solid #61dafb' : 'none',
            marginBottom: '-2px'
          }}
        >
          AI Feedback
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', background: '#1a1d23', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Total Answered</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#61dafb' }}>
                {analytics.total_answered}
              </div>
            </div>
            <div style={{ padding: '15px', background: '#1a1d23', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Correct Answers</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2ecc71' }}>
                {analytics.total_correct}
              </div>
            </div>
            <div style={{ padding: '15px', background: '#1a1d23', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Overall Accuracy</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: getAccuracyColor(analytics.overall_accuracy) }}>
                {analytics.overall_accuracy.toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: '15px', background: '#1a1d23', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '5px' }}>Weak Areas</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {analytics.weak_areas.length}
              </div>
            </div>
          </div>

          {/* Weak Areas */}
          {analytics.weak_areas.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>⚠️ Areas Needing Improvement</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analytics.weak_areas.map((area, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '15px',
                      background: '#1a1d23',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${getSubjectColor(area.subject)}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {area.subject}
                        </div>
                        <div style={{ fontSize: '14px', color: '#888', marginTop: '5px' }}>
                          {area.total_attempted} questions attempted
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: getAccuracyColor(area.accuracy) }}>
                          {area.accuracy.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                          {area.priority} priority
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {Object.entries(analytics.by_subject).map(([subject, stats]) => (
              <div
                key={subject}
                style={{
                  padding: '20px',
                  background: '#1a1d23',
                  borderRadius: '8px',
                  border: `2px solid ${getSubjectColor(subject)}`
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '10px', color: getSubjectColor(subject) }}>
                  {subject}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: getAccuracyColor(stats.accuracy), marginBottom: '5px' }}>
                  {stats.accuracy.toFixed(1)}%
                </div>
                <div style={{ fontSize: '14px', color: '#888' }}>
                  {stats.correct} / {stats.total} correct
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Feedback Tab */}
      {activeTab === 'feedback' && aiFeedback && (
        <div>
          <div style={{ 
            padding: '20px', 
            background: '#1a1d23', 
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #61dafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>🤖 Personalized Feedback</h3>
              {aiFeedback.ai_generated && (
                <span style={{ fontSize: '12px', color: '#61dafb', background: '#61dafb20', padding: '5px 10px', borderRadius: '5px' }}>
                  AI Generated
                </span>
              )}
            </div>
            <div style={{ 
              whiteSpace: 'pre-line', 
              lineHeight: '1.6',
              color: '#ddd'
            }}>
              {aiFeedback.feedback}
            </div>
          </div>

          <div style={{ 
            padding: '20px', 
            background: '#1a1d23', 
            borderRadius: '8px'
          }}>
            <h3 style={{ marginBottom: '15px' }}>💡 Recommendations</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {aiFeedback.recommendations.map((rec, idx) => (
                <li key={idx} style={{ 
                  padding: '10px 0', 
                  borderBottom: idx < aiFeedback.recommendations.length - 1 ? '1px solid #333' : 'none'
                }}>
                  <span style={{ marginRight: '10px' }}>✓</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;

