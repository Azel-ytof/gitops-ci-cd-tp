const cart = new Map();
const euros = (cents) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

async function loadProducts() {
  const products = await (await fetch("/api/products")).json();
  // lodash, pour trier les produits par producteur
  const sorted = _.sortBy(products, ["producer", "name"]);
  const grid = document.getElementById("products");
  grid.innerHTML = "";
  for (const p of sorted) {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <img src="/images/${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p class="producer">${p.producer}</p>
      <p class="price">${euros(p.price)} <span>${p.unit}</span></p>
      <button type="button">Ajouter</button>`;
    card.querySelector("button").addEventListener("click", () => add(p));
    grid.append(card);
  }
}

async function loadSlots() {
  const slots = await (await fetch("/api/slots")).json();
  const select = document.getElementById("slots");
  for (const s of slots) {
    const start = new Date(s.start);
    const option = new Option(
      start.toLocaleString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
      s.start,
    );
    select.append(option);
  }
}

function add(product) {
  const line = cart.get(product.id) ?? { product, quantity: 0 };
  line.quantity += 1;
  cart.set(product.id, line);
  showCart();
}

function lines() {
  return [...cart.values()].map((l) => ({ productId: l.product.id, quantity: l.quantity }));
}

async function showCart() {
  const list = document.getElementById("cart");
  list.innerHTML = "";
  for (const l of cart.values()) {
    const li = document.createElement("li");
    li.textContent = `${l.quantity} × ${l.product.name}`;
    list.append(li);
  }
  const zone = document.getElementById("quote");
  if (cart.size === 0) {
    zone.innerHTML = "";
    return;
  }
  const res = await fetch("/api/cart/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lines: lines() }),
  });
  const q = await res.json();
  zone.innerHTML = `
    <dt>Sous-total</dt><dd>${euros(q.subtotal)}</dd>
    <dt>Remise</dt><dd>− ${euros(q.discount)}</dd>
    <dt>Retrait</dt><dd>${euros(q.fee)}</dd>
    <dt>Total</dt><dd><strong>${euros(q.total)}</strong></dd>`;
}

document.getElementById("order").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: { name: form.get("name"), email: form.get("email") },
      lines: lines(),
      slot: form.get("slot"),
    }),
  });
  const body = await res.json();
  document.getElementById("message").textContent = res.ok
    ? `Commande ${body.id} enregistrée : ${euros(body.total)} à régler au retrait.`
    : body.error;
  if (res.ok) {
    cart.clear();
    showCart();
  }
});

loadProducts();
loadSlots();
