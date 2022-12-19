import axios from "axios";

const baseUrl = "http://localhost:4000";

const baseRequest = {
  request: (method, path, params, responseType) => {
    return axios({ method, url: baseUrl + path, data: params, responseType })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        return error;
      });
  },
  post: (path, params) => {
    return baseRequest.request("POST", path, params);
  },
  get: (path, params) => {
    return baseRequest.request("GET", path, params);
  },
  addHeader: (token) => {
    const sessiontoken = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] =
      "Basic " + token || sessiontoken;
  },
  addTokenToHeader: (token) => {
    const sessiontoken = localStorage.getItem("token");
    axios.defaults.headers.common["Authorization"] = token || sessiontoken;
  },
};

baseRequest.addHeader();
baseRequest.addTokenToHeader();
export default baseRequest;
