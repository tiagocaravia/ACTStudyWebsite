import { useState } from "react";
import { axiosClient } from "../api/axiosClient";

export const useSession = () => {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [results, setResults] = useState<any | null>(null);

  const startSession = async () => {
    const res = await axiosClient.post("/api/sessions/start", { session_type: "practice" });
    setSessionId(res.data.session_id);
    return res.data;
  };

  const submitAnswer = async (questionId: number, userAnswer: string, timeSpent: number) => {
    if (!sessionId) throw new Error("Session not started yet");
    const res = await axiosClient.post("/api/sessions/submit", {
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      time_spent_seconds: timeSpent,
    });
    setAnswers(prev => [...prev, res.data]);
    return res.data;
  };

  const finishSession = async () => {
    if (!sessionId) throw new Error("Session not started yet");
    const res = await axiosClient.post("/api/sessions/finish", { session_id: sessionId });
    setResults(res.data);
    return res.data;
  };

  return { sessionId, startSession, submitAnswer, finishSession, answers, results };
};
