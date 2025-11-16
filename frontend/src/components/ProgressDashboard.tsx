// src/components/ProgressDashboard.tsx
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

interface AnalyticsByCategory {
  total: number;
  correct: number;
  accuracy: number;
}

interface WeakArea {
  subject: string;
  accuracy: number;
  total_attempted: number;
  priority: string;
}

interface Analytics {
  total_answered: number;
  total_correct: number;
  overall_accuracy: number;
  by_subject: { [subject: string]: AnalyticsByCategory };
  by_difficulty: { [difficulty: string]: AnalyticsByCategory };
  weak_areas: WeakArea[];
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
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "feedback">("overview");

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
      const { data } = await axiosClient.get<Analytics>(`/analytics/${userId}`);
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIFeedback = async () => {
    if (!userId) return;
    try {
      const { data } = await axiosClient.get<AIFeedback>(`/ai-feedback/${userId}`);
      setAiFeedback(data);
    } catch (err) {
      console.error("Error fetching AI feedback:", err);
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

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return "#2ecc71";
    if (accuracy >= 70) return "#f39c12";
    if (accuracy >= 60) return "#e67e22";
    return "#e74c3c";
  };

  if (!userId) return <div>Please set a user ID to view progress</div>;
  if (loading) return <div>Loading analytics...</div>;
  if (!analytics || analytics.total_answered === 0)
    return <div>Answer some questions to see your progress!</div>;

  return (
    <div style={{ padding: 20, background: "#282c34", borderRadius: 10, margin: "20px 0" }}>
      <h2>📊 Progress Dashboard</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(["overview", "subjects", "feedback"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              background: activeTab === tab ? "#61dafb" : "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #61dafb" : "none",
            }}
          >
            {tab === "overview"
              ? "Overview"
              : tab === "subjects"
              ? "By Subject"
              : "AI Feedback"}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
            <div style={{ padding: 15, background: "#1a1d23", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#888" }}>Total Answered</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#61dafb" }}>{analytics.total_answered}</div>
            </div>
            <div style={{ padding: 15, background: "#1a1d23", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#888" }}>Correct Answers</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#2ecc71" }}>{analytics.total_correct}</div>
            </div>
            <div style={{ padding: 15, background: "#1a1d23", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#888" }}>Overall Accuracy</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: getAccuracyColor(analytics.overall_accuracy) }}>
                {analytics.overall_accuracy.toFixed(1)}%
              </div>
            </div>
            <div style={{ padding: 15, background: "#1a1d23", borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: "#888" }}>Weak Areas</div>
              <div style={{ fontSize: 24, fontWeight: "bold", color: "#e74c3c" }}>{analytics.weak_areas.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === "subjects" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
          {Object.entries(analytics.by_subject as { [subject: string]: AnalyticsByCategory }).map(
            ([subject, stats]) => (
              <div
                key={subject}
                style={{ padding: 20, background: "#1a1d23", borderRadius: 8, border: `2px solid ${getSubjectColor(subject)}` }}
              >
                <div style={{ fontSize: 18, fontWeight: "bold", color: getSubjectColor(subject) }}>{subject}</div>
                <div style={{ fontSize: 32, fontWeight: "bold", color: getAccuracyColor(stats.accuracy) }}>
                  {stats.accuracy.toFixed(1)}%
                </div>
                <div style={{ fontSize: 14, color: "#888" }}>
                  {stats.correct} / {stats.total} correct
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* AI Feedback Tab */}
      {activeTab === "feedback" && aiFeedback && (
        <div>
          <div style={{ padding: 20, background: "#1a1d23", borderRadius: 8, borderLeft: "4px solid #61dafb" }}>
            <h3>🤖 Personalized Feedback</h3>
            {aiFeedback.ai_generated && <span>AI Generated</span>}
            <div style={{ color: "#ddd", marginTop: 10 }}>{aiFeedback.feedback}</div>
            <ul>
              {aiFeedback.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;
