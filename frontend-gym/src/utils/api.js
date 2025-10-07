import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia el puerto si tu backend usa otro
});

export default api;