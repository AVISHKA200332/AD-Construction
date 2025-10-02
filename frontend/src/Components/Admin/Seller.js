import React, { useEffect, useMemo, useState } from "react";

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
async function apiCreateItem(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create item");
  return data.item;
}
async function apiUpdateItem(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update item");
  return data.item;
}
async function apiDeleteItem(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete item");
  return true;
}
async function apiRestock(id, amount) {
  const res = await fetch(`${API_BASE}/${id}/restock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to restock item");
  return data.item;
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
const METRICS = [
  "Bag",
  "Meter",
  "Centimeter",
  "Kilogram",
  "Cubic Meter",
  "Packet",
  "Piece",
  "Other"
];
const STATUSES = ["active", "archived", "out_of_stock"];

function ItemForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      type: TYPES[0],
      metric: METRICS[0],
      amount: 0,
      seller: "",
      unitPrice: 0,
      currency: "USD",
      status: "active",
    }
  );

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "amount" || name === "unitPrice" ? Number(value) : value,
    }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-[#0B3954]">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          placeholder="e.g., Cement"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Metric/Unit</label>
          <select
            name="metric"
            value={form.metric}
            onChange={handleChange}
            required
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          >
            {METRICS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Amount</label>
          <input
            type="number"
            min="0"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Unit Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="unitPrice"
            value={form.unitPrice}
            onChange={handleChange}
            required
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Currency</label>
          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0B3954]">Seller</label>
        <input
          name="seller"
          value={form.seller}
          onChange={handleChange}
          required
          className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          placeholder="e.g., ABC Traders"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border-2 border-[#0B3954] text-[#0B3954] bg-white font-semibold hover:bg-yellow-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function StatPill({ status }) {
  const classes =
    status === "out_of_stock"
      ? "bg-red-100 text-red-700"
      : status === "archived"
      ? "bg-gray-100 text-gray-700"
      : "bg-green-100 text-green-700";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${classes}`}>{status}</span>;
}

export default function Seller() {
  // list + filters
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchItems({ q, type, status, minStock, maxStock, sort });
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type, status, minStock, maxStock, sort]);

  const totals = useMemo(() => {
    let qty = 0;
    let value = 0;
    items.forEach((it) => {
      qty += it.amount;
      value += it.amount * it.unitPrice;
    });
    return { qty, value };
  }, [items]);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(item) {
    setEditing(item);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function handleSave(payload) {
    try {
      if (editing) await apiUpdateItem(editing._id, payload);
      else await apiCreateItem(payload);
      closeForm();
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    try {
      await apiDeleteItem(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function promptAmountAnd(actionName, id) {
    const raw = window.prompt("Enter amount:");
    if (raw === null) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      alert("Please enter a positive number.");
      return;
    }
    try {
      if (actionName === "order") await apiOrder(id, n);
      if (actionName === "restock") await apiRestock(id, n);
      await load();
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
          <button
            className="px-4 py-2 ml-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700"
            onClick={openAdd}
          >
            + Add Item
          </button>
        </header>

        {/* Filter row */}
        <section className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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

            <select
              className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min stock"
              className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
            />
            <input
              type="number"
              placeholder="Max stock"
              className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
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

          <div className="mt-4 text-sm text-[#0B3954] font-semibold">
            <span className="mr-6">Total Qty: {totals.qty}</span>
            <span>Total Value: {totals.value.toFixed(2)}</span>
          </div>
        </section>

        {/* Table */}
        <section className="flex-1 bg-white p-4 rounded-xl shadow-lg">
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-blue-100">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Metric/Unit</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Seller</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="8" className="p-4">
                      Loading…
                    </td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan="8" className="p-4 text-red-600">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && items.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-gray-600">
                      No items found.
                    </td>
                  </tr>
                )}
                {items.map((it) => (
                  <tr key={it._id} className="border-t">
                    <td className="p-3 font-semibold">{it.name}</td>
                    <td className="p-3">{it.type}</td>
                    <td className="p-3">{it.metric || "-"}</td>
                    <td className="p-3 text-right">
                      {it.unitPrice.toFixed(2)} {it.currency}
                    </td>
                    <td className="p-3 text-right">{it.amount}</td>
                    <td className="p-3 text-right">
                      {(it.amount * it.unitPrice).toFixed(2)} {it.currency}
                    </td>
                    <td className="p-3">{it.seller}</td>
                    <td className="p-3">
                      <StatPill status={it.amount === 0 ? "out_of_stock" : it.status} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          className="px-3 py-1 rounded-lg border-2 border-[#0B3954] bg-white font-semibold hover:bg-yellow-400"
                          title="Restock (increase stock)"
                          onClick={() => promptAmountAnd("restock", it._id)}
                        >
                          Restock
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                          onClick={() => openEdit(it)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg border-2 border-red-600 text-red-600 font-semibold hover:bg-red-100"
                          onClick={() => handleDelete(it._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-extrabold text-[#0B3954]">
                  {editing ? "Edit Item" : "Add Item"}
                </h2>
                <button className="text-[#0B3954] font-semibold" onClick={closeForm}>
                  ✕
                </button>
              </div>
              <ItemForm initial={editing} onSubmit={handleSave} onCancel={closeForm} />
            </div>
          </div>
        )}
    </div>
  );
}
