        // Simple JavaScript for functional ecommerce features
        document.addEventListener('DOMContentLoaded', function() {
            // App state management
            const appState = {
                cart: JSON.parse(localStorage.getItem('apexphone_cart')) || [],
                user: JSON.parse(localStorage.getItem('apexphone_user')) || null,
                orders: JSON.parse(localStorage.getItem('apexphone_orders')) || []
            };

            // DOM Elements
            const cartCountElement = document.querySelector('.cart-count');
            const addToCartButtons = document.querySelectorAll('.add-to-cart');
            const cartTableBody = document.querySelector('.cart-table tbody');
            const cartTotalElement = document.querySelector('.cart-total');
            const checkoutButton = document.querySelector('.checkout-btn');
            const loginForm = document.querySelector('.auth-card form');
            const registerForm = document.querySelector('.auth-card:last-child form');
            const authLinks = document.querySelector('.auth-links');
            const quantityButtons = document.querySelectorAll('.quantity-btn');
            const removeButtons = document.querySelectorAll('.remove-btn');
            
            // Initialize UI based on state
            function initUI() {
                updateCartCount();
                updateCartUI();
                updateAuthUI();
            }
            
            // Update cart count badge
            function updateCartCount() {
                const totalItems = appState.cart.reduce((total, item) => total + item.quantity, 0);
                if (cartCountElement) {
                    cartCountElement.textContent = totalItems;
                }
            }
            
            // Update cart table UI
            function updateCartUI() {
                if (!cartTableBody) return;
                
                // Clear existing cart items
                cartTableBody.innerHTML = '';
                
                if (appState.cart.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `
                        <td colspan="5" style="text-align: center; padding: 30px;">
                            Your cart is empty. <a href="#" style="color: var(--primary);">Continue shopping</a>
                        </td>
                    `;
                    cartTableBody.appendChild(emptyRow);
                    
                    // Update cart summary
                    if (cartTotalElement) {
                        cartTotalElement.querySelector('.cart-summary div').innerHTML = `
                            <p><strong>Subtotal:</strong> £0</p>
                            <p><strong>Shipping:</strong> £0</p>
                            <p><strong>Total:</strong> <span style="color: var(--primary); font-size: 1.2rem; font-weight: 700;">£0</span></p>
                        `;
                    }
                    
                    return;
                }
                
                // Populate cart with items
                let subtotal = 0;
                
                appState.cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', item.id);
                    row.innerHTML = `
                        <td>
                            <div class="cart-item">
                                <img src="${item.image}" alt="${item.name}">
                                <div class="item-info">
                                    <h4>${item.name}</h4>
                                    <p>${item.variant}</p>
                                </div>
                            </div>
                        </td>
                        <td>£${item.price}</td>
                        <td>
                            <div class="quantity-selector">
                                <button class="quantity-btn" data-action="decrease">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" data-action="increase">+</button>
                            </div>
                        </td>
                        <td>£${itemTotal}</td>
                        <td>
                            <button class="remove-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    cartTableBody.appendChild(row);
                });
                
                // Update cart summary
                if (cartTotalElement) {
                    const shipping = subtotal > 0 ? 0 : 0; // Free shipping
                    const total = subtotal + shipping;
                    
                    cartTotalElement.querySelector('.cart-summary div').innerHTML = `
                        <p><strong>Subtotal:</strong> £${subtotal}</p>
                        <p><strong>Shipping:</strong> ${shipping === 0 ? '£0 (Free Delivery)' : `£${shipping}`}</p>
                        <p><strong>Total:</strong> <span style="color: var(--primary); font-size: 1.2rem; font-weight: 700;">£${total}</span></p>
                    `;
                }
                
                // Attach event listeners to new buttons
                attachCartEventListeners();
            }
            
            // Update authentication UI based on login state
            function updateAuthUI() {
                if (!authLinks) return;
                
                if (appState.user) {
                    // User is logged in
                    authLinks.innerHTML = `
                        <a href="#profile">Hi, ${appState.user.username}</a>
                        <a href="#" id="logout-btn">Logout</a>
                    `;
                    
                    // Add logout event listener
                    document.getElementById('logout-btn').addEventListener('click', function(e) {
                        e.preventDefault();
                        logout();
                    });
                } else {
                    // User is not logged in
                    authLinks.innerHTML = `
                        <a href="#login">Login</a>
                        <a href="#register">Register</a>
                    `;
                }
            }
            
            // Add item to cart
            function addToCart(product) {
                // Check if product already exists in cart
                const existingItemIndex = appState.cart.findIndex(item => item.id === product.id);
                
                if (existingItemIndex !== -1) {
                    // Update quantity if product already in cart
                    appState.cart[existingItemIndex].quantity += 1;
                } else {
                    // Add new product to cart
                    appState.cart.push({
                        ...product,
                        quantity: 1
                    });
                }
                
                // Update localStorage
                localStorage.setItem('apexphone_cart', JSON.stringify(appState.cart));
                
                // Update UI
                updateCartCount();
                updateCartUI();
                
                // Show confirmation
                showToast('Product added to cart successfully!');
            }
            
            // Remove item from cart
            function removeFromCart(productId) {
                appState.cart = appState.cart.filter(item => item.id !== productId);
                
                // Update localStorage
                localStorage.setItem('apexphone_cart', JSON.stringify(appState.cart));
                
                // Update UI
                updateCartCount();
                updateCartUI();
                
                // Show confirmation
                showToast('Product removed from cart!');
            }
            
            // Update item quantity in cart
            function updateCartItemQuantity(productId, action) {
                const itemIndex = appState.cart.findIndex(item => item.id === productId);
                
                if (itemIndex !== -1) {
                    if (action === 'increase') {
                        appState.cart[itemIndex].quantity += 1;
                    } else if (action === 'decrease') {
                        if (appState.cart[itemIndex].quantity > 1) {
                            appState.cart[itemIndex].quantity -= 1;
                        } else {
                            // Remove item if quantity would be less than 1
                            return removeFromCart(productId);
                        }
                    }
                    
                    // Update localStorage
                    localStorage.setItem('apexphone_cart', JSON.stringify(appState.cart));
                    
                    // Update UI
                    updateCartCount();
                    updateCartUI();
                }
            }
            
            // User authentication: Login
            function login(credentials) {
                // This is a simplified mock login - in a real app, you would call an API
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // Mock user database - in real app this would be on server
                        const validUser = {
                            email: 'user@example.com',
                            password: 'password123',
                            username: 'JohnDoe',
                            id: 'usr_123'
                        };
                        
                        if (credentials.email === validUser.email && credentials.password === validUser.password) {
                            // Login successful
                            const user = {
                                id: validUser.id,
                                email: validUser.email,
                                username: validUser.username
                            };
                            
                            // Update app state
                            appState.user = user;
                            
                            // Save to localStorage
                            localStorage.setItem('apexphone_user', JSON.stringify(user));
                            
                            // Update UI
                            updateAuthUI();
                            
                            resolve(user);
                        } else {
                            // Login failed
                            reject(new Error('Invalid email or password'));
                        }
                    }, 300); // Simulate network delay
                });
            }
            
            // User authentication: Register
            function register(userData) {
                // This is a simplified mock registration - in a real app, you would call an API
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // Validate data
                        if (!userData.email || !userData.password || !userData.username) {
                            reject(new Error('All fields are required'));
                            return;
                        }
                        
                        if (userData.password !== userData.confirmPassword) {
                            reject(new Error('Passwords do not match'));
                            return;
                        }
                        
                        // Create user (in a real app this would be done on the server)
                        const user = {
                            id: 'usr_' + Math.random().toString(36).substr(2, 9),
                            email: userData.email,
                            username: userData.username
                        };
                        
                        // Update app state
                        appState.user = user;
                        
                        // Save to localStorage
                        localStorage.setItem('apexphone_user', JSON.stringify(user));
                        
                        // Update UI
                        updateAuthUI();
                        
                        resolve(user);
                    }, 300); // Simulate network delay
                });
            }
            
            // User authentication: Logout
            function logout() {
                // Clear user data
                appState.user = null;
                localStorage.removeItem('apexphone_user');
                
                // Update UI
                updateAuthUI();
                
                // Show confirmation
                showToast('Logged out successfully!');
            }
            
            // Process checkout with PayPal
            function processCheckout() {
                if (appState.cart.length === 0) {
                    showToast('Your cart is empty. Add some products first!', 'error');
                    return;
                }
                
                if (!appState.user) {
                    showToast('Please login to checkout', 'error');
                    // Redirect to login page or show login modal
                    window.location.hash = 'login';
                    return;
                }
                
                // Calculate order total
                const total = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                
                // Create a new order
                const newOrder = {
                    id: 'APX' + Math.floor(10000 + Math.random() * 90000),
                    date: new Date().toISOString(),
                    items: [...appState.cart],
                    total: total,
                    status: 'confirmed',
                    paymentMethod: 'paypal',
                    address: '123 Oxford Street, London, W1D 1AB', // In a real app, user would provide this
                    tracking: {
                        steps: [
                            { name: 'Order Placed', completed: true, date: new Date().toISOString() },
                            { name: 'Payment Confirmed', completed: true, date: new Date().toISOString() },
                            { name: 'Processing', completed: false, date: null },
                            { name: 'Shipping', completed: false, date: null },
                            { name: 'Delivered', completed: false, date: null }
                        ],
                        currentStep: 'Processing',
                        estimatedDelivery: new Date(Date.now() + 2*24*60*60*1000).toISOString() // 2 days from now
                    }
                };
                
                // Simulate PayPal checkout process
                simulatePayPalCheckout(newOrder)
                    .then(order => {
                        // Add order to orders list
                        appState.orders.unshift(order);
                        
                        // Save to localStorage
                        localStorage.setItem('apexphone_orders', JSON.stringify(appState.orders));
                        
                        // Clear cart
                        appState.cart = [];
                        localStorage.setItem('apexphone_cart', JSON.stringify(appState.cart));
                        
                        // Update UI
                        updateCartCount();
                        updateCartUI();
                        
                        // Show success message
                        showToast('Order placed successfully!', 'success');
                        
                        // Redirect to order tracking page
                        window.location.href = `#tracking?id=${order.id}`;
                        
                        // Reload page to show order tracking
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    })
                    .catch(error => {
                        showToast('Checkout failed: ' + error.message, 'error');
                    });
            }
            
            // Simulate PayPal checkout
            function simulatePayPalCheckout(order) {
                return new Promise((resolve, reject) => {
                    // Show a mock PayPal popup
                    const paypalPopup = document.createElement('div');
                    paypalPopup.style.position = 'fixed';
                    paypalPopup.style.top = '0';
                    paypalPopup.style.left = '0';
                    paypalPopup.style.width = '100%';
                    paypalPopup.style.height = '100%';
                    paypalPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    paypalPopup.style.display = 'flex';
                    paypalPopup.style.justifyContent = 'center';
                    paypalPopup.style.alignItems = 'center';
                    paypalPopup.style.zIndex = '1000';
                    
                    const paypalContent = document.createElement('div');
                    paypalContent.style.backgroundColor = 'white';
                    paypalContent.style.padding = '30px';
                    paypalContent.style.borderRadius = '10px';
                    paypalContent.style.width = '90%';
                    paypalContent.style.maxWidth = '400px';
                    paypalContent.innerHTML = `
                        <div style="text-align: center; margin-bottom: 20px;">
                            <i class="fab fa-paypal" style="font-size: 40px; color: #0070ba;"></i>
                            <h2 style="margin-top: 10px;">PayPal Checkout</h2>
                        </div>
                        <p style="margin-bottom: 20px;">Total Amount: <strong>£${order.total}</strong></p>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <button id="paypal-cancel" style="background-color: #f5f5f5; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Cancel</button>
                            <button id="paypal-confirm" style="background-color: #0070ba; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Pay Now</button>
                        </div>
                        <div style="text-align: center; font-size: 12px; color: #666;">
                            <p>This is a simulation. No actual payment will be processed.</p>
                        </div>
                    `;
                    
                    paypalPopup.appendChild(paypalContent);
                    document.body.appendChild(paypalPopup);
                    
                    // Add event listeners to buttons
                    document.getElementById('paypal-cancel').addEventListener('click', function() {
                        document.body.removeChild(paypalPopup);
                        reject(new Error('Payment cancelled'));
                    });
                    
                    document.getElementById('paypal-confirm').addEventListener('click', function() {
                        // Show loading spinner
                        paypalContent.innerHTML = `
                            <div style="text-align: center;">
                                <i class="fas fa-spinner fa-spin" style="font-size: 40px; color: #0070ba; margin-bottom: 20px;"></i>
                                <h2>Processing Payment...</h2>
                            </div>
                        `;
                        
                        // Simulate payment processing
                        setTimeout(() => {
                            document.body.removeChild(paypalPopup);
                            resolve(order);
                        }, 1500);
                    });
                });
            }
            
            // Order tracking functionality
            function updateOrderTracking() {
                const trackingSection = document.querySelector('.tracking-section');
                if (!trackingSection) return;
                
                // Get order ID from URL
                const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
                const orderId = urlParams.get('id');
                
                if (orderId) {
                    // Find order in state
                    const order = appState.orders.find(order => order.id === orderId);
                    
                    if (order) {
                        // Update order tracking UI with real order data
                        const orderHeader = trackingSection.querySelector('.order-header');
                        orderHeader.querySelector('h3').textContent = `Order #${order.id}`;
                        orderHeader.querySelector('p').textContent = `Placed on ${new Date(order.date).toLocaleDateString()}`;
                        
                        // Update status
                        const statusElement = orderHeader.querySelector('.order-status');
                        statusElement.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
                        
                        // Update steps
                        const stepsList = trackingSection.querySelector('.step-list');
                        order.tracking.steps.forEach((step, index) => {
                            const stepElement = stepsList.children[index];
                            
                            if (step.completed) {
                                stepElement.classList.add('completed');
                                stepElement.classList.remove('active');
                            } else if (step.name === order.tracking.currentStep) {
                                stepElement.classList.add('active');
                                stepElement.classList.remove('completed');
                            } else {
                                stepElement.classList.remove('active', 'completed');
                            }
                        });
                        
                        // Update delivery info
                        const deliveryInfo = trackingSection.querySelector('.delivery-details');
                        deliveryInfo.children[1].querySelector('p').textContent = new Date(order.tracking.estimatedDelivery).toLocaleDateString();
                        deliveryInfo.children[2].querySelector('p').textContent = order.address;
                    }
                }
            }
            
            // Toast notification system
            function showToast(message, type = 'success') {
                // Create toast element
                const toast = document.createElement('div');
                toast.style.position = 'fixed';
                toast.style.bottom = '20px';
                toast.style.right = '20px';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '4px';
                toast.style.color = 'white';
                toast.style.fontSize = '14px';
                toast.style.zIndex = '1000';
                toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                
                // Set color based on type
                if (type === 'success') {
                    toast.style.backgroundColor = 'var(--success)';
                } else if (type === 'error') {
                    toast.style.backgroundColor = 'var(--danger)';
                } else {
                    toast.style.backgroundColor = 'var(--primary)';
                }
                
                toast.textContent = message;
                
                // Add to document
                document.body.appendChild(toast);
                
                // Auto-remove after 3 seconds
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transition = 'opacity 0.5s';
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            document.body.removeChild(toast);
                        }
                    }, 500);
                }, 3000);
            }
            
            // Attach event listeners for cart elements
            function attachCartEventListeners() {
                // Quantity buttons
                document.querySelectorAll('.quantity-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.closest('tr').getAttribute('data-id');
                        const action = this.getAttribute('data-action');
                        updateCartItemQuantity(productId, action);
                    });
                });
                
                // Remove buttons
                document.querySelectorAll('.remove-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.getAttribute('data-id');
                        if (confirm('Are you sure you want to remove this item from your cart?')) {
                            removeFromCart(productId);
                        }
                    });
                });
            }
            
            // Initialize application
            function init() {
                // Set up event listeners
                
                // Add to cart buttons
                if (addToCartButtons) {
                    addToCartButtons.forEach(button => {
                        button.addEventListener('click', function() {
                            if (!this.hasAttribute('disabled')) {
                                const productCard = this.closest('.product-card');
                                const product = {
                                    id: 'prod_' + Math.random().toString(36).substr(2, 5),
                                    name: productCard.querySelector('.product-name').textContent,
                                    price: parseFloat(productCard.querySelector('.product-price').textContent.replace('£', '')),
                                    image: productCard.querySelector('.product-img img').getAttribute('src'),
                                    variant: 'Default',
                                };
                                addToCart(product);
                            }
                        });
                    });
                }
                
                // Checkout button
                if (checkoutButton) {
                    checkoutButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        processCheckout();
                    });
                }
                
                // Login form
                if (loginForm) {
                    loginForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const email = this.querySelector('input[type="email"]').value;
                        const password = this.querySelector('input[type="password"]').value;
                        
                        login({ email, password })
                            .then(user => {
                                showToast(`Welcome back, ${user.username}!`, 'success');
                                // Redirect to home or previous page
                                window.location.href = '#';
                            })
                            .catch(error => {
                                showToast(error.message, 'error');
                            });
                    });
                }
                
                // Register form
                if (registerForm) {
                    registerForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        const username = this.querySelector('input[type="text"]').value;
                        const email = this.querySelector('input[type="email"]').value;
                        const password = this.querySelectorAll('input[type="password"]')[0].value;
                        const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
                        const termsChecked = this.querySelector('#terms').checked;
                        
                        if (!termsChecked) {
                            showToast('Please agree to the Terms of Service', 'error');
                            return;
                        }
                        
                        register({ username, email, password, confirmPassword })
                            .then(user => {
                                showToast(`Account created successfully! Welcome, ${user.username}!`, 'success');
                                // Redirect to home
                                window.location.href = '#';
                            })
                            .catch(error => {
                                showToast(error.message, 'error');
                            });
                    });
                }
                
                // Handle hash-based navigation for SPA behavior
                window.addEventListener('hashchange', function() {
                    updateOrderTracking();
                });
                
                // Initialize UI
                initUI();
                updateOrderTracking();
            }
            
            // Start the application
            init();
        });

        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
    
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
            }
            
            // smooth scroll for back-to-top button (it has its own handler)
            if (this.id === 'back-to-top') return;
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });

            // Back to top button visibility
            const backToTopButton = document.getElementById('back-to-top');
                if (windowTopPosition > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
    
        // Initial check
        window.addEventListener('load', checkIfInView);
    
        // Check on scroll
        window.addEventListener('scroll', checkIfInView);
    
        // Back to top functionality
        document.getElementById('back-to-top').addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });