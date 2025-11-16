import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // include cookies if backend uses sessions
});

// Optional helper to set Authorization token
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};

export default axiosClient;
