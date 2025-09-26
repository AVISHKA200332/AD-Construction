import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Seller() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", type: "Cement", amount: 0, seller: "", unitPrice: 0, currency: "USD", status: "active" });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((it) =>
      [it.name, it.seller, it.type, it.status].some((v) => String(v || "").toLowerCase().includes(term))
    );
  }, [q, items]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/inventory-items`);
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addItem(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/inventory-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount), unitPrice: Number(form.unitPrice) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `Create failed (${res.status})`);
      }
      setForm({ name: "", type: "Cement", amount: 0, seller: "", unitPrice: 0, currency: "USD", status: "active" });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function restock(id) {
    const amount = Number(prompt("Enter restock amount:", "1"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const res = await fetch(`${API_BASE}/inventory-items/${id}/restock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.message || `Restock failed (${res.status})`);
      return;
    }
    await load();
  }

  async function order(id) {
    const amount = Number(prompt("Enter order amount:", "1"));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const res = await fetch(`${API_BASE}/inventory-items/${id}/order`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.message || `Order failed (${res.status})`);
      return;
    }
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, seller, type..."
          className="border px-3 py-2 rounded w-full max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={addItem} className="bg-gray-50 border rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-3">Add Item</h2>
          <div className="space-y-3">
            <input className="w-full border px-3 py-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="w-full border px-3 py-2 rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {[
                "Cement",
                "Granite",
                "Sand",
                "Concrete Blocks",
                "Steel Bars",
                "Bricks",
                "Tiles",
                "Paint",
                "Other Construction Material",
              ].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input className="w-full border px-3 py-2 rounded" type="number" min="0" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="w-full border px-3 py-2 rounded" placeholder="Seller" value={form.seller} onChange={(e) => setForm({ ...form, seller: e.target.value })} />
            <input className="w-full border px-3 py-2 rounded" type="number" min="0" placeholder="Unit Price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
            <div className="flex gap-2">
              <button className="bg-[#0B3954] text-white px-4 py-2 rounded hover:bg-[#0b3954d9]" type="submit">Create</button>
              <button className="border px-4 py-2 rounded" type="button" onClick={() => setForm({ name: "", type: "Cement", amount: 0, seller: "", unitPrice: 0, currency: "USD", status: "active" })}>Clear</button>
            </div>
          </div>
        </form>

        <div className="md:col-span-2">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Items</h2>
              <button onClick={load} className="text-sm border px-3 py-2 rounded hover:bg-gray-50">Refresh</button>
            </div>
            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-gray-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Seller</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Unit Price</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((it) => (
                      <tr key={it._id} className="border-t text-sm">
                        <td className="py-2 pr-4">{it.name}</td>
                        <td className="py-2 pr-4">{it.type}</td>
                        <td className="py-2 pr-4">{it.seller}</td>
                        <td className="py-2 pr-4">{it.amount}</td>
                        <td className="py-2 pr-4">{it.unitPrice} {it.currency}</td>
                        <td className="py-2 pr-4">{it.status}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <button className="text-xs bg-green-600 text-white px-2 py-1 rounded" onClick={() => restock(it._id)}>Restock</button>
                            <button className="text-xs bg-indigo-600 text-white px-2 py-1 rounded" onClick={() => order(it._id)}>Order</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <p className="text-gray-500 py-4">No items found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
