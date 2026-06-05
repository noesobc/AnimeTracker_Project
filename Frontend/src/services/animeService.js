import axios from "axios";

const API_URL = "/api/animes";

export const getAllAnimes = () => {
  return axios.get(API_URL);
};

export const createAnime = (anime) => {
  return axios.post(API_URL, anime);
};

export const updateAnime = (id, anime) => {
  return axios.put(`${API_URL}/${id}`, anime);
};

export const deleteAnime = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};