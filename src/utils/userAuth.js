import baseRequest from "../core/baseRequest";
import { b64EncodeUnicode } from "./helpers";

const userAuth = {
  login: async (email, password) => {
    const encoded = b64EncodeUnicode(email + "=" + password);
    await baseRequest.addHeader(encoded);
    const response = await baseRequest.post("/login", null);
    if (response.data.result === "success") {
      localStorage.setItem("token", response.data.token);
      baseRequest.addToken(response.data.token);
      localStorage.setItem("name", response.data.resultData.name);
      return response.data;
    } else {
      return { result: response.data.result };
    }
  },

  control: (res) => {
    const token = localStorage.getItem("token");
    if (token) {
      baseRequest.addToken(token);
      if (res) {
        if (res.data.status === "success") {
          return true;
        } else {
          localStorage.removeItem("token");
          return false;
        }
      } else {
        return true;
      }
    } else {
      return false;
    }
  },
};

export default userAuth;
