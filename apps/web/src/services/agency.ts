const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getAgencyInfo = async () => {
  const response = await fetch(`${API_URL}/info`, {
    cache: "no-cache",
  });
  if (!response.ok) return null;
  return await response.json();
};
