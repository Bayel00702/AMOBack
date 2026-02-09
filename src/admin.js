const express = require("express");
const auth = require("./controller/middleweras/auth");
const requireRole = require("./controller/middleweras/reqRole");
const { approveSeller, listPendingSellers } = require("./controller/admin/sellers");

const router = express.Router();

router.get("/sellers/pending", auth, requireRole("ADMIN"), listPendingSellers);
router.patch("/sellers/:id/approve", auth, requireRole("ADMIN"), approveSeller);

module.exports = router;