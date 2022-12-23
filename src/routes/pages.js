import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { observer, useObserver } from "mobx-react";

import LoginPage from "../components/loginPage/loginPage";
import HomePage from "../components/homePage/homePage";

const Pages = observer(() => {
  return useObserver(() => (
    <Router>
      <Routes>
        <Route exact path="/" render={() => <Navigate to="/home" />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  ));
});

export default Pages;
