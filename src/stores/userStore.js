import { observable, action } from "mobx";
import baseRequest from "../core/baseRequest";
import { b64EncodeUnicode } from "../utils/helpers";

export class UserStore {
  @observable isLoggedIn = false;
  @observable name = "";
  @observable email = "";

  @action changeStatus(isLoggedIn) {
    this.isLoggedIn = isLoggedIn;
  }

  @action async login(email, password) {
    const encoded = b64EncodeUnicode(email + "=" + password);
    await baseRequest.addHeader(encoded);
    const response = await baseRequest.post("/login", null);
    if (response.data.result === "success") {
      localStorage.setItem("token", response.data.token);
      baseRequest.addToken(response.data.token);
      this.name = response.data.resultData.name;
      this.email = response.data.resultData.email;
      this.isLoggedIn = true;
      localStorage.setItem("user", this.username);

      return response.data;
    } else {
      return null;
    }
  }

  @action control() {
    const token = localStorage.getItem("token");
    if (token) {
      baseRequest.addToken(token);
      return true;
    } else {
      return false;
    }
  }
}
