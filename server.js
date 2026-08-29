const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;

    if (!url || !url.includes('amazon')) {
        return res.status(400).json({ error: "Please provide a valid Amazon URL" });
    }

    try {
        console.log("Fetching data via ScraperAPI...");

        // यहाँ अपनी ScraperAPI Key डालें
        const SCRAPER_API_KEY = 'ccea13e27fdead232551758c4fa28b0e';

        // ScraperAPI के ज़रिए Amazon को रिक्वेस्ट भेजना
        const targetUrl = encodeURIComponent(url);
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${targetUrl}`;

        const response = await axios.get(scraperUrl);
        const html = response.data;

        // Cheerio से HTML को पढ़ना (यह Puppeteer से बहुत तेज़ है)
        const $ = cheerio.load(html);

        const title = $('#productTitle').text().trim() || "Title not found";

        let priceText = $('.a-price-whole').first().text() || "0";
        let price = Number(priceText.replace(/,/g, '').replace(/\./g, ''));

        const image = $('#landingImage').attr('src') || $('#imgTagWrapperId img').attr('src') || "";

        console.log("Success:", { title, price, image });
        res.json({ title, price, image });

    } catch (error) {
        console.error("Scraping Error:", error.message);
        res.status(500).json({ error: "Failed to fetch data. ScraperAPI might have failed." });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Fast API Server running on port ${PORT}`);
});