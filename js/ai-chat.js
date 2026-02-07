// AI Recommendation System - Premium Version
const AIRecommendation = {
    chatHistory: [],
    isOpen: false,
    isTyping: false,

    // Initialize the AI chat interface
    async init() {
        this.createChatWidget();

        // ALWAYS fetch Live Products from Database (override static data.js)
        try {
            console.log('Chatbot: Fetching products from database...');
            const data = await ApiClient.getProducts();

            // Check if response is null or empty
            if (!data || data.error) {
                console.error('Chatbot: Database error or empty response:', data ? data.error : 'No data');
            } else if (Array.isArray(data) && data.length > 0) {
                // Filter products to only include valid categories
                const validCategories = ['yeast_enzymes', 'tech_solutions', 'equipments', 'manpower'];
                const filteredProducts = data.filter(p => validCategories.includes(p.category));

                products = filteredProducts; // Update global products array
                console.log(`Chatbot: ✓ Loaded ${filteredProducts.length} products from ${data.length} total`);
            } else {
                console.warn('Chatbot: No products returned from database');
            }
        } catch (error) {
            console.error('Chatbot: Failed to fetch products:', error);
        }

        this.loadChatHistory();

        // Proactive Greeting: Auto-open and greet ONLY on the very first visit of the session
        // AND only if there's no existing chat history.
        if (this.chatHistory.length === 0 && !sessionStorage.getItem('ai_greeted')) {
            setTimeout(() => {
                this.toggleChat();
                this.generateAIResponse("initial_greeting");
                sessionStorage.setItem('ai_greeted', 'true');
            }, 2500);
        }
    },

    // Create floating chat widget
    createChatWidget() {
        // Floating button
        const floatingBtn = document.createElement('div');
        floatingBtn.id = 'ai-chat-btn';
        floatingBtn.innerHTML = `<i data-lucide="bot" size="28"></i>`;
        floatingBtn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; width: 65px; height: 65px;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
            z-index: 9999; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: white;
        `;

        floatingBtn.addEventListener('mouseenter', () => {
            floatingBtn.style.transform = 'scale(1.1) rotate(5deg)';
        });
        floatingBtn.addEventListener('mouseleave', () => {
            floatingBtn.style.transform = 'scale(1) rotate(0deg)';
        });
        floatingBtn.addEventListener('click', () => this.toggleChat());

        // Chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-chat-window';
        chatWindow.style.cssText = `
            position: fixed; bottom: 110px; right: 30px; width: 400px;
            max-width: calc(100vw - 60px); height: 550px;
            max-height: calc(100vh - 150px); background: #ffffff;
            border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            display: none; flex-direction: column; z-index: 9998; overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
        `;

        chatWindow.innerHTML = `
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 1.8rem; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <div style="background: rgba(255,255,255,0.2); padding: 8px; border-radius: 12px;">
                        <i data-lucide="bot" size="24"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.2rem; letter-spacing: -0.5px;">Devish AI</div>
                        <div style="font-size: 0.8rem; opacity: 0.8; display: flex; align-items: center; gap: 4px;">
                            <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;"></span> Online Assistant
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <i data-lucide="trash-2" id="clear-chat" style="cursor: pointer; opacity: 0.7; transition: all 0.2s;" onmouseover="this.style.opacity=1; this.style.transform='scale(1.1)'" onmouseout="this.style.opacity=0.7; this.style.transform='scale(1)'" size="18" title="Clear Chat"></i>
                    <i data-lucide="x" id="close-chat" style="cursor: pointer; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" size="22"></i>
                </div>
            </div>
            
            <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; background: #fdfdfe; scroll-behavior: smooth;">
            </div>
            
            <div id="loading-indicator" style="display: none; padding: 0 1.5rem 1rem; color: #64748b; font-size: 0.8rem; font-style: italic;">
                Devish AI is thinking...
            </div>
            
            <div style="padding: 1.2rem; border-top: 1px solid #f1f5f9; background: white;">
                <div style="display: flex; gap: 0.8rem; background: #f8fafc; padding: 0.4rem; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <input type="text" id="chat-input" placeholder="Type a message..." style="flex: 1; padding: 0.8rem 1rem; border: none; background: transparent; font-size: 0.95rem; outline: none; font-family: inherit;">
                    <button id="send-chat" style="padding: 0.8rem; background: #4f46e5; color: white; border: none; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <i data-lucide="send" size="20"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(floatingBtn);
        document.body.appendChild(chatWindow);

        chatWindow.addEventListener('click', (e) => {
            if (e.target.closest('#close-chat')) this.toggleChat();
            if (e.target.closest('#clear-chat')) this.clearChat();
            if (e.target.closest('#send-chat')) this.sendMessage();
        });

        chatWindow.querySelector('#chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        if (window.lucide) lucide.createIcons();
    },

    toggleChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        this.isOpen = !this.isOpen;
        chatWindow.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen) document.getElementById('chat-input').focus();
    },

    clearChat() {
        if (confirm('Are you sure you want to clear the entire chat history?')) {
            this.chatHistory = [];
            this.saveChatHistory();
            sessionStorage.removeItem('ai_greeted'); // Allow re-greeting
            document.getElementById('chat-messages').innerHTML = '';
            this.speak("Chat history cleared.");
            this.generateAIResponse("initial_greeting");
        }
    },

    showLoading() {
        document.getElementById('loading-indicator').style.display = 'block';
    },

    hideLoading() {
        document.getElementById('loading-indicator').style.display = 'none';
    },

    // Speak Text
    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel any current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.1;

            // Get voices and set a better one
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female')));
            if (preferredVoice) utterance.voice = preferredVoice;

            window.speechSynthesis.speak(utterance);
        }
    },

    // Typewriter effect
    typeMessage(container, text, callback) {
        let i = 0;
        container.innerHTML = '';
        this.isTyping = true;
        const interval = setInterval(() => {
            container.innerHTML += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                this.isTyping = false;
                if (callback) callback();
            }
        }, 20);
    },

    addMessage(sender, text, products = null, isNew = true) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageWrapper = document.createElement('div');
        const isBot = sender === 'bot';

        messageWrapper.style.cssText = `display: flex; gap: 0.8rem; ${isBot ? '' : 'flex-direction: row-reverse;'}`;

        const avatar = `<div style="width: 32px; height: 32px; border-radius: 12px; background: ${isBot ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#f1f5f9'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            <i data-lucide="${isBot ? 'bot' : 'user'}" size="16" style="color: ${isBot ? 'white' : '#64748b'}"></i>
                        </div>`;

        const content = `<div style="flex: 1; max-width: 85%;">
                            <div class="msg-bubble" style="background: ${isBot ? '#ffffff' : '#4f46e5'}; color: ${isBot ? '#1e293b' : 'white'}; padding: 1rem; border-radius: 16px; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: ${isBot ? '1px solid #f1f5f9' : 'none'};">
                                ${isBot && isNew ? '' : text}
                            </div>
                            <div class="product-container" style="display: none;">
                                ${products ? this.renderProductSuggestions(products) : ''}
                            </div>
                        </div>`;

        messageWrapper.innerHTML = avatar + content;
        messagesDiv.appendChild(messageWrapper);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        if (window.lucide) lucide.createIcons();

        if (isBot && isNew) {
            const bubble = messageWrapper.querySelector('.msg-bubble');
            const pContainer = messageWrapper.querySelector('.product-container');

            // Speak immediately
            this.speak(text);

            this.typeMessage(bubble, text, () => {
                if (products) {
                    pContainer.style.display = 'block';
                    messagesDiv.scrollTop = messagesDiv.scrollHeight;
                }
            });
        } else if (products) {
            messageWrapper.querySelector('.product-container').style.display = 'block';
        }

        if (isNew) {
            this.chatHistory.push({ sender, text, products, timestamp: Date.now() });
            this.saveChatHistory();
        }
    },

    renderProductSuggestions(items) {
        if (!items || items.length === 0) return '';

        // Special Case: "Get Quote" premium modern button
        if (items === "quotes_link") {
            return `
                <div style="margin-top: 1.2rem; padding: 0.5rem;">
                    <a href="contact.html" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 1.2rem; border-radius: 18px; text-decoration: none; font-weight: 800; font-size: 1rem; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,0.2);" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 15px 30px rgba(79, 70, 229, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 25px rgba(79, 70, 229, 0.3)'">
                         <i data-lucide="file-text" size="22"></i> Request a Specialized Quote
                    </a>
                </div>
            `;
        }

        if (typeof items === 'string' && items.startsWith("bill_link|")) {
            const orderId = items.split('|')[1];
            return `
                <div style="margin-top: 1.2rem; padding: 0.5rem;">
                    <a href="bill.jsp?orderId=${orderId}" target="_blank" style="display: flex; align-items: center; justify-content: center; gap: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 1.2rem; border-radius: 18px; text-decoration: none; font-weight: 800; font-size: 1rem; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,0.2);" onmouseover="this.style.transform='translateY(-4px) scale(1.02)'; this.style.boxShadow='0 15px 30px rgba(16, 185, 129, 0.4)'" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 10px 25px rgba(16, 185, 129, 0.3)'">
                         <i data-lucide="printer" size="22"></i> Print Order Invoice
                    </a>
                </div>
            `;
        }


        // Group products by category
        const categoryNames = {
            yeast_enzymes: "Fermentation Dry Yeast & Enzyme Formulations",
            tech_solutions: "Advanced Technical Solutions & Services",
            equipments: "Sophisticated Advanced Equipments & Instruments",
            manpower: "Skilled Man Power Supply"
        };

        const grouped = {};
        items.forEach(p => {
            if (!grouped[p.category]) grouped[p.category] = [];
            grouped[p.category].push(p);
        });

        return `
            <div style="margin-top: 0.8rem; display: flex; flex-direction: column; gap: 1.5rem; max-height: 400px; overflow-y: auto; padding-right: 8px; scrollbar-width: thin;">
                ${Object.keys(grouped).map(cat => `
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 0.6rem 0.8rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);">
                            ${categoryNames[cat] || cat}
                        </div>
                        ${grouped[cat].map(p => `
                            <a href="product-detail.html?id=${p.id}" style="background: white; padding: 0.8rem; border-radius: 20px; text-decoration: none; display: flex; gap: 1rem; border: 1px solid #f1f5f9; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.03);" onmouseover="this.style.borderColor='#4f46e5'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.08)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#f1f5f9'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.03)'; this.style.transform='translateY(0)'">
                                <div style="width: 70px; height: 70px; background: #f8fafc; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; border: 1px solid #f1f5f9;">
                                    <img src="${p.image || 'assets/images/product-placeholder.png'}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onerror="this.src='assets/images/product-placeholder.png'">
                                </div>
                                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                    <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem; margin-bottom: 0.3rem; letter-spacing: -0.3px;">${p.name}</div>
                                    <div style="font-size: 0.75rem; color: #64748b; line-height: 1.4; margin-bottom: 0.5rem;">${p.description.substring(0, 50)}...</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div style="display: flex; gap: 6px;">
                                            <span style="background: #eef2ff; color: #4f46e5; font-size: 0.65rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; text-transform: uppercase;">${p.grade.split(' ')[0]}</span>
                                        </div>
                                        <span style="color: #10b981; font-size: 0.85rem; font-weight: 800;">₹${p.price}</span>
                                    </div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        `;
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message || this.isTyping) return;

        this.addMessage('user', message);
        input.value = '';
        this.showLoading();

        setTimeout(() => {
            this.hideLoading();
            this.generateAIResponse(message);
        }, 1200);
    },

    generateAIResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        let response = '';
        let productsList = null;

        if (msg === "initial_greeting") {
            response = "Hello! Welcome to Devish Ingredients. I am your AI assistant. I can help you find high-purity chemicals, enzymes, and bio-additives. How can I assist you today?";
        } else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hii')) {
            response = "Greetings! Devish Ingredients is a global leader in high-purity chemical manufacturing. We offer a comprehensive range of industrial solutions. What can I find for you today?";
        } else if (msg.includes('get a quote') || msg.includes('quote') || msg.includes('pricing')) {
            response = "I would be happy to help you with a specialized quote! Please click the button below to provide your requirements, and our team will get back to you within 24 hours.";
            productsList = "quotes_link";
        } else if (msg.includes('bill') || msg.includes('invoice') || msg.includes('check my bill')) {
            const lastOrderId = localStorage.getItem('devish_last_order');
            if (lastOrderId) {
                response = `I found your latest order (#${lastOrderId}). You can view and print your full invoice by clicking the button below:`;
                productsList = "bill_link|" + lastOrderId;
            } else {
                response = "I couldn't find any recent orders in your session. Please make sure you've placed an order first!";
            }
        } else if (msg.includes('product') || msg.includes('list') || msg.includes('show') || msg.includes('catalog')) {
            response = "Here is our complete product catalog. We offer premium Industrial Enzymes, Yeasts, and Specialty Chemicals.";
            productsList = products; // Show all products
        } else if (msg.includes('about') || msg.includes('company')) {
            response = "Devish Ingredients is an ISO 9001:2015 certified global B2B partner. We provide high-purity manufacturing solutions for modern industrial needs.";
        } else {
            // Intelligent Search in products array
            const found = products.filter(p =>
                msg.includes(p.name.toLowerCase().split(' ')[0]) ||
                msg.includes(p.category.toLowerCase()) ||
                msg.includes(p.cas.toLowerCase())
            ).slice(0, 5);

            if (found.length > 0) {
                response = `I found some products matching your request:`;
                productsList = found;
            } else {
                response = "I couldn't find a direct match. You can type 'show products' to see our full list, or check our categories like Enzymes and Yeasts.";
            }
        }

        this.addMessage('bot', response, productsList);
    },

    saveChatHistory() {
        localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory));
    },

    loadChatHistory() {
        const saved = localStorage.getItem('ai_chat_history');
        if (saved) {
            this.chatHistory = JSON.parse(saved);
            const recentMessages = this.chatHistory.slice(-5); // Only load last 5 to keep UI clean
            recentMessages.forEach(msg => {
                this.addMessage(msg.sender, msg.text, msg.products, false);
            });
        }
    }
};

// Initialize - Always run, even if products is not defined yet
document.addEventListener('DOMContentLoaded', () => {
    AIRecommendation.init();
});
