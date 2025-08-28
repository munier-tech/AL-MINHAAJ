import axios from "axios";

const isDev = import.meta.env.MODE === "development";
const prodBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: isDev ? "http://localhost:4000/api" : (prodBase ? `${prodBase}` : "/api"),
  withCredentials: true,
});

export default axiosInstance;