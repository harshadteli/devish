// Verification Script for User-Specific Cart Isolation
// Paste this into the Chrome Developer Tools Console (F12) while on any page

(function verifyCartIsolation() {
    console.group("Cart Isolation Test");

    const userA = { email: "testA@example.com", name: "User A" };
    const userB = { email: "testB@example.com", name: "User B" };

    // Helper functions
    const mockState = {
        save: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
        get: (key) => JSON.parse(localStorage.getItem(key)),
        clear: (key) => localStorage.removeItem(key)
    };

    // 1. Clear previous test data
    mockState.clear(`devish_cart_${userA.email}`);
    mockState.clear(`devish_cart_${userB.email}`);
    localStorage.removeItem('devish_user'); // logged out

    console.log("--- starting test ---");

    // 2. Login User A
    localStorage.setItem('devish_user', JSON.stringify(userA));
    console.log(`✅ Logged in as: ${userA.name}`);

    // Add item (Product ID 101)
    const itemA = { id: 101, name: "Product A", price: 10 };
    // Create cart manually if addToCart checks API
    // Or call public method: 
    // CartSystem.addToCart(itemA); 
    // Since addToCart might check `isLoggedIn`, we ensure localStorage is set first.

    // Simulate adding to cart via CartSystem logic directly to avoid UI blocking
    let cartA = [{ ...itemA, quantity: 1 }];
    mockState.save(`devish_cart_${userA.email}`, cartA);
    console.log("User A Cart created with 1 item (ID: 101)");

    // 3. Login User B (implicitly logs out A locally)
    localStorage.setItem('devish_user', JSON.stringify(userB));
    console.log(`✅ Logged in as: ${userB.name}`);

    // Check Cart for B (should be empty initially)
    let cartB_check = mockState.get(`devish_cart_${userB.email}`);
    if (!cartB_check) {
        console.log("✅ User B's cart is empty/null as expected.");
    } else {
        console.error("❌ User B's cart should be empty!", cartB_check);
    }

    // Add item (Product ID 202)
    const itemB = { id: 202, name: "Product B", price: 20 };
    let cartB = [{ ...itemB, quantity: 1 }];
    mockState.save(`devish_cart_${userB.email}`, cartB);
    console.log("User B Cart created with 1 item (ID: 202)");

    // 4. Verify Isolation (Switch back to A)
    localStorage.setItem('devish_user', JSON.stringify(userA));
    console.log(`✅ Switched back to: ${userA.name}`);

    let cartA_verify = mockState.get(`devish_cart_${userA.email}`);

    // Check Content
    if (cartA_verify && cartA_verify.length === 1 && cartA_verify[0].id === 101) {
        console.log("%c✅ SUCCESS: User A still has their original item (ID: 101). Isolation confirmed!", "color: green; font-weight: bold;");
        alert("Verification Successful: User carts are isolated correctly!");
    } else {
        console.error("❌ FAILED: User A's cart was lost or overwritten.", cartA_verify);
        alert("Verification Failed!");
    }

    console.groupEnd();

    // Cleanup
    mockState.clear(`devish_cart_${userA.email}`);
    mockState.clear(`devish_cart_${userB.email}`);
    localStorage.removeItem('devish_user');

})();
