const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB DATABASE CONNECTION
// ==========================================
// यहाँ अपना कॉपी किया हुआ MongoDB का लिंक डालें (पासवर्ड के साथ)
const MONGO_URL = "mongodb+srv://vrsapplications_db_user:अपना_असली_पासवर्ड_यहाँ_डालें@cluster0.abcde.mongodb.net/BazaarPicks?retryWrites=true&w=majority";

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB Database Connected!'))
    .catch((err) => console.error('❌ Database Connection Error:', err));

// Product Schema (डेटाबेस में प्रोडक्ट कैसा दिखेगा)
const productSchema = new mongoose.Schema({
    name: String,
    link: String,
    category: String,
    price: Number,
    image: String
});
const Product = mongoose.model('Product', productSchema);

// ==========================================
// 2. SCRAPER API (Amazon Data Fetching)
// ==========================================
app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;
    if (!url || !url.includes('amazon')) return res.status(400).json({ error: "Invalid URL" });

    try {
        // यहाँ अपनी 32 अक्षरों वाली ScraperAPI Key डालें
        const SCRAPER_API_KEY = 'यहाँ_अपनी_SCRAPER_API_KEY_डालें';
        const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`;

        const response = await axios.get(scraperUrl);
        const $ = cheerio.load(response.data);

        const title = $('#productTitle').text().trim() || "Title not found";
        let priceText = $('.a-price-whole').first().text() || "0";
        let price = Number(priceText.replace(/,/g, '').replace(/\./g, ''));
        const image = $('#landingImage').attr('src') || $('#imgTagWrapperId img').attr('src') || "";

        res.json({ title, price, image });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

// ==========================================
// 3. DATABASE APIs (CRUD Operations)
// ==========================================

// सभी प्रोडक्ट्स मँगाना (GET)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Failed to get products" });
    }
});

// नया प्रोडक्ट सेव करना (POST)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ message: "Product saved successfully!", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Failed to save product" });
    }
});

// प्रोडक्ट डिलीट करना (DELETE)
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});