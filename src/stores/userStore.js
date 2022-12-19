import { observable, action } from "mobx";
import baseRequest from "../core/baseRequest";
import { b64EncodeUnicode } from "../utils/helpers";

export class UserStore {
  @observable isLoggedIn = false;
  @observable username = "";
  @observable email = "";
  @observable phone = "";

  @action changeStatus(isLoggedIn) {
    this.isLoggedIn = isLoggedIn;
  }

  @action async login(username, password) {
    console.log(username, password);
    const token = b64EncodeUnicode(username + "=" + password);
    await baseRequest.addHeader(token);
    const response = await baseRequest.post("/login", null);

    if (response.data.resultData) {
      localStorage.setItem("token", response.data.token);
      baseRequest.addTokenToHeader(response.data.token);
      this.username = response.data.resultData.username;
      this.email = response.data.resultData.email;
      this.phone = response.data.resultData.phone;
      this.isLoggedIn = true;
      localStorage.setItem("user", this.username);

      return response.data.resultData.username;
    }

    return null;
  }

  @action control() {
    const token = localStorage.getItem("token");
    if (token) {
      baseRequest.addTokenToHeader(token);
      return true;
    } else {
      return false;
    }
  }
}

