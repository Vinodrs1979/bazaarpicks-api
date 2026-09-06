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
const MONGO_URI = "mongodb+srv://vrsapplications_db_user:bazaar12345@cluster0.skplavv.mongodb.net/bazaarpicks?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("MongoDB Error:", err));

// ==========================================
// 2. DATABASE SCHEMAS
// ==========================================
const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, link: String, category: String, price: Number, image: String
}));
const Category = mongoose.model('Category', new mongoose.Schema({ name: String }));

// ==========================================
// 3. AMAZON SCRAPER API (Auto-Category Added)
// ==========================================
app.post('/api/fetch-amazon', async (req, res) => {
    const { url } = req.body;
    // 🔥 यहाँ आपकी नई API Key डाल दी गई है
    const SCRAPER_API_KEY = 'db5177299cdcd5ae3d0ecb700777e06a'; 
    
    try {
        const response = await axios.get(`http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`);
        const $ = cheerio.load(response.data);
        
        const title = $('#productTitle').text().trim() || "Title not found";
        let priceText = $('.a-price-whole').first().text() || "0";
        let price = Number(priceText.replace(/,/g, '').replace(/\./g, ''));
        const image = $('#landingImage').attr('src') || $('#imgTagWrapperId img').attr('src') || "";
        
        // Amazon से कैटेगरी निकालना
        let category = $('#wayfinding-breadcrumbs_feature_div ul li:first-child a').text().trim();
        if(!category) category = "Uncategorized";
        
        res.json({ title, price, image, category });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

// ==========================================
// 4. DATABASE ROUTES (WITH MAKE.COM WEBHOOK)
// ==========================================
app.get('/api/products', async (req, res) => res.json(await Product.find()));

// Save Product + Trigger Make.com Webhook
app.post('/api/products', async (req, res) => {
    try {
        // 1. डेटाबेस (MongoDB) में प्रोडक्ट सेव करना
        const newProduct = new Product(req.body);
        await newProduct.save();

        // 2. Make.com Webhook को डेटा भेजना
        const makeWebhookUrl = 'https://hook.eu1.make.com/9de8gb16jcgoltyz6zfod4glv1um6lt1';
        
        axios.post(makeWebhookUrl, {
            productName: req.body.name,
            productLink: req.body.link,
            productImage: req.body.image,
            productPrice: req.body.price,
            productCategory: req.body.category
        }).catch(err => console.log('Make.com Webhook Error:', err.message)); 

        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ error: "Failed to save product" });
    }
});

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
