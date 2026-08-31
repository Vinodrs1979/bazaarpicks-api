// ==========================================
// RENDER API SERVER URL
// ==========================================
const SERVER_URL = "https://bazaarpicks-api.onrender.com";

// पासवर्ड (आप इसे js/data.js में भी सेट कर सकते हैं)
const ADMIN_PASS = typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : "bazaar123";

// ग्लोबल डेटा
let products = [];
let categories = [];

// ==========================================
// 1. UI HELPERS (Toast & Modals)
// ==========================================
function showToast(message) {
  const toast = document.getElementById("toast");
  if(toast) {
    toast.textContent = message;
    toast.style.display = "block";
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(()=>toast.style.display="none", 300); }, 3000);
  } else {
    alert(message);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
}

// ==========================================
// 2. LOGIN SYSTEM
// ==========================================
function checkLogin() {
  if (sessionStorage.getItem("isAdmin") === "true") {
    document.getElementById("loginShell").style.display = "none";
    document.getElementById("adminShell").style.display = "flex";
    loadDatabase();
  } else {
    document.getElementById("loginShell").style.display = "flex";
    document.getElementById("adminShell").style.display = "none";
  }
}

document.getElementById("loginBtn").addEventListener("click", () => {
  const pass = document.getElementById("loginPassword").value;
  if (pass === ADMIN_PASS) {
    sessionStorage.setItem("isAdmin", "true");
    checkLogin();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("isAdmin");
  checkLogin();
});

// ==========================================
// 3. TABS NAVIGATION
// ==========================================
document.querySelectorAll('.nav-item[data-view]').forEach(item => {
  item.addEventListener('click', (e) => {
    // सारे टैब्स से active हटाओ
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // सारे सेक्शन छुपाओ
    const view = e.currentTarget.getAttribute('data-view');
    document.querySelectorAll('main section').forEach(sec => sec.style.display = 'none');
    
    // जो क्लिक किया उसे दिखाओ
    document.getElementById(`view-${view}`).style.display = 'block';
  });
});

// ==========================================
// 4. DATABASE FETCH & RENDER
// ==========================================
async function loadDatabase() {
  try {
    const pRes = await fetch(`${SERVER_URL}/api/products`);
    products = await pRes.json();
    
    const cRes = await fetch(`${SERVER_URL}/api/categories`);
    categories = await cRes.json();
    
    renderDashboard();
    renderProducts();
    renderCategories();
    populateCategoryDropdown();
  } catch (err) {
    console.error("Database connection failed", err);
    showToast("Error connecting to Database!");
  }
}

function renderDashboard() {
  document.getElementById("statProducts").textContent = products.length;
  document.getElementById("statCategories").textContent = categories.length;
  
  // Dashboard Table
  const tbody = document.getElementById("recentProductsBody");
  tbody.innerHTML = "";
  const recent = [...products].reverse().slice(0, 5); // आखिरी 5 प्रोडक्ट
  
  recent.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.image}" width="40" height="40" style="object-fit:cover; border-radius:4px;"></td>
        <td>${p.name.substring(0,30)}...</td>
        <td>${p.category || '-'}</td>
        <td>₹${p.price}</td>
      </tr>`;
  });
}

function renderProducts() {
  const tbody = document.getElementById("productsBody");
  tbody.innerHTML = "";
  products.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td><img src="${p.image}" width="40" height="40" style="object-fit:cover; border-radius:4px;"></td>
        <td>${p.name.substring(0,30)}...</td>
        <td>${p.category || '-'}</td>
        <td>₹${p.price}</td>
        <td>${p.badge || '-'}</td>
        <td><button onclick="deleteProduct('${p._id}')" style="background:#ffdddd; color:red; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button></td>
      </tr>`;
  });
}

function renderCategories() {
  const tbody = document.getElementById("categoriesBody");
  tbody.innerHTML = "";
  categories.forEach(c => {
    // इस कैटेगरी में कितने प्रोडक्ट हैं, वह गिनना
    const count = products.filter(p => p.category === c.name).length;
    tbody.innerHTML += `
      <tr>
        <td>${c.icon || '🏷️'}</td>
        <td>${c.name}</td>
        <td>${count} items</td>
        <td><button onclick="deleteCategory('${c._id}')" style="background:#ffdddd; color:red; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">Delete</button></td>
      </tr>`;
  });
}

function populateCategoryDropdown() {
  const select = document.getElementById("productCategory");
  select.innerHTML = "";
  if(categories.length === 0) {
    select.innerHTML = `<option value="">⚠️ Please create a category first</option>`;
  } else {
    categories.forEach(c => select.innerHTML += `<option value="${c.name}">${c.name}</option>`);
  }
}

// ==========================================
// 5. ADD / DELETE LOGIC (API CALLS)
// ==========================================

// Add Product
document.getElementById("addProductBtn").addEventListener("click", () => {
  document.getElementById("productForm").reset();
  openModal("productModalOverlay");
});

document.getElementById("productCancelBtn").addEventListener("click", () => closeModal("productModalOverlay"));

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = "Saving... ⏳";
  btn.disabled = true;

  const newProduct = {
    link: document.getElementById("productLink").value,
    name: document.getElementById("productName").value,
    category: document.getElementById("productCategory").value,
    price: document.getElementById("productPrice").value,
    originalPrice: document.getElementById("productOriginalPrice").value || null,
    rating: document.getElementById("productRating").value || null,
    reviews: document.getElementById("productReviews").value || null,
    image: document.getElementById("productImage").value,
    badge: document.getElementById("productBadge").value || null,
    description: document.getElementById("productDescription").value || ""
  };

  try {
    const response = await fetch(`${SERVER_URL}/api/products`, { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify(newProduct) 
    });
    if (!response.ok) throw new Error("Server Error");
    
    closeModal("productModalOverlay");
    showToast("Product saved successfully! 🎉");
    await loadDatabase();
  } catch(err) {
    showToast("Error saving product.");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Add Category
document.getElementById("addCategoryBtn").addEventListener("click", () => {
  document.getElementById("categoryForm").reset();
  openModal("categoryModalOverlay");
});

document.getElementById("categoryCancelBtn").addEventListener("click", () => closeModal("categoryModalOverlay"));

document.getElementById("categoryForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  btn.textContent = "Saving... ⏳";
  btn.disabled = true;

  const newCategory = {
    name: document.getElementById("categoryName").value,
    icon: document.getElementById("categoryIcon").value || '🏷️'
  };

  try {
    const response = await fetch(`${SERVER_URL}/api/categories`, { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify(newCategory) 
    });
    if (!response.ok) throw new Error("Server Error");
    
    closeModal("categoryModalOverlay");
    showToast("Category saved successfully! 🎉");
    await loadDatabase();
  } catch(err) {
    showToast("Error saving category.");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
});

// Delete Functions
window.deleteProduct = async function(id) {
  if(confirm("Are you sure you want to delete this product?")) {
    try {
      await fetch(`${SERVER_URL}/api/products/${id}`, {method: 'DELETE'});
      showToast("Product deleted!");
      await loadDatabase();
    } catch(err) { showToast("Error deleting product."); }
  }
}

window.deleteCategory = async function(id) {
  if(confirm("Are you sure you want to delete this category?")) {
    try {
      await fetch(`${SERVER_URL}/api/categories/${id}`, {method: 'DELETE'});
      showToast("Category deleted!");
      await loadDatabase();
    } catch(err) { showToast("Error deleting category."); }
  }
}

// ==========================================
// 6. INITIALIZE
// ==========================================
checkLogin();
