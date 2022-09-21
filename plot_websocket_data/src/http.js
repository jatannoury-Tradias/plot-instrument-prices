import axios from 'axios';
const hostname = "127.0.0.1";// Enter your personal hostname fetched from ipconfig
const portname = 8000;
const BACKEND_URL = `http://${hostname}:${portname}/`;
axios.defaults.baseURL = BACKEND_URL;

let data;
export async function getPrices() {
  const response = await axios({
    method: "get",
    url: "getData",
    params:{},
  }).then(
    (response) => {
      data = response.data;
    },

    (error) => {
      data = error;
      throw error;
    }
  );

  return data;
}