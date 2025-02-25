// Sample product data with updated Unsplash image URLs
const products = [
    { id: 1, name: "T-Shirt", price: 20, description: "Comfortable cotton t-shirt", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2070&auto=format&fit=crop", category: "clothing", rating: 4.5, stock: 10, delivery: "3-5 days" },
    { id: 2, name: "Jeans", price: 50, description: "Stylish denim jeans", image: "https://images.unsplash.com/photo-1602293589930-45aad5ba9ef2?q=80&w=2070&auto=format&fit=crop", category: "clothing", rating: 4.8, stock: 5, delivery: "2-4 days" },
    { id: 3, name: "Sneakers", price: 80, description: "Trendy running shoes", image: "https://images.unsplash.com/photo-1600185365926-0909a12f2e2e?q=80&w=2070&auto=format&fit=crop", category: "footwear", rating: 4.7, stock: 8, delivery: "3-5 days" },
    { id: 4, name: "Jacket", price: 70, description: "Warm winter jacket", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2070&auto=format&fit=crop", category: "clothing", rating: 4.6, stock: 3, delivery: "5-7 days" },
    { id: 5, name: "Watch", price: 120, description: "Elegant wristwatch", image: "https://images.unsplash.com/photo-1524592094714-0f25a6143e2e?q=80&w=2070&auto=format&fit=crop", category: "accessories", rating: 4.9, stock: 15, delivery: "2-3 days" },
    { id: 6, name: "Cap", price: 15, description: "Cool baseball cap", image: "https://images.unsplash.com/photo-1576871337622-009e162ac7cc?q=80&w=2070&auto=format&fit=crop", category: "accessories", rating: 4.3, stock: 20, delivery: "3-5 days" },
];

let cart = [];
let wishlist = [];
let currentSlide = 0;
let currentPage = 1;
const itemsPerPage = 4;
let isSignedIn = false;
const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

// Slider functions
function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        slide.style.transform = i === index ? "translateX(0)" : "translateX(100%)";
    });
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

function goToSlide(index) {
    currentSlide = index;
    showSlide(currentSlide);
}

setInterval(nextSlide, 5000);

// Load products with pagination
function loadProducts(filter = "all", search = "", sort = "default", target = "product-list", page = currentPage) {
    const productList = document.getElementById(target);
    productList.innerHTML = "";
    showLoadingSpinner(true);

    let filteredProducts = products.filter(product => 
        (filter === "all" || product.category === filter) &&
        (product.name.toLowerCase().includes(search.toLowerCase()) || product.description.toLowerCase().includes(search.toLowerCase()))
    );

    const priceFilter = document.getElementById("price-filter").value;
    if (priceFilter !== "all") {
        const [min, max] = priceFilter.split("-").map(Number);
        filteredProducts = filteredProducts.filter(product => 
            (max ? product.price >= min && product.price <= max : product.price >= min)
        );
    }

    if (sort === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") filteredProducts.sort((a, b) => b.price - a.price);
    else if (sort === "rating") filteredProducts.sort((a, b) => b.rating - a.rating);

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    paginatedProducts.forEach(product => {
        const stockStatus = product.stock > 0 ? `In Stock (${product.stock} left)` : "Out of Stock";
        const inWishlist = wishlist.includes(product.id) ? "fas" : "far";
        const productCard = `
            <div class="bg-white p-6 rounded-lg shadow-lg product-card">
                <img src="${product.image}" alt="${product.name}" class="w-full h-52 object-cover rounded-md mb-4">
                <h3 class="text-xl font-semibold text-gray-800">${product.name}</h3>
                <p class="text-gray-600 text-sm mt-1">${product.description}</p>
                <div class="flex items-center mt-2">
                    <span class="text-yellow-400">★</span>
                    <span class="ml-1 text-gray-700">${product.rating} / 5</span>
                </div>
                <p class="text-gray-800 font-bold mt-2 text-xl">$${product.price}</p>
                <p class="text-gray-600 text-sm mt-1">${stockStatus}</p>
                <p class="text-gray-600 text-sm">Delivery: ${product.delivery}</p>
                <div class="flex gap-2 mt-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex-1" 
                            onclick="addToCart(${product.id})" ${product.stock === 0 ? "disabled" : ""}>Add to Cart</button>
                    <button class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex-1">Quick View</button>
                    <button class="bg-transparent text-gray-600 px-2 py-2 rounded-lg hover:text-red-500" 
                            onclick="toggleWishlist(${product.id})"><i class="${inWishlist} fa-heart"></i></button>
                </div>
            </div>
        `;
        productList.innerHTML += productCard;
    });

    document.getElementById("page-number").textContent = page;
    setTimeout(() => showLoadingSpinner(false), 500); // Simulate loading
}

// Filter by category
function filterByCategory(category) {
    const search = document.getElementById("search-bar").value;
    const sort = document.getElementById("sort-products").value;
    currentPage = 1;
    loadProducts(category, search, sort);
    toggleMobileDropdown();
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
}

// Toggle wishlist
function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    if (index === -1) {
        wishlist.push(productId);
    } else {
        wishlist.splice(index, 1);
    }
    loadProducts();
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity = Math.max(1, cartItem.quantity + change);
        updateCart();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Apply coupon
function applyCoupon() {
    const code = document.getElementById("coupon-code").value;
    if (code === "SAVE10") {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountedTotal = total * 0.9;
        document.getElementById("cart-total").textContent = discountedTotal.toFixed(2);
        alert("Coupon applied! 10% discount.");
    } else {
        alert("Invalid coupon code.");
    }
}

// Update cart display
function updateCart() {
    const cartCount = document.getElementById("cart-count");
    const cartLink = document.getElementById("cart-link");
    const cartSection = document.getElementById("cart-section");
    const cartItems = document.getElementById("cart-items");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartTax = document.getElementById("cart-tax");
    const cartTotal = document.getElementById("cart-total");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems; // Update the visible cart count
    cartLink.setAttribute("data-count", totalItems); // Update the badge
    
    if (cart.length > 0) {
        cartSection.classList.remove("hidden");
        cartItems.innerHTML = "";
        cart.forEach(item => {
            cartItems.innerHTML += `
                <div class="flex justify-between items-center bg-white p-6 rounded-lg shadow-lg">
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
                        <div>
                            <span class="text-gray-800 font-semibold">${item.name}</span>
                            <p class="text-gray-600 text-sm">$${item.price} each</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <button class="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                        </div>
                        <span class="text-gray-800 font-bold">$${item.price * item.quantity}</span>
                        <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" 
                                onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `;
        });
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        cartSubtotal.textContent = subtotal.toFixed(2);
        cartTax.textContent = tax.toFixed(2);
        cartTotal.textContent = total.toFixed(2);
    } else {
        cartSection.classList.add("hidden");
    }
}

// Toggle mobile dropdown
function toggleMobileDropdown() {
    const dropdown = document.getElementById("mobile-category-dropdown");
    dropdown.classList.toggle("active");
}

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenu.classList.toggle("active");
}

// Show/Hide Checkout Modal
function showCheckout() {
    if (!isSignedIn) {
        alert("Please sign in to proceed with checkout.");
        showLoginModal();
        return;
    }
    document.getElementById("checkout-modal").classList.remove("hidden");
}

function hideCheckout() {
    document.getElementById("checkout-modal").classList.add("hidden");
}

// Show/Hide Loading Spinner
function showLoadingSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.classList.toggle("active", show);
}

// Show/Hide Login Modal
function showLoginModal() {
    document.getElementById("login-modal").classList.remove("hidden");
}

function hideLoginModal() {
    document.getElementById("login-modal").classList.add("hidden");
}

// Login function
function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    if (username === "user" && password === "pass123") {
        isSignedIn = true;
        document.getElementById("sign-in-link").textContent = "Sign Out";
        hideLoginModal();
        alert("Successfully signed in!");
    } else {
        alert("Invalid username or password. Try 'user' and 'pass123'.");
    }
}

// Toggle Sign In/Out
function toggleSignIn(event) {
    event.preventDefault();
    if (isSignedIn) {
        isSignedIn = false;
        document.getElementById("sign-in-link").textContent = "Sign In";
        alert("Signed out!");
    } else {
        showLoginModal();
    }
}

// Change page for pagination
function changePage(change) {
    currentPage = Math.max(1, currentPage + change);
    const search = document.getElementById("search-bar").value;
    const sort = document.getElementById("sort-products").value;
    loadProducts("all", search, sort, "product-list", currentPage);
}

// Search suggestions
function updateSearchSuggestions() {
    const search = document.getElementById("search-bar").value.toLowerCase();
    const suggestions = document.getElementById("search-suggestions");
    suggestions.innerHTML = "";
    if (search) {
        const matches = products.filter(p => p.name.toLowerCase().includes(search)).slice(0, 5);
        matches.forEach(product => {
            suggestions.innerHTML += `<div onclick="document.getElementById('search-bar').value='${product.name}'; loadProducts();">${product.name}</div>`;
        });
        suggestions.classList.add("active");
    } else {
        suggestions.classList.remove("active");
    }
}

// Close dropdown when clicking outside
function closeDropdown(event) {
    const mobileDropdown = document.getElementById("mobile-category-dropdown");
    const mobileButton = document.getElementById("mobile-category-btn");
    
    if (!mobileDropdown.contains(event.target) && !mobileButton.contains(event.target)) {
        mobileDropdown.classList.remove("active");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    loadProducts("all", "", "default", "product-list");
    loadProducts("all", "", "rating", "bestseller-list");
    showSlide(currentSlide);

    document.getElementById("mobile-category-btn").addEventListener("click", (e) => {
        e.preventDefault();
        toggleMobileDropdown();
    });

    document.getElementById("mobile-toggle").addEventListener("click", toggleMobileMenu);

    document.addEventListener("click", closeDropdown);

    document.getElementById("search-bar").addEventListener("input", (e) => {
        updateSearchSuggestions();
        const sort = document.getElementById("sort-products").value;
        loadProducts("all", e.target.value, sort);
    });

    document.getElementById("sort-products").addEventListener("change", (e) => {
        const search = document.getElementById("search-bar").value;
        loadProducts("all", search, e.target.value);
    });

    document.getElementById("price-filter").addEventListener("change", (e) => {
        const search = document.getElementById("search-bar").value;
        const sort = document.getElementById("sort-products").value;
        loadProducts("all", search, sort);
    });
});