import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Unable to connect to Prompt Police.";

    return Promise.reject(new Error(message));
  },
);

export async function predictPrompt(prompt) {
  const { data } = await api.post("/predict", { prompt });
  return data;
}

export default api;
