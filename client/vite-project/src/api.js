import axios from "axios";

export const api = axios.create({
  baseURL: "https://chat-app-production-2351.up.railway.app",
});