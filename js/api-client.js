/**
 * API Client for Devish Ingredients
 * Handles communication with Google Apps Script Backend
 */

const ApiClient = {

    /**
     * Generic fetch wrapper
     */
    async call(action, data = {}, method = 'POST') {
        let url = `${CONFIG.API_URL}?action=${action}`;

        // Handle Mock Mode
        if (CONFIG.USE_MOCK_DATA) {
            console.log(`[MOCK] Calling ${action}`, data);
            return this.getMockResponse(action, data);
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
        };

        if (method === 'POST') {
            options.body = JSON.stringify(data);
        } else if (method === 'GET') {
            // Append params to URL for GET requests
            for (const key in data) {
                if (Object.hasOwnProperty.call(data, key)) {
                    url += `&${key}=${encodeURIComponent(data[key])}`;
                }
            }
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return { error: 'Network error or invalid JSON response' };
        }
    },

    /**
     * Get Products
     */
    async getProducts(category = 'all', query = '') {
        // GAS "doGet" handles query params, but we can also use POST to send complex filters
        // For simplicity with our GAS setup, let's use the POST endpoint for everything or append params
        // Our GAS doGet supports: action=getProducts&cat=...&q=...

        let url = `${CONFIG.API_URL}?action=getProducts&_t=${Date.now()}`;
        if (category) url += `&cat=${encodeURIComponent(category)}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        if (CONFIG.USE_MOCK_DATA) return this.getMockResponse('getProducts');

        try {
            const response = await fetch(url, { redirect: 'follow' });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    /**
     * MOCK RESPONSES for testing without backend
     */
    getMockResponse(action, data) {
        return new Promise(resolve => {
            setTimeout(() => {
                switch (action) {
                    case 'login':
                        if (data.email === 'admin@devish.com')
                            resolve({ success: true, role: 'admin', user: { name: 'Admin', email: data.email } });
                        else
                            resolve({ success: true, role: 'user', user: { name: 'Test User', email: data.email } });
                        break;
                    case 'getProducts':
                        resolve([
                            { id: 1, name: 'Caustic Soda', category: 'Chemicals', price: 50, image_url: 'assets/images/product-placeholder.png' },
                            { id: 2, name: 'Citric Acid', category: 'Acids', price: 120, image_url: 'assets/images/product-placeholder.png' }
                        ]);
                        break;
                    default:
                        resolve({ success: true });
                }
            }, 500);
        });
    }
};
