import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { observer, useObserver } from "mobx-react";
import LoginPage from "../components/loginPage/loginPage";
import history from "../history/history";

const Pages = observer(() => {
  return useObserver(() => (
    <Router history={history}>
      <Routes>
        <Route exact path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  ));
});

export default Pages;
