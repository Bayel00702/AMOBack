const express = require('express');
const cors = require('cors');
const {registerUser, loginUser, logOut, logoutAll} = require('./controller/auth/auth');
const {
    registerUserValidation,
    loginUserValidation,
    handleValidationErrors,
} = require("./validation/validation");
const adminRoute = require("./controller/routes/adminRoutes")
const cookieParser = require("cookie-parser");
const {refresh} = require("./controller/auth/refresh");
const { loginLimiter, refreshLimiter } = require("./controller/middleweras/rateLimit");
const {authMiddleware} = require("./controller/middleweras/AuthMiddleweras/authMiddl");
const { listMySessions, revokeSession, revokeAllSessions } = require("./controller/auth/session");
const { getCategoriesPublic } = require("./controller/public/public.categories");
const productRoutes = require("./controller/routes/productRoutes");
const cartRoutes = require("./controller/routes/cartRoutes");

const api = express();

api.use(express.json());
api.use(cors());
api.use(cookieParser());

api.get("/health", (req, res) => {
    res.json({ status: "OK" });
});

// auth
api.post("/register", registerUserValidation, handleValidationErrors, registerUser);
api.post("/login", loginLimiter, loginUserValidation,handleValidationErrors, loginUser);
api.post("/logout", logOut)
api.post("/auth/refresh",refreshLimiter,  refresh)
api.post("/auth/logout-all", authMiddleware, logoutAll);

// admin

api.use("/admin", adminRoute);

api.get("/auth/sessions", authMiddleware, listMySessions);
api.delete("/auth/sessions/:id", authMiddleware, revokeSession);
api.post("/auth/logoutAllSessions", authMiddleware, revokeAllSessions);

api.get("/categories", getCategoriesPublic);

api.use("/products", productRoutes);

api.use("/cart", cartRoutes);

api.set("trust proxy", 1);
module.exports = api;
