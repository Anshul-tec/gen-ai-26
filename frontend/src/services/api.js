// API Client for FastAPI backend

const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  },

  // Interview
  generateInterview: async (data) => {
    const res = await fetch(`${BASE_URL}/interview/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  evaluateAnswer: async (data) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
    try {
      const res = await fetch(`${BASE_URL}/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      return handleResponse(res);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Evaluation timed out after 30 seconds. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  },

  getFollowUp: async (data) => {
    const res = await fetch(`${BASE_URL}/interview/follow-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getSessionSummary: async (sessionId) => {
    const res = await fetch(`${BASE_URL}/interview/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    });
    return handleResponse(res);
  },

  // Sessions
  getSessions: async () => {
    const res = await fetch(`${BASE_URL}/sessions`);
    return handleResponse(res);
  },

  getSessionDetail: async (sessionId) => {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    return handleResponse(res);
  },

  deleteSession: async (sessionId) => {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${BASE_URL}/analytics`);
    return handleResponse(res);
  },

  // Questions Bank
  getQuestions: async ({ topic = '', difficulty = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (difficulty) params.append('difficulty', difficulty);
    if (search) params.append('search', search);
    const res = await fetch(`${BASE_URL}/questions?${params.toString()}`);
    return handleResponse(res);
  },
};
