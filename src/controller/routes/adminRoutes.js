const express = require("express");
const router = express.Router();
const { banUser, unbanUser, getUsers } = require("../admin/admin.controller");
const { getPendingSellers, approveSeller, rejectSeller } = require("../admin/sellers.controller");


const auth = require("../middleweras/auth");
const requireRole = require("../middleweras/reqRole");
const cors = require("cors");

//  всё ниже — только ADMIN
router.use(auth);
router.use(requireRole("ADMIN"));

router.get("/ping", (req, res) => {
    res.json({ message: "ADMIN OK", user: req.user });
});

// BAN / UNBAN
router.patch("/users/:id/ban", banUser);
router.patch("/users/:id/unban", unbanUser);

router.get("/users", getUsers);

router.get("/sellers/pending", getPendingSellers);
router.patch("/sellers/:id/approve", approveSeller);
router.patch("/sellers/:id/reject", rejectSeller);

module.exports = router;