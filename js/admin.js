/* ---------- Auth gate ---------- */
const loginShell = document.getElementById("loginShell");
const adminShell = document.getElementById("adminShell");

function checkAuth() {
  if (Store.isLoggedIn()) {
    loginShell.style.display = "none";
    adminShell.style.display = "flex";
    renderAll();
  } else {
    loginShell.style.display = "flex";
    adminShell.style.display = "none";
  }
}

document.getElementById("loginBtn").addEventListener("click", attemptLogin);
document.getElementById("loginPassword").addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

function attemptLogin() {
  const pw = document.getElementById("loginPassword").value;
  if (Store.login(pw)) {
    document.getElementById("loginError").style.display = "none";
    checkAuth();
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  Store.logout();
  checkAuth();
});

/* ---------- View switching ---------- */
const navItems = document.querySelectorAll(".nav-item[data-view]");
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById("view-" + item.dataset.view).style.display = "block";
    renderAll();
  });
});

/* ---------- Toast ---------- */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

/* ---------- Render everything ---------- */
function renderAll() {
  renderDashboard();
  renderProductsTable();
  renderCategoriesTable();
  populateCategorySelect();
}

function renderDashboard() {
  const products = Store.getProducts();
  const categories = Store.getCategories();
  document.getElementById("statProducts").textContent = products.length;
  document.getElementById("statCategories").textContent = categories.length;
  const discounts = products.map((p) => discountPercent(p.price, p.originalPrice)).filter((d) => d > 0);
  const avg = discounts.length ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) : 0;
  document.getElementById("statDiscount").textContent = avg + "%";

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const recent = [...products].slice(-5).reverse();
  document.getElementById("recentProductsBody").innerHTML = recent
    .map(
      (p) => `
    <tr>
      <td><img class="table-thumb" src="${p.image}" alt=""></td>
      <td>${p.name}</td>
      <td>${catMap[p.category] || "—"}</td>
      <td>${formatINR(p.price)}</td>
    </tr>`
    )
    .join("") || `<tr><td colspan="4" style="color:var(--slate);">No products yet.</td></tr>`;
}

function renderProductsTable() {
  const products = Store.getProducts();
  const categories = Store.getCategories();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  document.getElementById("productsBody").innerHTML = products
    .map(
      (p) => `
    <tr>
      <td><img class="table-thumb" src="${p.image}" alt=""></td>
      <td>${p.name}</td>
      <td>${catMap[p.category] || "—"}</td>
      <td>${formatINR(p.price)}${p.originalPrice > p.price ? ` <span style="color:var(--slate);text-decoration:line-through;font-size:0.8em;">${formatINR(p.originalPrice)}</span>` : ""}</td>
      <td>${p.badge ? `<span class="badge-pill">${p.badge}</span>` : ""}</td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" onclick="openProductModal('${p.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="removeProduct('${p.id}')">Delete</button>
      </td>
    </tr>`
    )
    .join("") || `<tr><td colspan="6" style="color:var(--slate);">No products yet. Click "Add product" to create one.</td></tr>`;
}

function renderCategoriesTable() {
  const categories = Store.getCategories();
  const products = Store.getProducts();
  document.getElementById("categoriesBody").innerHTML = categories
    .map((c) => {
      const count = products.filter((p) => p.category === c.id).length;
      return `
    <tr>
      <td style="font-size:1.2rem;">${c.icon || "🏷️"}</td>
      <td>${c.name}</td>
      <td>${count}</td>
      <td class="row-actions">
        <button class="btn btn-ghost btn-sm" onclick="openCategoryModal('${c.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="removeCategory('${c.id}')">Delete</button>
      </td>
    </tr>`;
    })
    .join("") || `<tr><td colspan="4" style="color:var(--slate);">No categories yet.</td></tr>`;
}

function populateCategorySelect() {
  const categories = Store.getCategories();
  document.getElementById("productCategory").innerHTML = categories
    .map((c) => `<option value="${c.id}">${c.icon || ""} ${c.name}</option>`)
    .join("");
}

/* ---------- Product modal ---------- */
const productModalOverlay = document.getElementById("productModalOverlay");
const productForm = document.getElementById("productForm");

document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
document.getElementById("productCancelBtn").addEventListener("click", () => (productModalOverlay.style.display = "none"));

function openProductModal(id) {
  populateCategorySelect();
  const isEdit = Boolean(id);
  document.getElementById("productModalTitle").textContent = isEdit ? "Edit product" : "Add product";
  if (isEdit) {
    const p = Store.getProducts().find((x) => x.id === id);
    document.getElementById("productId").value = p.id;
    document.getElementById("productName").value = p.name;
    document.getElementById("productCategory").value = p.category;
    document.getElementById("productBadge").value = p.badge || "";
    document.getElementById("productPrice").value = p.price;
    document.getElementById("productOriginalPrice").value = p.originalPrice || "";
    document.getElementById("productRating").value = p.rating || "";
    document.getElementById("productReviews").value = p.reviews || "";
    document.getElementById("productImage").value = p.image || "";
    document.getElementById("productLink").value = p.affiliateLink || "";
    document.getElementById("productDescription").value = p.description || "";
  } else {
    productForm.reset();
    document.getElementById("productId").value = "";
  }
  productModalOverlay.style.display = "flex";
}

productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("productId").value;
  const data = {
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value,
    badge: document.getElementById("productBadge").value.trim(),
    price: Number(document.getElementById("productPrice").value) || 0,
    originalPrice: Number(document.getElementById("productOriginalPrice").value) || 0,
    rating: Number(document.getElementById("productRating").value) || 0,
    reviews: Number(document.getElementById("productReviews").value) || 0,
    image: document.getElementById("productImage").value.trim() || "https://via.placeholder.com/400x340?text=No+Image",
    affiliateLink: document.getElementById("productLink").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
  };

  if (id) {
    Store.updateProduct(id, data);
    showToast("Product updated");
  } else {
    Store.addProduct({ id: uid("p"), ...data });
    showToast("Product added");
  }
  productModalOverlay.style.display = "none";
  renderAll();
});

function removeProduct(id) {
  if (!confirm("Delete this product? This can't be undone.")) return;
  Store.deleteProduct(id);
  showToast("Product deleted");
  renderAll();
}

/* ---------- Category modal ---------- */
const categoryModalOverlay = document.getElementById("categoryModalOverlay");
const categoryForm = document.getElementById("categoryForm");

document.getElementById("addCategoryBtn").addEventListener("click", () => openCategoryModal());
document.getElementById("categoryCancelBtn").addEventListener("click", () => (categoryModalOverlay.style.display = "none"));

function openCategoryModal(id) {
  const isEdit = Boolean(id);
  document.getElementById("categoryModalTitle").textContent = isEdit ? "Edit category" : "Add category";
  if (isEdit) {
    const c = Store.getCategories().find((x) => x.id === id);
    document.getElementById("categoryId").value = c.id;
    document.getElementById("categoryIcon").value = c.icon || "";
    document.getElementById("categoryName").value = c.name;
  } else {
    categoryForm.reset();
    document.getElementById("categoryId").value = "";
  }
  categoryModalOverlay.style.display = "flex";
}

categoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = document.getElementById("categoryId").value;
  const data = {
    name: document.getElementById("categoryName").value.trim(),
    icon: document.getElementById("categoryIcon").value.trim(),
  };
  if (id) {
    Store.updateCategory(id, data);
    showToast("Category updated");
  } else {
    Store.addCategory({ id: uid("cat"), ...data });
    showToast("Category added");
  }
  categoryModalOverlay.style.display = "none";
  renderAll();
});

function removeCategory(id) {
  const inUse = Store.getProducts().some((p) => p.category === id);
  if (inUse && !confirm("Products use this category. Delete anyway? Their category will show as blank.")) return;
  if (!inUse && !confirm("Delete this category?")) return;
  Store.deleteCategory(id);
  showToast("Category deleted");
  renderAll();
}

checkAuth();
