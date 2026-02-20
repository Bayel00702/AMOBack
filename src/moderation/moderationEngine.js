const {
    checkBannedWords,
    checkLowPrice,
    checkNoImages,
} = require("./moderationRules");

const runModeration = ({ title, description, price, images }) => {
    const text = `${title} ${description || ""}`;

    const rules = [
        () => checkBannedWords(text),
        () => checkLowPrice(price),
        () => checkNoImages(images),
    ];

    for (const rule of rules) {
        const result = rule();
        if (result) return result;
    }

    return { status: "APPROVED" };
};

module.exports = { runModeration };