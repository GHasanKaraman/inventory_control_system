import React from "react";
import { storesContext } from "./stores";

export const useStore = () => React.useContext(storesContext);

