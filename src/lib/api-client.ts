import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:4000",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
