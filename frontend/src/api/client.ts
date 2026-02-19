import { API_BASE_URL } from "@/constant/apiEndpoints";
import axios from "axios";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
