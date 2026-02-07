// Cart System (Frontend-only using localStorage)

const CartSystem = {
    // Get current user email for specific cart key
    getCartKey() {
        const user = AuthSystem.getCurrentUser();
        return user ? `devish_cart_${user.email}` : null;
    },

    // Get cart items
    getCart() {
        const key = this.getCartKey();
        if (!key) return [];
        const cartStr = localStorage.getItem(key);
        return cartStr ? JSON.parse(cartStr) : [];
    },

    // Save cart
    saveCart(cart) {
        const key = this.getCartKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(cart));
        }
        this.updateCartBadge();
    },

    // Add item to cart
    addToCart(product, quantity = 1, unit = 'kg') {
        // Check if user is logged in
        if (!AuthSystem.isLoggedIn()) {
            if (confirm('Please login to add items to cart. Go to login page?')) {
                window.location.href = 'login.html';
            }
            return { success: false, message: 'Login required' };
        }

        const cart = this.getCart();
        // Use loose comparison for ID to handle type mismatches (number vs string)
        const existingItem = cart.find(item => String(item.id) === String(product.id));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                category: product.category,
                cas: product.cas,
                price: product.price || 99.99, // Default price if not set
                unit: product.unit || unit,
                quantity: quantity,
                image: product.image
            });
        }

        this.saveCart(cart);
        return { success: true, message: 'Added to cart!' };
    },

    // Remove item from cart
    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => String(item.id) !== String(productId));
        this.saveCart(cart);
    },

    // Update quantity
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(i => String(i.id) === String(productId));

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    },

    // Get cart total
    getTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Get cart count
    getCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Clear cart
    clearCart() {
        const key = this.getCartKey();
        if (key) {
            localStorage.removeItem(key);
        }
        this.updateCartBadge();
    },

    // Update cart badge in navbar
    updateCartBadge() {
        const badges = document.querySelectorAll('.badge');
        const count = this.getCount();

        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
    CartSystem.updateCartBadge();
});
