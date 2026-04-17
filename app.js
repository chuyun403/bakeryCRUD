// ==========================================
// 1. GLOBAL STATE & DOM HOOKS
// ==========================================
let allProducts = [];      // The "Source of Truth" from Flask
let currentPage = 1;       // Current page tracker
const rowsPerPage = 10;    // Items per page
let searchQuery = "";      // Current search filter
const API_URL = "http://127.0.0.1:5000/products";
const tableBody = document.querySelector("#productTable tbody");

// ==========================================
// 2. DATA FETCHING (READ)
// ==========================================
async function loadProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Backend connection failed");
        
        allProducts = await response.json();
        renderTable();
    } catch (err) {
        showToast("Error connecting to bakery database", "error");
        console.error(err);
    }
}

// ==========================================
// 3. CORE RENDERING (SEARCH + PAGINATION + LOW STOCK)
// ==========================================
function renderTable() {
    // A. Filter data based on search input
    const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery) || 
        p.category.toLowerCase().includes(searchQuery)
    );

    // B. Calculate Pagination
    const totalPages = Math.ceil(filtered.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + rowsPerPage);

    // C. Build HTML Rows
    let rows = "";
    if (paginatedItems.length === 0) {
        rows = `<tr><td colspan="6" class="text-center">No products found.</td></tr>`;
    } else {
        paginatedItems.forEach(product => {
            const isLow = product.stock <= 5;
            const rowClass = isLow ? 'low-stock-row' : '';
            const badge = isLow ? '<span class="badge-warn">Low Stock</span>' : '';

            rows += `
                <tr id="row-${product.id}" class="${rowClass}">
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>$${Number(product.price).toFixed(2)}</td>
                    <td>${product.category}</td>
                    <td>${product.stock} ${badge}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${product.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${product.id}">Delete</button>
                    </td>
                </tr>`;
        });
    }

    // D. Update UI
    tableBody.innerHTML = rows;
    renderPagination(totalPages);
}

// ==========================================
// 4. CREATE, UPDATE, & DELETE (CRUD)
// ==========================================
// async function saveProduct(event) {
//     event.preventDefault();

//     const id = document.getElementById("productId").value;
//     const productData = {
//         name: document.getElementById("name").value.trim(),
//         price: parseFloat(document.getElementById("price").value),
//         category: document.getElementById("category").value.trim(),
//         stock: parseInt(document.getElementById("stock").value, 10)
//     };

//     const isEdit = id !== "";
//     const method = isEdit ? "PUT" : "POST";
//     const url = isEdit ? `${API_URL}/${id}` : API_URL;

//     // Optimistic UI Update
//     const originalState = [...allProducts];
//     if (isEdit) {
//         allProducts = allProducts.map(p => p.id == id ? { ...productData, id } : p);
//     } else {
//         allProducts.push({ ...productData, id: Date.now() }); // Temp ID
//     }
//     renderTable();

//     try {
//         const res = await fetch(url, {
//             method: method,
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(productData)
//         });
//         if (!res.ok) throw new Error();
        
//         resetForm();
//         loadProducts(); // Sync with real server IDs
//         showToast(isEdit ? "Updated!" : "Added!", "success");
//     } catch (err) {
//         allProducts = originalState; // Rollback
//         renderTable();
//         showToast("Sync failed", "error");
//     }
// }

async function saveProduct(event) {
    event.preventDefault();

    const id = document.getElementById("productId").value;
    const nameInput = document.getElementById("name").value.trim();
    const priceInput = parseFloat(document.getElementById("price").value);
    const categoryInput = document.getElementById("category").value.trim();
    const stockInput = parseInt(document.getElementById("stock").value, 10);

    // --- ASK 1: DUPLICATE CHECK (Only for NEW items) ---
    if (!id) {
        const exists = allProducts.some(p => p.name.toLowerCase() === nameInput.toLowerCase());
        if (exists) {
            Swal.fire({
                title: 'Duplicate Item!',
                text: `"${nameInput}" is already in the inventory.`,
                icon: 'warning',
                confirmButtonColor: '#d33'
            });
            return; // Stop the function here
        }
    }

    const productData = { name: nameInput, price: priceInput, category: categoryInput, stock: stockInput };
    const isEdit = id !== "";
    const url = isEdit ? `${API_URL}/${id}` : API_URL;

    try {
        const res = await fetch(url, {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        if (res.ok) {
            // --- ASK 3: SUCCESS MODAL (Add/Update) ---
            Swal.fire({
                title: isEdit ? 'Updated!' : 'Added!',
                text: `The product has been successfully saved.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            resetForm();
            loadProducts();
        }
    } catch (err) {
        Swal.fire('Error', 'Failed to sync with server.', 'error');
    }
}
// async function deleteProduct(id) {
//     if (!confirm("Remove this item from inventory?")) return;

//     const originalState = [...allProducts];
//     allProducts = allProducts.filter(p => p.id != id);
//     renderTable();

//     try {
//         const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
//         if (!res.ok) throw new Error();
//         showToast("Product deleted", "success");
//     } catch (err) {
//         allProducts = originalState;
//         renderTable();
//         showToast("Delete failed", "error");
//     }
// }
async function deleteProduct(id) {
    // --- ASK 2: CONFIRMATION MODAL WITH QUESTION ICON ---
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This item will be permanently removed from inventory.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (res.ok) {
                // --- ASK 3: SUCCESS MODAL (Delete) ---
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The item has been removed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                loadProducts();
            }
        } catch (err) {
            Swal.fire('Error', 'Could not delete the item.', 'error');
        }
    }
}

// ==========================================
// 5. HELPER FUNCTIONS (SEARCH & UI)
// ==========================================
function handleSearch() {
    searchQuery = document.getElementById("searchInput").value.toLowerCase();
    currentPage = 1; 
    renderTable();
}

function renderPagination(totalPages) {
    const container = document.getElementById("paginationControls");
    if (!container) return;
    container.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.className = (i === currentPage) ? "btn-primary btn-sm" : "btn-light btn-sm";
        btn.style.margin = "0 2px";
        btn.onclick = () => {
            currentPage = i;
            renderTable();
        };
        container.appendChild(btn);
    }
}

function prepareEdit(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;

    document.getElementById("productId").value = product.id;
    document.getElementById("name").value = product.name;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;
    document.getElementById("stock").value = product.stock;
    document.getElementById("submitBtn").innerText = "Update Product";
}

function resetForm() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("submitBtn").innerText = "Add Product";
}

function showToast(msg, type) {
    console.log(`[${type.toUpperCase()}]: ${msg}`);
    // Optional: Add custom toast UI logic here
}

// ==========================================
// 6. EVENT LISTENERS (The Triggers)
// ==========================================
document.addEventListener("DOMContentLoaded", loadProducts);

document.addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    if (e.target.classList.contains("delete-btn")) deleteProduct(id);
    if (e.target.classList.contains("edit-btn")) prepareEdit(id);
});