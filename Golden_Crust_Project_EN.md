# 🥖 Golden Crust Inventory Management System

A professional, high-performance digital solution for modern bakeries.

## 🌟 The Vision
The **Golden Crust Management System** isn't just a list of items; it's a "digital brain" for bakery staff. It transforms messy manual tracking into a streamlined, mistake-proof operation, allowing bakers to focus on their craft while the system handles the data.

## 🛠️ The Tech Stack (The "Engine")
- **The Storefront (Frontend):** Built with Vanilla JavaScript and Scandinavian-inspired CSS. It’s clean, minimalist, and responsive.
- **The Kitchen (Backend):** Powered by Python and Flask. This "chef" processes all the logic and ensures data flows correctly.
- **The Pantry (Database):** Uses SQLite and SQLAlchemy to safely store every product record permanently.

## 🚀 Key Features for Bakery Staff

### 1. Permanent Digital Vault
No more paper lists. Every loaf of sourdough and every pastry is stored in a permanent database. Even if the power goes out, the inventory is safe and ready.

### 2. High-Speed Search & Navigation
Finding a specific product among 50+ items is instantaneous. With **Real-Time Search**, typing just a few letters filters the entire inventory. **Pagination** keeps the interface clean by organizing the list into manageable "pages."

### 3. "Early Warning" Low Stock Logic
The system watches the numbers so the staff doesn't have to. When stock levels for a product drop to **5 or fewer**, the row highlights in soft red and a **"LOW STOCK"** badge appears, signaling exactly what needs to be baked next.

### 4. Mistake-Proof User Experience (UX)
Using **SweetAlert2**, the system talks back to the user:
- **Duplicate Prevention:** Prevents accidental double-entries of the same product.
- **Smart Confirmations:** Asks "Are you sure?" before deleting data.
- **Success Feedback:** Provides satisfying visual checkmarks when tasks are completed.
