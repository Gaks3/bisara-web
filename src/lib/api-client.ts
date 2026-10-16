import axios from "axios";

const getBaseURL = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // If unauthorized and on protected route, can redirect or trigger event
      console.warn("API 401 Unauthorized:", error.config?.url);
    }
    return Promise.reject(error);
  },
);

export default api;
