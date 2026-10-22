"use strict";

const PRODUCTS = [
  {
    id: "kerala-diya-pair",
    name: "Kerala Brass Diya Pair",
    category: "Diya & lamps",
    image: "product_images/shared%20image.jpg",
    alt: "A pair of classic handcrafted Kerala brass oil lamps against a deep green background",
    description: "A graceful pair of traditional oil lamps, finished by hand for the moments that matter.",
    price: 3499,
    compareAt: 3999,
    badge: "A BELOVED CLASSIC",
    rating: "★★★★★",
    detail: "A pair of timeless Kerala-style brass oil lamps with a beautifully weighted base and warm, mirror-polished finish. Light them for your daily pooja or reserve them for the celebrations your family looks forward to all year.",
  },
  {
    id: "hanging-peacock-diya",
    name: "Peacock Hanging Deepam",
    category: "Diya & lamps",
    image: "product_images/shared%20image%20(1).jpg",
    alt: "An ornate suspended brass peacock deepam with traditional hanging bells",
    description: "A sculptural suspended deepam with intricate peacock detailing and little brass bells.",
    price: 4299,
    compareAt: null,
    badge: "ARTISAN PICK",
    rating: "★★★★★",
    detail: "A handcrafted hanging brass deepam featuring a delicately detailed peacock centerpiece and small bells that bring an extra sense of occasion to your home altar. Designed for thoughtful, decorative display.",
  },
  {
    id: "engraved-brass-urli",
    name: "Engraved Brass Urli",
    category: "Home accents",
    image: "product_images/shared%20image%20(2).jpg",
    alt: "A lidded, intricately engraved brass urli vessel on a dark marble plinth",
    description: "A keepsake brass vessel with fine engraving and an heirloom-inspired silhouette.",
    price: 2799,
    compareAt: 3199,
    badge: "A THOUGHTFUL GIFT",
    rating: "★★★★★",
    detail: "A substantial brass accent vessel, finished with detailed hand-engraved ornament and a gently domed lid. Place it on your entryway console or dress it with fresh flowers for a festive table.",
  },
  {
    id: "mayura-deepam",
    name: "Mayura Heritage Deepam",
    category: "Pooja essentials",
    image: "product_images/shared%20image%20(3).jpg",
    alt: "A tall, hand-cast brass heritage deepam featuring a sculpted peacock and lotus details",
    description: "A showstopping, hand-cast peacock lamp with a delicate lotus-petal base.",
    price: 5999,
    compareAt: null,
    badge: "THE STATEMENT PIECE",
    rating: "★★★★★",
    detail: "A sculptural traditional deepam with a peacock finial, hand-worked figure details, lotus-inspired accents and a generous stepped base. A striking centerpiece, made to become part of your family traditions.",
  },
  {
    id: "ashtamangala-aarti-diya",
    name: "Ashtamangala Aarti Diya",
    category: "Pooja essentials",
    image: "product_images/shared%20image%20(4).jpg",
    alt: "A handcrafted brass multi-wick aarti lamp inspired by a traditional sunburst",
    description: "A radiant, many-wick brass aarti lamp for evenings full of light.",
    price: 2299,
    compareAt: 2599,
    badge: "MADE FOR RITUAL",
    rating: "★★★★★",
    detail: "A distinctive multi-wick brass diya with a radiant petal-inspired design and traditional peacock ornament. A wonderful way to bring a gentle, golden glow to evening aarti and family gatherings.",
  },
];

const STORAGE_KEY = "ishvasya-storefront-v1";
const formatRupees = (amount) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
const productById = (id) => PRODUCTS.find((product) => product.id === id);
const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

function readSavedState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      cart: Array.isArray(stored.cart)
        ? stored.cart.filter(
            (item) =>
              productById(item?.id) &&
              Number.isSafeInteger(item.quantity) &&
              item.quantity > 0 &&
              item.quantity <= 99,
          )
        : [],
      wishlist: Array.isArray(stored.wishlist)
        ? stored.wishlist.filter((id) => productById(id))
        : [],
      coupon: stored.coupon === "HERITAGE10" || stored.coupon === "WELCOME5" ? stored.coupon : "",
      account:
        stored.account &&
        typeof stored.account.name === "string" &&
        typeof stored.account.email === "string"
          ? stored.account
          : null,
    };
  } catch (error) {
    console.error("Unable to load your saved Ishvasya shopping bag.", error);
    return { cart: [], wishlist: [], coupon: "", account: null };
  }
}

const savedState = readSavedState();
const state = {
  cart: savedState.cart,
  wishlist: [...new Set(savedState.wishlist)],
  coupon: savedState.coupon,
  account: savedState.account,
  category: "All",
  query: "",
  sort: "featured",
  wishlistOnly: false,
  detailQuantity: 1,
  lastFocusedElement: null,
};

const elements = {
  grid: document.getElementById("product-grid"),
  search: document.getElementById("site-search"),
  sort: document.getElementById("sort-select"),
  resultsNote: document.getElementById("results-note"),
  noResults: document.getElementById("no-results"),
  filterButtons: [...document.querySelectorAll(".filter-chip")],
  cartCount: document.getElementById("cart-count"),
  wishlistCount: document.getElementById("wishlist-count"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartOverlay: document.getElementById("drawer-overlay"),
  cartItems: document.getElementById("cart-items"),
  emptyCart: document.getElementById("empty-cart"),
  cartSummary: document.getElementById("cart-summary"),
  drawerCount: document.getElementById("drawer-item-count"),
  shippingProgress: document.getElementById("shipping-progress"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartTotal: document.getElementById("cart-total"),
  discountRow: document.getElementById("discount-row"),
  discountAmount: document.getElementById("discount-amount"),
  mobileCart: document.getElementById("mobile-cart-pill"),
  mobileCartCount: document.getElementById("mobile-cart-count"),
  mobileCartTotal: document.getElementById("mobile-cart-total"),
  productDialog: document.getElementById("product-dialog"),
  productDialogContent: document.getElementById("product-dialog-content"),
  checkoutDialog: document.getElementById("checkout-dialog"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutSummaryItems: document.getElementById("checkout-summary-items"),
  checkoutTotal: document.getElementById("checkout-total"),
  accountDialog: document.getElementById("account-dialog"),
  accountForm: document.getElementById("account-form"),
  accountMessage: document.getElementById("account-message"),
  successDialog: document.getElementById("success-dialog"),
  toast: document.getElementById("toast-message"),
};

let toastTimeout;

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        cart: state.cart,
        wishlist: state.wishlist,
        coupon: state.coupon,
        account: state.account,
      }),
    );
  } catch (error) {
    console.error("Unable to save your Ishvasya shopping bag.", error);
    showToast("Your browser could not save your changes. Please check your storage settings.");
  }
}

function cartQuantity() {
  return state.cart.reduce((total, item) => total + item.quantity, 0);
}

function cartSubtotal() {
  return state.cart.reduce(
    (total, item) => total + productById(item.id).price * item.quantity,
    0,
  );
}

function discountValue() {
  const subtotal = cartSubtotal();
  if (!state.coupon || subtotal === 0) return 0;
  return state.coupon === "HERITAGE10"
    ? Math.min(Math.round(subtotal * 0.1), 500)
    : Math.round(subtotal * 0.05);
}

function shippingCost() {
  return cartSubtotal() === 0 || cartSubtotal() - discountValue() >= 2999 ? 0 : 149;
}

function orderTotal() {
  return Math.max(0, cartSubtotal() - discountValue()) + shippingCost();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2800);
}

function renderProducts() {
  let products = PRODUCTS.filter((product) => {
    const matchesCategory = state.category === "All" || product.category === state.category;
    const matchesWishlist = !state.wishlistOnly || state.wishlist.includes(product.id);
    const searchText = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && matchesWishlist && searchText.includes(state.query);
  });

  if (state.sort === "price-low") products.sort((a, b) => a.price - b.price);
  if (state.sort === "price-high") products.sort((a, b) => b.price - a.price);
  if (state.sort === "name") products.sort((a, b) => a.name.localeCompare(b.name));

  elements.filterButtons.forEach((button) => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  elements.noResults.hidden = products.length > 0;
  elements.grid.hidden = products.length === 0;
  elements.resultsNote.textContent =
    state.query || state.category !== "All" || state.wishlistOnly
      ? `${products.length} ${products.length === 1 ? "piece" : "pieces"}${state.wishlistOnly ? " in your wishlist" : ""}${state.query ? ` matching “${state.query}”` : ""}`
      : "";

  elements.grid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image-wrap">
            <img class="product-image" src="${product.image}" alt="${escapeHtml(product.alt)}" loading="lazy" />
            <span class="product-badge">${escapeHtml(product.badge)}</span>
            <button class="wishlist-toggle" type="button" data-wishlist="${product.id}" aria-label="${state.wishlist.includes(product.id) ? "Remove " + escapeHtml(product.name) + " from wishlist" : "Add " + escapeHtml(product.name) + " to wishlist"}" aria-pressed="${state.wishlist.includes(product.id)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 8.6c0 5.1-8.2 10.1-8.2 10.1S3.8 13.7 3.8 8.6a4.3 4.3 0 0 1 8.2-1.8 4.3 4.3 0 0 1 8.2 1.8Z" /></svg>
            </button>
            <button class="product-image-button" type="button" data-quick-view="${product.id}" aria-label="View ${escapeHtml(product.name)} details"><span class="product-quick-view"><span>Take a closer look&nbsp; ↗</span></span></button>
          </div>
          <div class="product-info">
            <div class="product-meta"><span>${escapeHtml(product.category)}</span><span class="product-rating" aria-label="Rated 5 out of 5">${product.rating}</span></div>
            <button class="product-title" type="button" data-quick-view="${product.id}">${escapeHtml(product.name)}</button>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <div class="product-card-bottom">
              <span class="product-price">${formatRupees(product.price)}${product.compareAt ? `<span class="product-price-old">${formatRupees(product.compareAt)}</span>` : ""}</span>
              <button class="quick-add" type="button" data-add-cart="${product.id}" aria-label="Add ${escapeHtml(product.name)} to your bag"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1.2 12H3.8L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg> Add</button>
            </div>
          </div>
        </article>`,
    )
    .join("");
}

function renderCart() {
  const count = cartQuantity();
  const subtotal = cartSubtotal();
  const total = orderTotal();

  elements.cartCount.textContent = String(count);
  elements.cartCount.hidden = count === 0;
  elements.drawerCount.textContent = `(${count})`;
  elements.cartSubtotal.textContent = formatRupees(subtotal);
  elements.cartTotal.textContent = formatRupees(total);
  document.getElementById("coupon-code").value = state.coupon;
  elements.discountRow.hidden = !state.coupon || subtotal === 0;
  elements.discountAmount.textContent = `−${formatRupees(discountValue())}`;

  if (subtotal === 0) {
    elements.shippingProgress.innerHTML =
      "A little something handmade is waiting for you.<div class=\"progress-track\"><span style=\"width:0%\"></span></div>";
  } else if (subtotal - discountValue() >= 2999) {
    elements.shippingProgress.innerHTML =
      "<strong>Lovely — your delivery is on us.</strong><div class=\"progress-track\"><span style=\"width:100%\"></span></div>";
  } else {
    const remaining = Math.max(0, 2999 - (subtotal - discountValue()));
    const progress = Math.min(100, Math.round(((subtotal - discountValue()) / 2999) * 100));
    elements.shippingProgress.innerHTML =
      `<strong>Add ${formatRupees(remaining)} more</strong> for complimentary shipping.<div class="progress-track"><span style="width:${progress}%"></span></div>`;
  }

  elements.cartItems.innerHTML = state.cart
    .map((item) => {
      const product = productById(item.id);
      return `
        <article class="cart-line">
          <img src="${product.image}" alt="${escapeHtml(product.alt)}" />
          <div class="cart-line-copy">
            <span class="cart-category">${escapeHtml(product.category)}</span>
            <strong>${escapeHtml(product.name)}</strong>
            <span>${formatRupees(product.price)}</span>
            <div class="quantity-controls" aria-label="Quantity">
              <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Remove one ${escapeHtml(product.name)}">−</button>
              <output aria-label="Quantity">${item.quantity}</output>
              <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Add one ${escapeHtml(product.name)}">+</button>
            </div>
          </div>
          <div class="cart-line-actions"><strong>${formatRupees(product.price * item.quantity)}</strong><button class="remove-item" type="button" data-remove-cart="${product.id}">Remove</button></div>
        </article>`;
    })
    .join("");

  const isEmpty = count === 0;
  elements.cartItems.hidden = isEmpty;
  elements.emptyCart.hidden = !isEmpty;
  elements.cartSummary.hidden = isEmpty;
  elements.mobileCart.hidden = isEmpty;
  elements.mobileCartCount.textContent = String(count);
  elements.mobileCartTotal.textContent = formatRupees(total);
  saveState();
}

function renderWishlistCount() {
  elements.wishlistCount.textContent = String(state.wishlist.length);
  elements.wishlistCount.hidden = state.wishlist.length === 0;
  const wishlistButton = document.getElementById("wishlist-filter");
  wishlistButton.setAttribute("aria-pressed", String(state.wishlistOnly));
  wishlistButton.setAttribute(
    "aria-label",
    state.wishlistOnly ? "Show the whole collection" : "Show your wishlist",
  );
}

function addToCart(id, quantity = 1) {
  const product = productById(id);
  if (!product || !Number.isSafeInteger(quantity) || quantity < 1) {
    console.error("Refusing to add an invalid item to the shopping bag.", { id, quantity });
    showToast("This piece could not be added. Please try again.");
    return;
  }
  const existing = state.cart.find((item) => item.id === id);
  if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
  else state.cart.push({ id, quantity: Math.min(99, quantity) });
  state.coupon = state.coupon && state.cart.length ? state.coupon : "";
  renderCart();
  showToast(`${product.name} is in your bag.`);
}

function showCart() {
  elements.cartOverlay.hidden = false;
  elements.cartDrawer.inert = false;
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => elements.cartDrawer.classList.add("is-open"));
  document.getElementById("cart-open").setAttribute("aria-expanded", "true");
  elements.cartDrawer.querySelector("[data-close-panel]").focus();
}

function hideCart(returnFocus = true) {
  elements.cartDrawer.classList.remove("is-open");
  elements.cartDrawer.inert = true;
  elements.cartDrawer.setAttribute("aria-hidden", "true");
  elements.cartOverlay.hidden = true;
  document.getElementById("cart-open").setAttribute("aria-expanded", "false");
  if (returnFocus) document.getElementById("cart-open").focus();
}

function showProduct(id) {
  const product = productById(id);
  if (!product) return;
  state.detailQuantity = 1;
  elements.productDialogContent.innerHTML = `
    <div class="product-detail-layout">
      <div class="product-detail-photo"><img src="${product.image}" alt="${escapeHtml(product.alt)}" /></div>
      <div class="product-detail-copy">
        <span class="eyebrow"><span class="eyebrow-rule"></span> ${escapeHtml(product.category.toUpperCase())}</span>
        <h2 id="product-dialog-title">${escapeHtml(product.name)}</h2>
        <div class="product-detail-price">${formatRupees(product.price)}${product.compareAt ? `<span class="product-price-old">${formatRupees(product.compareAt)}</span>` : ""}</div>
        <p>${escapeHtml(product.detail)}</p>
        <ul><li>Thoughtfully hand-finished in brass</li><li>Packed with care in Alibag, Maharashtra</li><li>Complimentary shipping on orders of ₹2,999+</li></ul>
        <div class="product-detail-actions">
          <div class="quantity-picker"><button type="button" data-detail-quantity="-1" aria-label="Remove one">−</button><output id="detail-quantity">1</output><button type="button" data-detail-quantity="1" aria-label="Add one">+</button></div>
          <button class="button button-dark" type="button" data-detail-add="${product.id}">Add to your bag · ${formatRupees(product.price)}</button>
        </div>
      </div>
    </div>`;
  elements.productDialog.showModal();
  elements.productDialog.querySelector(".dialog-close").focus();
}

function openCheckout() {
  if (!state.cart.length) return;
  if (state.account) {
    elements.checkoutForm.elements.name.value = state.account.name;
    elements.checkoutForm.elements.email.value = state.account.email;
  }
  elements.checkoutSummaryItems.innerHTML = state.cart
    .map((item) => {
      const product = productById(item.id);
      return `<div class="checkout-order-line"><span>${escapeHtml(product.name)} × ${item.quantity}</span><strong>${formatRupees(product.price * item.quantity)}</strong></div>`;
    })
    .join("");
  elements.checkoutTotal.textContent = formatRupees(orderTotal());
  elements.checkoutDialog.showModal();
  elements.checkoutDialog.querySelector("input[name=name]").focus();
}

document.getElementById("category-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  state.wishlistOnly = false;
  renderProducts();
});

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
});

elements.search.addEventListener("input", () => {
  state.query = elements.search.value.trim().toLowerCase();
  state.wishlistOnly = false;
  renderProducts();
});

elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    elements.search.value = "";
    state.query = "";
    renderProducts();
    elements.search.blur();
  }
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    elements.search.focus();
  }
  if (event.key === "Escape" && elements.cartDrawer.classList.contains("is-open")) {
    hideCart();
  }
});

elements.sort.addEventListener("change", () => {
  state.sort = elements.sort.value;
  renderProducts();
});

elements.grid.addEventListener("click", (event) => {
  const wishlistButton = event.target.closest("[data-wishlist]");
  if (wishlistButton) {
    const { wishlist } = state;
    const index = wishlist.indexOf(wishlistButton.dataset.wishlist);
    if (index >= 0) wishlist.splice(index, 1);
    else wishlist.push(wishlistButton.dataset.wishlist);
    saveState();
    renderWishlistCount();
    renderProducts();
    showToast(index >= 0 ? "Removed from your wishlist." : "Saved to your wishlist.");
    return;
  }

  const addButton = event.target.closest("[data-add-cart]");
  if (addButton) {
    addToCart(addButton.dataset.addCart);
    return;
  }
  const quickViewButton = event.target.closest("[data-quick-view]");
  if (quickViewButton) showProduct(quickViewButton.dataset.quickView);
});

document.getElementById("clear-filters").addEventListener("click", () => {
  state.category = "All";
  state.query = "";
  state.wishlistOnly = false;
  elements.search.value = "";
  elements.sort.value = "featured";
  state.sort = "featured";
  renderProducts();
});

document.getElementById("wishlist-filter").addEventListener("click", () => {
  state.wishlistOnly = !state.wishlistOnly;
  state.category = "All";
  renderWishlistCount();
  renderProducts();
  document.getElementById("collection").scrollIntoView({ behavior: "smooth" });
  if (state.wishlistOnly && !state.wishlist.length) {
    showToast("Your wishlist is a blank canvas. Save a piece you love.");
  }
});

document.getElementById("cart-open").addEventListener("click", showCart);
elements.mobileCart.addEventListener("click", showCart);
document.querySelectorAll("[data-close-panel]").forEach((button) =>
  button.addEventListener("click", () => hideCart()),
);
elements.cartOverlay.addEventListener("click", () => hideCart());

elements.cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    const item = state.cart.find((entry) => entry.id === quantityButton.dataset.quantity);
    if (!item) return;
    const change = Number(quantityButton.dataset.change);
    item.quantity += change;
    if (item.quantity < 1) {
      state.cart = state.cart.filter((entry) => entry.id !== item.id);
      if (state.cart.length === 0) state.coupon = "";
    }
    if (item.quantity > 99) item.quantity = 99;
    renderCart();
    return;
  }
  const removeButton = event.target.closest("[data-remove-cart]");
  if (removeButton) {
    state.cart = state.cart.filter((item) => item.id !== removeButton.dataset.removeCart);
    if (!state.cart.length) state.coupon = "";
    renderCart();
    showToast("The piece has been removed from your bag.");
  }
});

document.getElementById("coupon-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("coupon-code");
  const message = document.getElementById("coupon-message");
  const code = input.value.trim().toUpperCase();

  if (code === "HERITAGE10" || code === "WELCOME5") {
    if (!state.cart.length) {
      message.textContent = "Add a piece to your bag before applying a discount.";
      return;
    }
    state.coupon = code;
    message.textContent = code === "HERITAGE10" ? "10% off (up to ₹500) — a little gift from us." : "Your 5% welcome discount is on its way.";
    renderCart();
    return;
  }
  state.coupon = "";
  message.textContent = "That code didn't quite work. Try HERITAGE10 or WELCOME5.";
  renderCart();
});

elements.productDialogContent.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-detail-quantity]");
  if (quantityButton) {
    state.detailQuantity = Math.min(99, Math.max(1, state.detailQuantity + Number(quantityButton.dataset.detailQuantity)));
    document.getElementById("detail-quantity").textContent = String(state.detailQuantity);
    return;
  }
  const addButton = event.target.closest("[data-detail-add]");
  if (addButton) {
    addToCart(addButton.dataset.detailAdd, state.detailQuantity);
    elements.productDialog.close();
    showCart();
  }
});

document.getElementById("checkout-open").addEventListener("click", () => {
  hideCart(false);
  openCheckout();
});

elements.checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.checkoutForm.reportValidity() || !state.cart.length) return;

  const formData = new FormData(elements.checkoutForm);
  const customerName = String(formData.get("name") || "").trim().split(/\s+/)[0] || "friend";
  const orderReference = `ISH-${Date.now().toString(36).toUpperCase()}`;

  state.cart = [];
  state.coupon = "";
  renderCart();
  elements.checkoutDialog.close();
  document.getElementById("success-name").textContent = customerName;
  document.getElementById("success-message").textContent =
    `Your sample order ${orderReference} has been noted for this demo. No payment was taken and no order was sent. Thank you for visiting our little corner of Alibag.`;
  elements.successDialog.showModal();
});

document.getElementById("success-dismiss").addEventListener("click", () => {
  elements.successDialog.close();
  document.getElementById("collection").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("account-open").addEventListener("click", () => {
  if (state.account) {
    elements.accountForm.elements.name.value = state.account.name;
    elements.accountForm.elements.email.value = state.account.email;
    elements.accountMessage.textContent = `A warmer welcome next time, ${state.account.name}. Your details are saved only on this device.`;
  } else {
    elements.accountForm.reset();
    elements.accountMessage.textContent = "Save your name on this device for a more personal visit.";
  }
  elements.accountDialog.showModal();
  elements.accountDialog.querySelector("input[name=name]").focus();
});

elements.accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!elements.accountForm.reportValidity()) return;
  const formData = new FormData(elements.accountForm);
  state.account = {
    name: String(formData.get("name")).trim(),
    email: String(formData.get("email")).trim(),
  };
  saveState();
  elements.accountDialog.close();
  showToast(`Lovely to have you here, ${state.account.name}.`);
});

document.getElementById("newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const message = document.getElementById("newsletter-message");
  message.textContent = "Thank you! Your details stay in this demo — nothing has been sent.";
  form.reset();
});

document.querySelectorAll(".main-navigation [data-nav-category], .footer-links [data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    state.category = link.dataset.navCategory;
    state.wishlistOnly = false;
    renderProducts();
    document.getElementById("mobile-menu-toggle").setAttribute("aria-expanded", "false");
    document.getElementById("main-navigation").classList.remove("is-open");
  });
});

const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
mobileMenuToggle.addEventListener("click", () => {
  const navigation = document.getElementById("main-navigation");
  const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
  mobileMenuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navigation.classList.toggle("is-open", !isExpanded);
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

for (const dialog of [
  elements.productDialog,
  elements.checkoutDialog,
  elements.accountDialog,
  elements.successDialog,
]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

document.getElementById("current-year").textContent = String(new Date().getFullYear());
renderProducts();
renderCart();
renderWishlistCount();
