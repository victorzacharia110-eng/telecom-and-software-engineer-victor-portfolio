// composables/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.apitscl.online/api", 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

export const csrfApi = axios.create({
  baseURL: "https://api.apitscl.online",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

export default api;