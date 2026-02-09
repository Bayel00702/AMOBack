require("dotenv").config();
const api = require("./index");

const PORT = process.env.PORT || 5000;

api.listen(PORT, () => {
    const baseUrl = `http://localhost:${PORT}`;

    console.log(`
🚀 Server started successfully!

🔗 Base URL: ${baseUrl}
  `);
});