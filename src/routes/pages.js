import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "../components/loginPage/loginPage";
import HomePage from "../components/homePage/homePage";
import GivePage from "../components/givePage/givePage";
import RackPage from "../components/rackPage/rackPage";

const Pages = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/home" element={<HomePage />} />
        <Route exact path="/qr/:id" element={<GivePage />} />
        <Route exact path="/rack/:id" element={<RackPage />} />
      </Routes>
    </Router>
  );
};

export default Pages;
