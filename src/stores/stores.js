import React from "react";
import { UserStore } from "./userStore";
export const storesContext = React.createContext({
  userStore: new UserStore(),
});

