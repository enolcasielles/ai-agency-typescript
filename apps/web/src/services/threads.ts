const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getThreads = async () => {
  const response = await fetch(`${API_URL}/threads`, {
    cache: "no-cache",
  });
  if (!response.ok) return null;
  return await response.json();
};

export const getThread = async (threadId: string) => {
  const response = await fetch(`${API_URL}/threads/${threadId}`, {
    cache: "no-cache",
  });
  if (!response.ok) return null;
  return await response.json();
};

export const getMessages = async (threadId: string) => {
  const response = await fetch(`${API_URL}/threads/${threadId}/messages`, {
    cache: "no-cache",
  });
  if (!response.ok) return null;
  return await response.json();
};

export const getSseClient = (threadId: string) => {
  return new EventSource(`${API_URL}/threads/${threadId}/sseClient`);
};

export const sendNewMessage = async (threadId: string, message: string) => {
  await fetch(`${API_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threadId, message }),
  });
};
