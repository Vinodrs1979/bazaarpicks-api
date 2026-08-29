document.getElementById("year").textContent = new Date().getFullYear();

let activeCategory = "all";
let searchTerm = "";

function renderCategories() {
  const categories = Store.getCategories();
  const strip = document.getElementById("categoryStrip");
  const chips = [{ id: "all", name: "All deals", icon: "✨" }, ...categories];
  strip.innerHTML = chips
    .map(
      (c) => `
    <button class="chip ${c.id === activeCategory ? "active" : ""}" data-cat="${c.id}">
      <span>${c.icon || ""}</span> ${c.name}
    </button>`
    )
    .join("");

  strip.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategories();
      renderGrid();
    });
  });
}

function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderGrid() {
  const products = Store.getProducts();
  const categories = Store.getCategories();
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  let filtered = products.filter((p) => (activeCategory === "all" ? true : p.category === activeCategory));
  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (catMap[p.category] || "").toLowerCase().includes(q));
  }

  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("emptyState");
  const title = document.getElementById("gridTitle");
  const count = document.getElementById("gridCount");

  title.textContent = activeCategory === "all" ? "All deals" : catMap[activeCategory] || "Deals";
  count.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = filtered
    .map((p) => {
      const discount = discountPercent(p.price, p.originalPrice);
      return `
      <div class="card">
        ${p.badge ? `<div class="card-tag">${p.badge}</div>` : ""}
        ${discount > 0 ? `<div class="card-discount">${discount}% OFF</div>` : ""}
        <div class="card-img"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
        <div class="card-body">
          <div class="card-cat">${catMap[p.category] || "Uncategorised"}</div>
          <p class="card-name">${p.name}</p>
          <div class="card-rating"><span class="stars">${starString(p.rating || 0)}</span> ${p.rating || "—"} (${(p.reviews || 0).toLocaleString("en-IN")})</div>
          <div class="card-price-row">
            <span class="card-price">${formatINR(p.price)}</span>
            ${p.originalPrice > p.price ? `<span class="card-original">${formatINR(p.originalPrice)}</span>` : ""}
          </div>
          <a class="card-cta" href="${p.affiliateLink}" target="_blank" rel="nofollow sponsored noopener">
            Buy on Amazon →
          </a>
        </div>
      </div>`;
    })
    .join("");
}

function renderHeroStats() {
  const products = Store.getProducts();
  const discounts = products.map((p) => discountPercent(p.price, p.originalPrice)).filter((d) => d > 0);
  const avg = discounts.length ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) : 0;
  document.getElementById("heroDiscount").textContent = avg + "%";
  document.getElementById("heroCount").textContent = `${products.length} products tracked`;
}

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderGrid();
});

renderCategories();
renderGrid();
renderHeroStats();
