import React from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react";
import { useNavigate } from "react-router-dom";

import { Button } from "antd";

import baseRequest from "../../core/baseRequest";

const homepage = observer((props) => {
  const navigate = useNavigate();
  useEffect(() => {
    console.log(localStorage.getItem("token"));
  }, []);

  const logout = async () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <Button type="primary" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
});

export default homepage;
