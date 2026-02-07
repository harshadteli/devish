// Authentication System (GAS Backend Integration)

const AuthSystem = {
    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('devish_user') !== null;
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('devish_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Login
    async login(email, password) {
        try {
            const result = await ApiClient.call('login', { email, password });

            if (result.success) {
                // Store user info
                localStorage.setItem('devish_user', JSON.stringify(result.user));

                // Handle specific roles
                if (result.role === 'admin') {
                    localStorage.setItem('isAdmin', 'true');
                    localStorage.setItem('adminName', result.user.name);
                    localStorage.setItem('adminEmail', result.user.email);
                } else {
                    localStorage.removeItem('isAdmin');
                }

                // Update Cart Badge for the new user
                if (typeof CartSystem !== 'undefined') CartSystem.updateCartBadge();

                return { success: true, user: result.user, role: result.role };
            }

            return { success: false, message: result.message || 'Login failed' };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Network error' };
        }
    },

    // Register
    async register(name, email, password) {
        try {
            const result = await ApiClient.call('register', { name, email, password });

            if (result.success) {
                // Auto-login after registration? Or just redirect to login
                return { success: true, message: result.message };
            }

            return { success: false, message: result.message || 'Registration failed' };
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Network error' };
        }
    },

    // Send OTP
    async sendOTP(email, type = 'register') {
        try {
            const result = await ApiClient.call('sendOTP', { email, type });
            return result;
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Failed to send OTP' };
        }
    },

    // Verify OTP
    async verifyOTP(email, otp) {
        try {
            const result = await ApiClient.call('verifyOTP', { email, otp });
            return result;
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Verification failed' };
        }
    },

    // Reset Password
    async resetPassword(email, password) {
        try {
            const result = await ApiClient.call('resetPassword', { email, password });
            return result;
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Reset failed' };
        }
    },

    // Get User Info by Email
    async getUserInfo(email) {
        try {
            const result = await ApiClient.call('getUserInfo', { email }, 'GET');
            return result;
        } catch (e) {
            console.error(e);
            return { success: false, message: 'Failed to fetch user info' };
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('devish_user');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminName');
        localStorage.removeItem('adminEmail');

        if (typeof CartSystem !== 'undefined') CartSystem.updateCartBadge();
        this.updateNavUI();
        window.dispatchEvent(new Event('authStateChanged'));
        window.location.href = 'login.html';
    },

    // Update UI based on auth state
    updateNavUI() {
        const user = this.getCurrentUser();
        const navActions = document.querySelector('.nav-actions');

        if (!navActions) return;

        // Find or create account action item
        let accountItem = Array.from(document.querySelectorAll('.action-item')).find(item =>
            item.textContent.includes('Account') || item.textContent.includes('Login') || item.querySelector('[data-user-display]')
        );

        if (user) {
            // Show My Orders links if they exist
            document.querySelectorAll('[id^="myOrdersLink"]').forEach(link => {
                link.style.display = 'block';
            });

            // User is logged in - show name and logout button
            if (accountItem) {
                accountItem.innerHTML = `
                    <div class="action-icon-box"><i data-lucide="user"></i></div>
                    <span data-user-display>${user.name.split(' ')[0]}</span>
                `;
                accountItem.style.cursor = 'default';
                accountItem.onclick = null;
            }

            // Add logout button if it doesn't exist
            let logoutBtn = document.getElementById('logout-btn');
            if (!logoutBtn) {
                logoutBtn = document.createElement('div');
                logoutBtn.id = 'logout-btn';
                logoutBtn.className = 'action-item';
                logoutBtn.style.cursor = 'pointer';
                logoutBtn.innerHTML = `
                    <div class="action-icon-box"><i data-lucide="log-out"></i></div>
                    <span>Logout</span>
                `;
                logoutBtn.onclick = () => {
                    if (confirm('Are you sure you want to logout?')) {
                        this.logout();
                    }
                };

                // Insert before menu toggle
                const menuToggle = document.getElementById('menuToggle');
                if (menuToggle) {
                    navActions.insertBefore(logoutBtn, menuToggle);
                } else {
                    navActions.appendChild(logoutBtn);
                }
            }
        } else {
            // User is not logged in - show login button
            if (accountItem) {
                accountItem.innerHTML = `
                    <div class="action-icon-box"><i data-lucide="user"></i></div>
                    <span>Login</span>
                `;
                accountItem.style.cursor = 'pointer';
                accountItem.onclick = () => window.location.href = 'login.html';
            }

            // Remove logout button if it exists
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.remove();
            }
        }

        if (window.lucide) lucide.createIcons();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthSystem.updateNavUI();
});

