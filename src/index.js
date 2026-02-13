const express = require('express');
const cors = require('cors');
const {registerUser, loginUser, logOut} = require('./controller/auth/auth');
const {getAllUser} = require('./controller/user/user');
const {
    registerUserValidation,
    loginUserValidation,
    handleValidationErrors,
} = require("./validation/validation");
const adminRoute = require("./controller/routes/adminRoutes")
const cookieParser = require("cookie-parser");
const {refresh} = require("../src/controller/auth/refresh");

const api = express();

api.use(express.json());
api.use(cors());
api.use(cookieParser());

api.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// auth
api.post("/register", registerUserValidation, handleValidationErrors, registerUser);
api.post("/login", loginUserValidation,handleValidationErrors, loginUser);
api.post("/logout", logOut)
api.post("/auth/refresh", refresh)

// user

api.get("/getUser", getAllUser);


// admin

api.use("/admin", adminRoute);


module.exports = api;
