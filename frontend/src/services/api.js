import api from "../../api/axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/guesthouse-api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;