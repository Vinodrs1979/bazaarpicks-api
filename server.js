const express = require('express');
const cors = require('cors');
const express = require('express');
const cors = require('cors');

// Stealth Mode Code
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const app = express();
app.use(cors());
app.use(express.json()); // Frontend से JSON डेटा लेने के लिए

// Amazon से डेटा निकालने वाला API Route
app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('amazon')) {
        return res.status(400).json({ error: "Please provide a valid Amazon URL" });
    }

    try {
        console.log("Fetching data from Amazon... Please wait.");

        // ब्राउज़र चालू करें (headless: true मतलब यह बैकग्राउंड में बिना स्क्रीन दिखे चलेगा)
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Amazon को बेवकूफ बनाने के लिए असली ब्राउज़र जैसी पहचान (User-Agent) सेट करें
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        // URL पर जाएँ
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // पेज से टाइटल, प्राइस और इमेज निकालें
        const productData = await page.evaluate(() => {
            // 1. Title
            const title = document.querySelector('#productTitle')?.innerText.trim() || "Title not found";

            // 2. Price (Amazon India में क्लास .a-price-whole होती है)
            let priceText = document.querySelector('.a-price-whole')?.innerText || "0";
            let price = Number(priceText.replace(/,/g, '').replace(/\./g, '')); // कोमा हटाकर नंबर बनाएँ

            // 3. Image
            const image = document.querySelector('#landingImage')?.src || document.querySelector('#imgTagWrapperId img')?.src || "";

            return { title, price, image };
        });

        await browser.close();
        console.log("Success:", productData);

        // फ्रंटएंड को डेटा वापस भेजें
        res.json(productData);

    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).json({ error: "Failed to fetch data. Amazon might have blocked the request." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Scraping Server running on http://localhost:${PORT}`);
});