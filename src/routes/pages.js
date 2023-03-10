import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "../components/loginPage/loginPage";
import HomePage from "../components/homePage/homePage";
import LabelsPage from "../components/labelsPage/labelsPage";
import TechniciansPage from "../components/techniciansPage/techniciansPage";
import LogsPage from "../components/logsPage/logsPage";
import LocationsPage from "../components/locationsPage/locationsPage";
import OrdersPage from "../components/ordersPage/ordersPage";
import GivePage from "../components/givePage/givePage";
import RackPage from "../components/rackPage/rackPage";
import ItemsPage from "../components/itemsPage/itemsPage";
import VendorsPage from "../components/vendorsPage/vendorsPage";

const Pages = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/home" element={<HomePage />} />
        <Route exact path="/additem" element={<ItemsPage />} />
        <Route exact path="/labels" element={<LabelsPage />} />
        <Route exact path="/technicians" element={<TechniciansPage />} />
        <Route exact path="/logs" element={<LogsPage />} />
        <Route exact path="/locations" element={<LocationsPage />} />
        <Route exact path="/vendors" element={<VendorsPage />} />
        <Route exact path="/orders" element={<OrdersPage />} />
        <Route exact path="/qr/:id" element={<GivePage />} />
        <Route exact path="/rack/:id" element={<RackPage />} />
      </Routes>
    </Router>
  );
};

export default Pages;
