const express = require("express");
const prisma = require("../prisma.js");

const router = express.Router();

router.post("/", async (req, res) => {
    const { email, name } = req.body;

    const user = await prisma.user.create({
        data: { email, name }
    });

    res.json(user);
});

router.get("/", async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

module.exports = router;