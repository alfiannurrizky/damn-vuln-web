import axios from 'axios';

// Ganti URL ini dengan https://api.reoilcollect.my.id/api saat deploy ke server
const BASE_URL = 'http://localhost:3000/api';

// Ganti origin URL ini dengan https://api.reoilcollect.my.id saat deploy ke server
const ORIGIN_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
});

export const getAvatarUrl = (path) => {
  if (!path) return '';
  // Jika path sudah berupa http (misal dari external), return as is
  if (path.startsWith('http')) return path;
  return `${ORIGIN_URL}${path}`;
}

export default api;
