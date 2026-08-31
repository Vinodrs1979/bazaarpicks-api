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
// ध्यान दें: नीचे अपना असली MongoDB लिंक डालें (पासवर्ड के साथ)
const MONGO_URI = "यहाँ_अपना_MONGODB_LINK_डालें";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("MongoDB Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS (डेटा का स्ट्रक्चर)
// ==========================================
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, link: String, category: String, price: Number, image: String
}));
const Category = mongoose.model('Category', new mongoose.Schema({ name: String }));

// ==========================================
// 3. AMAZON SCRAPER API
// ==========================================
app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;
    
    // ध्यान दें: नीचे अपनी ScraperAPI की 32 अक्षरों वाली Key डालें
    const SCRAPER_API_KEY = 'ccea13e27fdead232551758c4fa28b0e'; 
    
    try {
        const response = await axios.get(`http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`);
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
// 4. DATABASE ROUTES (Frontend से बात करने के लिए)
// ==========================================
app.get('/api/products', async (req, res) => res.json(await Product.find()));
app.post('/api/products', async (req, res) => res.json(await new Product(req.body).save()));
app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

app.get('/api/categories', async (req, res) => res.json(await Category.find()));
app.post('/api/categories', async (req, res) => res.json(await new Category(req.body).save()));
app.delete('/api/categories/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`));