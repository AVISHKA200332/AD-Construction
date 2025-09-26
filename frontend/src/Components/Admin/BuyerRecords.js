import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_BUYER || "http://localhost:5000/buyer-items";

const TYPES = [
  "Cement",
  "Sand",
  "granite",
  "Cemet Blocks",
  "Steel Bards",
];
const METRICS = ["cube", "Packets", "Count"];

function BuyerForm({ initial, onSubmit, onCancel }) {
  const [customerName, setCustomerName] = useState(initial?.customerName || "");
  const [currency, setCurrency] = useState(initial?.currency || "USD");
  const [items, setItems] = useState(() => {
    if (initial?.items && Array.isArray(initial.items) && initial.items.length) return initial.items;
    return [{ type: "Cement", metric: "cube", quantity: 0, unitPrice: 0, lineTotal: 0 }];
  });

  useEffect(() => {
    if (initial) {
      setCustomerName(initial.customerName || "");
      setCurrency(initial.currency || "USD");
      setItems(initial.items && initial.items.length ? initial.items : [{ type: "Cement", metric: "cube", quantity: 0, unitPrice: 0, lineTotal: 0 }]);
    }
  }, [initial]);

  const orderTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0).toFixed(2);
  }, [items]);

  function updateItem(index, patch) {
    setItems((arr) => arr.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((arr) => [...arr, { type: "Cement", metric: "cube", quantity: 0, unitPrice: 0, lineTotal: 0 }]);
  }
  function removeItem(index) {
    setItems((arr) => arr.filter((_, i) => i !== index));
  }

  function submit(e) {
    e.preventDefault();
    if (!items.length) {
      alert("Please add at least one line item");
      return;
    }
    onSubmit({ customerName, currency, items });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Customer Name</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
            placeholder="e.g., John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#0B3954]">Currency</label>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          />
        </div>
      </div>

      <div className="space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-bold text-[#0B3954]">Line Items</h3>
          <button type="button" onClick={addItem} className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">+ Add Item</button>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="min-w-[900px] grid grid-cols-1 md:grid-cols-7 gap-4 items-end border rounded-lg p-4 md:pr-8">
            <div>
              <label className="block text-sm font-semibold text-[#0B3954]">Type</label>
              <select
                value={it.type}
                onChange={(e) => updateItem(idx, { type: e.target.value })}
                className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              >
                {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B3954]">Metrics</label>
              <select
                value={it.metric}
                onChange={(e) => updateItem(idx, { metric: e.target.value })}
                className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              >
                {METRICS.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B3954]">Quantity</label>
              <input
                type="number"
                min="0"
                value={it.quantity}
                onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B3954]">Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={it.unitPrice}
                onChange={(e) => updateItem(idx, { unitPrice: Number(e.target.value) })}
                className="w-full border-2 border-[#0B3954] bg-blue-100 rounded px-3 py-2 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B3954]">Line Total</label>
              <div className="bg-blue-50 px-3 py-2 rounded-lg w-full text-right font-semibold text-[#0B3954]">
                {(Number(it.quantity || 0) * Number(it.unitPrice || 0)).toFixed(2)} {currency}
              </div>
            </div>
            <div className="flex items-end justify-end pr-8">
              <button type="button" onClick={() => removeItem(idx)} className="px-2 md:px-3 py-2 rounded-lg border-2 border-red-600 text-red-600 font-semibold text-sm md:text-base hover:bg-red-100 whitespace-nowrap shrink-0 min-w-[96px]">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-lg text-right font-semibold text-[#0B3954]">
        Order Total: {orderTotal} {currency}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border-2 border-[#0B3954] text-[#0B3954] bg-white font-semibold hover:bg-yellow-400">Cancel</button>
        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Save</button>
      </div>
    </form>
  );
}

export default function BuyerRecords() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [metric, setMetric] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("createdAt:desc");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (type) params.append("type", type);
      if (metric) params.append("metric", metric);
      if (minPrice !== "") params.append("minPrice", minPrice);
      if (maxPrice !== "") params.append("maxPrice", maxPrice);
      if (sort) params.append("sort", sort);
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch buyer items");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, type, metric, minPrice, maxPrice, sort]);

  function openAdd() { setEditing(null); setShowForm(true); }
  function openEdit(item) { setEditing(item); setShowForm(true); }
  function closeForm() { setEditing(null); setShowForm(false); }

  async function saveItem(payload) {
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API_BASE}/${editing._id}` : API_BASE;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      closeForm();
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  const totals = useMemo(() => {
    let totalSpend = 0;
    let totalQty = 0;
    items.forEach((it) => {
      const calcTotal = Array.isArray(it.items)
        ? it.items.reduce((acc, li) => acc + Number(li.quantity || 0) * Number(li.unitPrice || 0), 0)
        : 0;
      totalSpend += calcTotal;
      if (Array.isArray(it.items)) {
        totalQty += it.items.reduce((acc, li) => acc + Number(li.quantity || 0), 0);
      }
    });
    return { totalSpend, totalQty };
  }, [items]);

  // Ensure html2pdf library is available
  function ensureHtml2Pdf() {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load pdf library'));
      document.body.appendChild(s);
    });
  }

  async function printJobCard(order) {
    const created = new Date(order.createdAt || Date.now());
    const dateStr = created.toLocaleString();
    const company = {
      name: "AD Construction",
      email: "info@adconstruction.com",
      phone: "+94 77 123 4567",
      address: "Anuradhapura, Sri Lanka",
    };

    const currency = order.currency || "USD";
    const orderSum = (order.items || []).reduce((acc, li) => acc + Number(li.quantity || 0) * Number(li.unitPrice || 0), 0);
    const rows = (order.items || []).map(
      (li, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${li.type}</td>
          <td>${li.metric}</td>
          <td class="num">${Number(li.quantity || 0).toLocaleString()}</td>
          <td class="num">${Number(li.unitPrice || 0).toFixed(2)}</td>
          <td class="num">${Number((li.quantity || 0) * (li.unitPrice || 0)).toFixed(2)}</td>
        </tr>`
    ).join("");

    const fileName = `JobCard_${(order.customerName || "").replace(/\s+/g,'_')}_${order._id || 'order'}.pdf`;
    const styles = `
  <style>
    :root{ --blue:#0B3954; --accent:#2563eb; --muted:#e6f0ff; --border:#d9e2ec; }
    *{ box-sizing:border-box; }
    .print-wrap{ font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Helvetica Neue", Helvetica, sans-serif; margin:0; padding:24px; background:#f7fafc; color:#0b1f2a; }
    .card{ max-width:900px; margin:0 auto; background:white; border-radius:16px; border:1px solid var(--border); box-shadow:0 10px 30px rgba(0,0,0,0.05); overflow:hidden; }
    .header{ display:flex; justify-content:space-between; align-items:center; padding:24px; background:linear-gradient(90deg, #fff, var(--muted)); border-bottom:1px solid var(--border); }
    .brand{ display:flex; gap:16px; align-items:center; }
    .logo{ width:48px; height:48px; border-radius:12px; background:var(--blue); color:white; display:grid; place-items:center; font-weight:800; }
    .brand h1{ margin:0; font-size:20px; color:var(--blue); }
    .meta{ text-align:right; color:#334e68; font-size:12px; }
    .section{ padding:20px 24px; }
    .grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .panel{ background:#f8fbff; border:1px solid var(--border); border-radius:12px; padding:14px 16px; }
    .panel h3{ margin:0 0 8px; font-size:13px; color:#486581; text-transform:uppercase; letter-spacing:0.08em; }
    .panel p{ margin:2px 0; font-size:14px; color:#102a43; }
    table{ width:100%; border-collapse:collapse; margin-top:10px; font-size:14px; }
    thead th{ background:#f1f7ff; color:#0b1f2a; border-bottom:2px solid var(--border); padding:10px; text-align:left; }
    tbody td{ border-bottom:1px solid var(--border); padding:10px; }
    td.num, th.num{ text-align:right; }
    .summary{ display:flex; justify-content:flex-end; padding:16px 0; }
    .summary .box{ min-width:260px; background:#fff; border:1px solid var(--border); border-radius:12px; padding:12px 16px; }
    .row{ display:flex; justify-content:space-between; padding:6px 0; color:#102a43; }
    .row.total{ font-weight:800; color:var(--blue); border-top:1px dashed var(--border); margin-top:6px; padding-top:10px; }
    .footer{ padding:18px 24px; background:#fbfdff; border-top:1px solid var(--border); color:#486581; font-size:12px; display:flex; justify-content:space-between; align-items:center; }
  </style>`;

    const markup = `
  <div class="print-wrap">
    <div id="job-card" class="card">
      <div class="header">
        <div class="brand">
          <div>
            <h1>Job Card</h1>
            <div style="color:#486581; font-size:12px;">Order ID: ${order._id || "-"}</div>
          </div>
        </div>
        <div class="meta">
          <div><strong>Date:</strong> ${dateStr}</div>
          <div><strong>Currency:</strong> ${currency}</div>
        </div>
      </div>

      <div class="section grid">
        <div class="panel">
          <h3>Customer</h3>
          <p><strong>${order.customerName}</strong></p>
        </div>
        <div class="panel">
          <h3>Company</h3>
          <p>AD Construction</p>
          <p>info@adconstruction.com • +94 77 123 4567</p>
          <p>Anuradhapura, Sri Lanka</p>
        </div>
      </div>

      <div class="section">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Metrics</th>
              <th class="num">Qty</th>
              <th class="num">Unit Price</th>
              <th class="num">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div class="summary">
          <div class="box">
            <div class="row"><span>Items</span><strong>${(order.items||[]).length}</strong></div>
            <div class="row total"><span>Order Total</span><strong>${orderSum.toFixed(2)} ${currency}</strong></div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>Generated by AD Construction</div>
        <div>Thank you for your business!</div>
      </div>
    </div>
  </div>`;

    try {
      await ensureHtml2Pdf();
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-99999px';
      container.style.top = '0';
      container.innerHTML = styles + markup;
      document.body.appendChild(container);
      const el = container.querySelector('#job-card');
      const opt = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await window.html2pdf().set(opt).from(el).save();
      document.body.removeChild(container);
    } catch (e) {
      alert('Failed to generate PDF: ' + e.message);
    }
  }

  return (
    <div className="flex flex-col text-[#0B3954]">
      <header className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Search (customer/type/metric)…"
          className="px-4 py-2 w-80 rounded-full border-2 border-[#0B3954] font-semibold text-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-4 py-2 ml-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700" onClick={openAdd}>
          + Add Purchase
        </button>
      </header>

      <section className="bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <select className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <select className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition" value={metric} onChange={(e) => setMetric(e.target.value)}>
            <option value="">All Metrics</option>
            {METRICS.map((m) => (<option key={m} value={m}>{m}</option>))}
          </select>
          <input type="number" placeholder="Min price" className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input type="number" placeholder="Max price" className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <select className="px-3 py-2 rounded-lg border-2 border-[#0B3954] bg-blue-100 focus:bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 outline-none transition md:col-span-2" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="customerName:asc">Customer A→Z</option>
            <option value="customerName:desc">Customer Z→A</option>
            <option value="orderTotal:asc">Order Total Low→High</option>
            <option value="orderTotal:desc">Order Total High→Low</option>
            <option value="quantity:asc">Qty Low→High</option>
            <option value="quantity:desc">Qty High→Low</option>
            <option value="createdAt:desc">Newest</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-[#0B3954] font-semibold">
          <span className="mr-6">Total Qty: {totals.totalQty}</span>
          <span>Total Spend: {totals.totalSpend.toFixed(2)}</span>
        </div>
      </section>

      <section className="flex-1 bg-white p-4 rounded-xl shadow-lg">
        {loading && (
          <div className="p-4">Loading…</div>
        )}
        {error && !loading && (
          <div className="p-4 text-red-600">{error}</div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="p-4 text-gray-600">No records.</div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((it) => {
              const total = Array.isArray(it.items)
                ? it.items.reduce((acc, li) => acc + Number(li.quantity || 0) * Number(li.unitPrice || 0), 0)
                : 0;
              return (
                <div key={it._id} className="border-2 border-[#0B3954] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4 border-b bg-blue-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-[#0B3954]/70">Customer</div>
                        <div className="font-extrabold text-[#0B3954] text-lg">{it.customerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#0B3954]/70">Order Total</div>
                        <div className="font-extrabold text-[#0B3954]">{total.toFixed(2)} {it.currency}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-xs font-semibold text-[#0B3954]/70">Items ({it.items?.length || 0})</div>
                    <div className="space-y-2 max-h-60 overflow-auto pr-1">
                      {(it.items || []).map((li, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-blue-100/60 border border-[#0B3954]/20 rounded-lg px-3 py-2">
                          <div className="text-sm font-semibold text-[#0B3954]">
                            {li.type} <span className="text-[#0B3954]/70">• {li.metric}</span>
                          </div>
                          <div className="text-sm text-[#0B3954] font-semibold whitespace-nowrap">
                            {Number(li.quantity || 0)} × {Number(li.unitPrice || 0).toFixed(2)} = <span className="font-extrabold">{(Number(li.quantity || 0) * Number(li.unitPrice || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t flex items-center justify-end gap-2 bg-white rounded-b-xl">
                    <button className="px-3 py-1 rounded-lg border-2 border-[#0B3954] text-[#0B3954] font-semibold hover:bg-yellow-100" onClick={() => printJobCard(it)}>Download PDF</button>
                    <button className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700" onClick={() => openEdit(it)}>Edit</button>
                    <button className="px-3 py-1 rounded-lg border-2 border-red-600 text-red-600 font-semibold hover:bg-red-100" onClick={() => deleteItem(it._id)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 shadow-xl mx-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-extrabold text-[#0B3954]">{editing ? "Edit Purchase" : "Add Purchase"}</h2>
              <button className="text-[#0B3954] font-semibold" onClick={closeForm}>✕</button>
            </div>
            <BuyerForm initial={editing} onSubmit={saveItem} onCancel={closeForm} />
          </div>
        </div>
      )}
    </div>
  );
}
