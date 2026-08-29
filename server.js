const express = require('express');
const cors = require('cors');

// Stealth Mode Setup (Amazon को असली इंसान दिखाने के लिए)
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('amazon')) {
        return res.status(400).json({ error: "Please provide a valid Amazon URL" });
    }

    try {
        console.log("Fetching data with Stealth Mode... Please wait.");

        // Render के सर्वर के लिए खास सेटिंग्स
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const productData = await page.evaluate(() => {
            const title = document.querySelector('#productTitle')?.innerText.trim() || "Title not found";

            let priceText = document.querySelector('.a-price-whole')?.innerText || "0";
            let price = Number(priceText.replace(/,/g, '').replace(/\./g, ''));

            const image = document.querySelector('#landingImage')?.src || document.querySelector('#imgTagWrapperId img')?.src || "";

            return { title, price, image };
        });

        await browser.close();
        console.log("Success:", productData);

        res.json(productData);

    } catch (error) {
        console.error("Scraping Error:", error);
        res.status(500).json({ error: "Failed to fetch data. Amazon might have blocked the request." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Stealth Server running on port ${PORT}`);
});