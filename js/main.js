// Navigation Scroll Effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else if (navbar) {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Logic
const menuToggle = document.getElementById('menuToggle');
const body = document.body;

// Create Mobile Elements dynamically if not in HTML
if (!document.querySelector('.mobile-menu')) {
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';

    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';

    body.appendChild(overlay);
    body.appendChild(mobileMenu);

    // Function to update mobile menu content based on auth state
    function updateMobileMenu() {
        const user = AuthSystem ? AuthSystem.getCurrentUser() : null;

        let userSection = '';
        if (user) {
            userSection = `
                <div style="background: rgba(37, 99, 235, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <i data-lucide="user" size="20" style="color: var(--primary);"></i>
                        <span style="font-weight: 600; color: var(--text-light);">${user.name}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-dim);">${user.email}</div>
                </div>
            `;
        }

        mobileMenu.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                <span style="font-weight:700; font-size:1.2rem;">Menu</span>
                <i data-lucide="x" id="closeMenu" style="cursor:pointer; color: var(--text-light);"></i>
            </div>
            ${userSection}
            <a href="index.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                <i data-lucide="home" size="18" style="margin-right: 8px;"></i> Home
            </a>
            <a href="products.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                <i data-lucide="package" size="18" style="margin-right: 8px;"></i> All Products
            </a>
            <a href="profile.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                <i data-lucide="building" size="18" style="margin-right: 8px;"></i> Company Profile
            </a>
            <a href="about.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                <i data-lucide="user-check" size="18" style="margin-right: 8px;"></i> About Developer
            </a>
            <a href="contact.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 1rem;">
                <i data-lucide="mail" size="18" style="margin-right: 8px;"></i> Contact
            </a>
            <hr style="border:0; border-top:1px solid #eee; margin: 1rem 0;">
            ${user ? `
                <a href="ai-assistant.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--primary); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem; font-weight: 600;">
                    <i data-lucide="bot" size="18" style="margin-right: 8px;"></i> AI Assistant
                </a>
                <a href="my-orders.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                    <i data-lucide="package" size="18" style="margin-right: 8px;"></i> My Orders
                </a>
                <a href="cart.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--text-light); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem;">
                    <i data-lucide="shopping-cart" size="18" style="margin-right: 8px;"></i> My Cart
                </a>
                <a href="#" id="mobile-logout" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: #dc2626; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    <i data-lucide="log-out" size="18" style="margin-right: 8px;"></i> Logout
                </a>
            ` : `
                <a href="#" id="mobile-ai-chat" class="nav-link-mobile" style="display: block; padding: 0.8rem; color: var(--primary); text-decoration: none; border-radius: 8px; margin-bottom: 0.5rem; font-weight: 600;">
                    <i data-lucide="bot" size="18" style="margin-right: 8px;"></i> AI Assistant
                </a>
                <a href="login.html" class="nav-link-mobile" style="display: block; padding: 0.8rem; background: var(--primary); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600;">
                    <i data-lucide="log-in" size="18" style="margin-right: 8px;"></i> Login
                </a>
            `}
        `;

        if (window.lucide) lucide.createIcons();

        // Re-attach event listeners after updating content
        const closeBtn = mobileMenu.querySelector('#closeMenu');
        if (closeBtn) {
            closeBtn.addEventListener('click', toggleMenu);

            const logoutBtn = mobileMenu.querySelector('#mobile-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Are you sure you want to logout?')) {
                        AuthSystem.logout();
                    }
                });
            }

            const aiChatBtn = mobileMenu.querySelector('#mobile-ai-chat');
            // AI Assistant now points directly to ai-assistant.html via href

        }
    }

    // Logic
    function toggleMenu() {
        const isActive = mobileMenu.classList.contains('active');

        if (isActive) {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            updateMobileMenu(); // Update content before showing
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
        }
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Initial render
    updateMobileMenu();

    // Listen for auth state changes and update menu
    window.addEventListener('authStateChanged', updateMobileMenu);
}


// Global Navbar Logic
document.addEventListener('DOMContentLoaded', () => {
    // 1. Active Link Highlighting
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.cat-link, .nav-link-mobile');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. Auth-based Visibility for Desktop Nav
    function updateNavbarVisibility() {
        const user = typeof AuthSystem !== 'undefined' ? AuthSystem.getCurrentUser() : null;
        const guestHideElements = document.querySelectorAll('.guest-hide');
        const adminOnlyElements = document.querySelectorAll('.admin-only');

        guestHideElements.forEach(el => {
            el.style.display = user ? 'block' : 'none';
        });

        adminOnlyElements.forEach(el => {
            // Simplified admin check (can be expanded)
            const isAdmin = user && (user.role === 'admin' || user.email === 'admin@devish.com' || (typeof CONFIG !== 'undefined' && user.email === CONFIG.ADMIN_EMAIL));
            el.style.display = isAdmin ? 'flex' : 'none';
        });

        // Specific fix for action items that should be flex
        const myOrdersAction = document.getElementById('myOrdersLink');
        if (myOrdersAction) {
            myOrdersAction.style.display = user ? 'flex' : 'none';
        }
    }

    updateNavbarVisibility();
    window.addEventListener('authStateChanged', updateNavbarVisibility);

    // 3. Search Logic
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = input.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    });

    // 4. Welcome Modal Logic (First Time Login Only)
    const showWelcome = localStorage.getItem('devish_is_first_login') === 'true';
    const user = typeof AuthSystem !== 'undefined' ? AuthSystem.getCurrentUser() : null;
    const welcomeModal = document.getElementById('welcomeModal');

    if (showWelcome && user && welcomeModal) {
        // Only show on home page or if specifically triggered
        const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        if (isHomePage) {
            setTimeout(() => {
                welcomeModal.style.display = 'flex';
                localStorage.removeItem('devish_is_first_login');
            }, 1000);
        }
    }
});

// Mock Data Loader (Frontend Logic)
document.addEventListener('DOMContentLoaded', async () => {
    const featuredGrid = document.getElementById('featured-grid');
    if (featuredGrid) {
        // Show Spinner
        featuredGrid.innerHTML = `
            <div class="spinner-container">
                <div class="loading-spinner"></div>
                <p style="margin-top: 1rem; font-weight: 500; color: var(--text-dim);">Loading Featured Products...</p>
            </div>
        `;

        // Fetch Live Products from Database
        let dbProducts = [];
        try {
            dbProducts = await ApiClient.getProducts();
            window.products = dbProducts; // Sync live data globally
        } catch (e) {
            console.warn("API fetch failed, using static data", e);
            dbProducts = typeof products !== 'undefined' ? products : [];
        }

        const featured = dbProducts.slice(0, 4); // Just take first 4 for now

        featuredGrid.innerHTML = featured.map(product => {
            const categoriesObj = (typeof categories !== 'undefined') ? categories : {};
            const catDisplay = categoriesObj[product.category] || product.category;
            const casDisplay = product.cas || product.cas_number || 'N/A';
            const priceDisplay = product.price || 99.99;

            return `
            <div class="glass" style="padding: 1.5rem; border-radius: 12px; transition: transform 0.3s;">
                <div style="background: rgba(255,255,255,0.05); height: 180px; border-radius: 8px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${product.image ?
                    `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="max-width: 80%; max-height: 80%; object-fit: contain;">
                         <i data-lucide="flask-conical" size="48" style="color: #94a3b8; display: none;"></i>`
                    :
                    `<i data-lucide="flask-conical" size="48" style="color: #94a3b8"></i>`
                }
                </div>
                <div style="margin-bottom: 0.5rem; color: var(--primary); font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                    ${catDisplay}
                </div>
                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${product.name}</h3>
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-dim); margin-bottom: 1.5rem;">
                    <span>CAS: ${casDisplay}</span>
                    <span>${product.purity || ''}</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="product-detail.html?id=${product.id}" class="btn glass" style="flex: 1; text-align: center; padding: 0.6rem; font-size: 0.9rem;">View Details</a>
                    <button class="btn btn-primary" style="padding: 0.6rem 1rem;" onclick="CartSystem.addToCart({id:'${product.id}', name:'${product.name.replace(/'/g, "\\'")}', category:'${product.category}', cas:'${casDisplay}', price:${priceDisplay}, image:'${product.image}'})">
                        <i data-lucide="plus" size="16"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');

        // Re-initialize icons for dynamic content
        if (window.lucide) lucide.createIcons();
    }
});
