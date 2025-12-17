// const express = require("express");
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Express!");
});

app.listen(3000, () => {
  console.log("Start server port:3000");
});
