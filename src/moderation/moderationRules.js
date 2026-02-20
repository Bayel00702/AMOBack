const bannedWords = [
    "оружие",
    "наркотик",
    "scam",
    "hack",
];

const checkBannedWords = (text = "") => {
    const lower = text.toLowerCase();
    const found = bannedWords.find((w) => lower.includes(w));
    if (found) {
        return {
            status: "REJECTED",
            reason: `Запрещённое слово: ${found}`,
        };
    }
    return null;
};

const checkLowPrice = (price) => {
    if (Number(price) < 10) {
        return {
            status: "PENDING",
            reason: "Подозрительно низкая цена",
        };
    }
    return null;
};

const checkNoImages = (images) => {
    if (!images || images.length === 0) {
        return {
            status: "PENDING",
            reason: "Нет изображений",
        };
    }
    return null;
};

module.exports = {
    checkBannedWords,
    checkLowPrice,
    checkNoImages,
};