import { message } from "antd";
import axios from "axios";

const baseUrl = "http://10.12.9.63:4080";
//baseUrl = "http://localhost:4000"

const baseRequest = {
  request: (method, path, params, responseType) => {
    if (!window.navigator.onLine) {
      message.error("No internet!");
    } else {
      return axios({ method, url: baseUrl + path, data: params, responseType })
        .then((result) => {
          return result;
        })
        .catch((error) => {
          return error;
        });
    }
  },
  multiPartPost: (path, form) => {
    return axios.post(baseUrl + path, form, {
      headers: {
        "content-type": "multipart/form-data;",
      },
    });
  },
  post: (path, params) => {
    return baseRequest.request("POST", path, params);
  },
  get: (path, params) => {
    return baseRequest.request("GET", path, params);
  },
  addHeader: (data) => {
    console.log("addHeader", data);
    axios.defaults.headers.common["Authorization"] = "Header " + data;
  },
  addToken: (token) => {
    const sessiontoken = localStorage.getItem("token");
    console.log("AddToken", sessiontoken, token);
    axios.defaults.headers.common["Authorization"] = token || sessiontoken;
  },
};
console.log("baseRequest");
baseRequest.addToken();
export default baseRequest;
