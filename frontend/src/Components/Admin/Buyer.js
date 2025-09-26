import React, { useEffect, useMemo, useState } from "react";
import html2pdf from "html2pdf.js";

// ====== Adjust this if your backend route is different ======
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/items";

// Small helper to build query strings
function toQuery(params = {}) {
  const esc = encodeURIComponent;
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + entries.map(([k, v]) => `${esc(k)}=${esc(v)}`).join("&");
}

// API calls
async function apiFetchItems(params = {}) {
  const res = await fetch(`${API_BASE}${toQuery(params)}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

async function apiOrder(id, amount) {
  const res = await fetch(`${API_BASE}/${id}/order`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to order item");
  return data.item;
}

// Form defaults
const TYPES = [
  "Cement",
  "Granite",
  "Sand",
  "Concrete Blocks",
  "Steel Bars",
  "Bricks",
  "Tiles",
  "Paint",
  "Other Construction Material"
];
const STATUSES = ["active", "archived", "out_of_stock"];

function StatPill({ status }) {
  const classes =
    status === "out_of_stock"
      ? "bg-red-100 text-red-700"
      : status === "archived"
      ? "bg-gray-100 text-gray-700"
      : "bg-green-100 text-green-700";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${classes}`}>{status}</span>;
}

function OrderModal({ item, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const totalPrice = (quantity * item.unitPrice).toFixed(2);

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(item._id, quantity, notes);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold text-[#0B3954]">Order Item</h2>
          <button className="text-[#0B3954] font-semibold" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold text-[#0B3954]">{item.name}</h3>
          <p className="text-sm text-gray-600">Seller: {item.seller}</p>
          <p className="text-sm text-gray-600">Available: {item.amount} units</p>
          <p className="text-sm text-gray-600">Price: {item.unitPrice} {item.currency} per unit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0B3954] mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={item.amount}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0B3954] mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              placeholder="Any special requirements or notes..."
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-semibold text-[#0B3954]">
              Total: {totalPrice} {item.currency}
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border-2 border-[#0B3954] text-[#0B3954] bg-white font-semibold hover:bg-yellow-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Buyer() {
  // list + filters
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal
  const [orderItem, setOrderItem] = useState(null);
  // cart
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState({
    name: "",
    address: "",
    email: "",
    contact: ""
  });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchItems({ q, type, status, sort });
      // Filter out items that are out of stock or archived for buyers
      const availableItems = data.filter(item => 
        item.status === "active" && item.amount > 0
      );
      setItems(availableItems);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, status, sort]);

  // Filter by price range
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const price = item.unitPrice;
      const minOk = !minPrice || price >= Number(minPrice);
      const maxOk = !maxPrice || price <= Number(maxPrice);
      return minOk && maxOk;
    });
  }, [items, minPrice, maxPrice]);

  function openOrderModal(item) {
    setOrderItem(item);
  }

  function addToCart(item, quantity) {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    closeOrderModal();
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i._id !== id));
  }

  function openCheckout() {
    setShowCheckout(true);
  }

  function closeCheckout() {
    setShowCheckout(false);
    setCheckoutDetails({ name: "", address: "", email: "", contact: "" });
  }

  function handleCheckoutChange(e) {
    const { name, value } = e.target;
    setCheckoutDetails((d) => ({ ...d, [name]: value }));
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    generateInvoicePDF();
    setCart([]);
    closeCheckout();
    alert("Order placed and invoice generated!");
  }

  function generateInvoicePDF() {
    const { name, address, email, contact } = checkoutDetails;
    const date = new Date().toLocaleString();
    let itemsRows = cart.map(
      (item, idx) =>
        `<tr>
          <td style="padding:8px;text-align:center;">${idx + 1}</td>
          <td style="padding:8px;">${item.name}</td>
          <td style="padding:8px;">${item.type}</td>
          <td style="padding:8px;">${item.metric || "-"}</td>
          <td style="padding:8px;text-align:right;">${item.quantity}</td>
          <td style="padding:8px;text-align:right;">${item.unitPrice.toFixed(2)} ${item.currency}</td>
          <td style="padding:8px;text-align:right;">${(item.unitPrice * item.quantity).toFixed(2)} ${item.currency}</td>
        </tr>`
    ).join("");
    const total = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0).toFixed(2);
    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f7f8fa;padding:32px;max-width:700px;margin:auto;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
          <div>
            <h1 style="color:#0B3954;font-size:2rem;margin:0;">AD Construction</h1>
            <span style="color:#666;font-size:1rem;">Invoice</span>
          </div>
          <div style="text-align:right;">
            <img src='https://img.icons8.com/ios-filled/50/0B3954/construction.png' alt='logo' style='height:48px;width:48px;border-radius:8px;background:#e3e3e3;padding:4px;' />
            <div style="color:#888;font-size:0.9rem;">${date}</div>
          </div>
        </div>
        <div style="background:#fff;padding:24px;border-radius:12px;margin-bottom:24px;box-shadow:0 1px 6px rgba(0,0,0,0.04);">
          <h2 style="color:#0B3954;font-size:1.2rem;margin-bottom:8px;">Customer Details</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><strong>Name:</strong> ${name}</div>
            <div><strong>Contact:</strong> ${contact}</div>
            <div><strong>Email:</strong> ${email}</div>
            <div><strong>Address:</strong> ${address}</div>
          </div>
        </div>
        <div style="background:#fff;padding:24px;border-radius:12px;box-shadow:0 1px 6px rgba(0,0,0,0.04);">
          <h2 style="color:#0B3954;font-size:1.2rem;margin-bottom:8px;">Order Details</h2>
          <table style="width:100%;border-collapse:collapse;font-size:1rem;">
            <thead>
              <tr style="background:#0B3954;color:#fff;">
                <th style="padding:10px;border-radius:8px 0 0 8px;">#</th>
                <th style="padding:10px;">Name</th>
                <th style="padding:10px;">Type</th>
                <th style="padding:10px;">Metric/Unit</th>
                <th style="padding:10px;text-align:right;">Qty</th>
                <th style="padding:10px;text-align:right;">Unit Price</th>
                <th style="padding:10px;text-align:right;border-radius:0 8px 8px 0;">Line Total</th>
              </tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <div style="text-align:right;margin-top:16px;font-size:1.2rem;color:#0B3954;font-weight:bold;">Total: ${total} USD</div>
        </div>
        <div style="margin-top:32px;text-align:center;color:#888;font-size:0.95rem;">Thank you for your business!</div>
      </div>
    `;
    html2pdf().from(html).save(`Invoice_${name.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
  }

  function closeOrderModal() {
    setOrderItem(null);
  }

  async function handleOrder(itemId, quantity, notes) {
    try {
      await apiOrder(itemId, quantity);
      closeOrderModal();
      await load();
      alert(`Order placed successfully! Quantity: ${quantity}${notes ? `, Notes: ${notes}` : ''}`);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="flex flex-col text-[#0B3954]">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Search items (name or seller)…"
          className="px-4 py-2 w-80 rounded-full border-2 border-[#0B3954] font-semibold text-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="text-sm text-[#0B3954] font-semibold">
          Available Items: {filteredItems.length}
        </div>
      </header>

      {/* Filter row */}
      <section className="bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min price"
            className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max price"
            className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <select
            className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition md:col-span-2"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="name:asc">Name A→Z</option>
            <option value="name:desc">Name Z→A</option>
            <option value="unitPrice:asc">Price Low→High</option>
            <option value="unitPrice:desc">Price High→Low</option>
            <option value="amount:asc">Stock Low→High</option>
            <option value="amount:desc">Stock High→Low</option>
          </select>
        </div>
      </section>

      {/* Items Grid */}
      <section className="flex-1 bg-white p-4 rounded-xl shadow-lg">
        {loading && (
          <div className="text-center py-8">
            <p className="text-[#0B3954]">Loading available items...</p>
          </div>
        )}
        
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No items available for purchase.</p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="border-2 border-[#0B3954] rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-[#0B3954]">{item.name}</h3>
                  <StatPill status={item.status} />
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Type:</span> {item.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Seller:</span> {item.seller}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Available:</span> {item.amount} units
                  </p>
                  <p className="text-lg font-bold text-[#0B3954]">
                    {item.unitPrice.toFixed(2)} {item.currency} per unit
                  </p>
                </div>

                <button
                  onClick={() => openOrderModal(item)}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                  disabled={item.amount === 0}
                >
                  {item.amount === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order Modal */}
      {orderItem && (
        <OrderModal
          item={orderItem}
          onClose={closeOrderModal}
          onConfirm={(id, quantity) => addToCart(orderItem, quantity)}
        />
      )}

      {/* Cart Section */}
      {cart.length > 0 && (
        <section className="bg-white p-4 rounded-xl shadow-lg mt-6">
          <h2 className="text-xl font-bold text-[#0B3954] mb-4">Cart</h2>
          <table className="min-w-full text-sm mb-4">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2">Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Metric/Unit</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Unit Price</th>
                <th className="p-2 text-right">Line Total</th>
                <th className="p-2">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.type}</td>
                  <td className="p-2">{item.metric || "-"}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                  <td className="p-2 text-right">{item.unitPrice.toFixed(2)} {item.currency}</td>
                  <td className="p-2 text-right">{(item.unitPrice * item.quantity).toFixed(2)} {item.currency}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => removeFromCart(item._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-blue-600 text-white rounded font-semibold" onClick={openCheckout}>Checkout</button>
          </div>
        </section>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-[#0B3954]">Checkout</h2>
              <button className="text-[#0B3954] font-semibold" onClick={closeCheckout}>✕</button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <input name="name" value={checkoutDetails.name} onChange={handleCheckoutChange} required placeholder="Name" className="w-full border-2 border-[#0B3954] rounded px-3 py-2" />
              <input name="address" value={checkoutDetails.address} onChange={handleCheckoutChange} required placeholder="Address" className="w-full border-2 border-[#0B3954] rounded px-3 py-2" />
              <input name="email" value={checkoutDetails.email} onChange={handleCheckoutChange} required type="email" placeholder="Email" className="w-full border-2 border-[#0B3954] rounded px-3 py-2" />
              <input name="contact" value={checkoutDetails.contact} onChange={handleCheckoutChange} required placeholder="Contact Number" className="w-full border-2 border-[#0B3954] rounded px-3 py-2" />
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={closeCheckout} className="px-4 py-2 rounded-lg border-2 border-[#0B3954] text-[#0B3954] bg-white font-semibold hover:bg-yellow-400">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Place Order & Print Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}