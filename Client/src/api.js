import axios from "axios";

// Local mein VITE_API_URL khali rehta hai, to Vite proxy use hota hai.
// Vercel pe ye Render ka URL hoga.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_KEY || "",
});

export default api;