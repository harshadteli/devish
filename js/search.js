// Search functionality
const SearchSystem = {
    // Search products
    searchProducts(query) {
        if (!query || query.trim().length < 2) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const data = window.products || products;

        return data.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.cas.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                categories[product.category].toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        });
    },

    // Initialize search bar
    initSearchBar() {
        const searchInput = document.querySelector('.search-input');
        const searchIcon = document.querySelector('.search-icon');

        if (!searchInput) return;

        // Create search results dropdown
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'search-results';
        resultsDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            max-height: 400px;
            overflow-y: auto;
            display: none;
            z-index: 1000;
            margin-top: 0.5rem;
        `;

        const searchBar = searchInput.closest('.search-bar');
        if (searchBar) {
            searchBar.style.position = 'relative';
            searchBar.appendChild(resultsDiv);
        }

        // Search on input
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            if (query.length < 2) {
                resultsDiv.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(() => {
                const results = this.searchProducts(query);
                this.displayResults(results, resultsDiv, query);
            }, 300);
        });

        // Search on icon click
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                const query = searchInput.value;
                if (query.trim()) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }

        // Search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                if (query.trim()) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target)) {
                resultsDiv.style.display = 'none';
            }
        });
    },

    // Display search results
    displayResults(results, container, query) {
        if (results.length === 0) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--text-dim);">
                    No products found for "${query}"
                </div>
            `;
            container.style.display = 'block';
            return;
        }

        container.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 0.85rem; color: var(--text-dim);">Found ${results.length} result${results.length > 1 ? 's' : ''}</div>
            </div>
            ${results.slice(0, 5).map(product => `
                <a href="product-detail.html?id=${product.id}" style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid #f1f5f9; text-decoration: none; color: inherit; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                    <div style="width: 60px; height: 60px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i data-lucide="flask-conical" size="24" style="color: #94a3b8"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-light); margin-bottom: 0.25rem;">${product.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-dim);">CAS: ${product.cas} • ${categories[product.category]}</div>
                    </div>
                </a>
            `).join('')}
            ${results.length > 5 ? `
                <a href="products.html?search=${encodeURIComponent(query)}" style="display: block; padding: 1rem; text-align: center; color: var(--primary); font-weight: 600; text-decoration: none;">
                    View all ${results.length} results →
                </a>
            ` : ''}
        `;

        container.style.display = 'block';
        if (window.lucide) lucide.createIcons();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof products !== 'undefined') {
        SearchSystem.initSearchBar();
    }
});
