import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { observer, useObserver } from "mobx-react";

import LoginPage from "../components/loginPage/loginPage";
import HomePage from "../components/homePage/homePage";
import GivePage from "../components/givePage/givePage";

const Pages = observer(() => {
  return useObserver(() => (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/home" element={<HomePage />} />
        <Route exact path="/qr/:id" element={<GivePage />} />
      </Routes>
    </Router>
  ));
});

export default Pages;
