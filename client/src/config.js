const isDev = import.meta.env.MODE === "development";

// export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const API_URL = isDev ? "http://localhost:3001" : "";
