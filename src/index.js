const express = require('express');
const cors = require('cors');
const usersRoutes = require('./controller/users');

const api = express();

api.use(express.json());
api.use(cors())

api.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

api.use("/api/users", usersRoutes);


module.exports = api;
