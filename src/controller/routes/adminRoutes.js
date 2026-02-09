const express = require("express");
const router = express.Router();

const auth = require("../middleweras/auth");
const requireRole = require("../middleweras/reqRole");

// 🔒 всё ниже — только ADMIN
router.use(auth);
router.use(requireRole("ADMIN"));

router.get("/ping", (req, res) => {
    res.json({ message: "ADMIN OK", user: req.user });
});

module.exports = router;