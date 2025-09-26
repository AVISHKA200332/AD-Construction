import React, { useState } from "react";
import BuyerRecords from "./BuyerRecords";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function Buyer() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [doc, setDoc] = useState({
    customerName: "",
    currency: "USD",
    items: [
      { type: "Cement", metric: "Bags", unitPrice: 0, amount: 0, seller: "" },
    ],
  });

  function updateLine(idx, patch) {
    const next = [...doc.items];
    next[idx] = { ...next[idx], ...patch };
    setDoc({ ...doc, items: next });
  }

  function addLine() {
    setDoc({
      ...doc,
      items: [...doc.items, { type: "Cement", metric: "Bags", unitPrice: 0, amount: 0, seller: "" }],
    });
  }

  function removeLine(idx) {
    const next = doc.items.filter((_, i) => i !== idx);
    setDoc({ ...doc, items: next });
  }

  async function createBuyerDoc(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/buyer-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...doc, items: doc.items.map((l) => ({ ...l, unitPrice: Number(l.unitPrice), amount: Number(l.amount) })) }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `Create failed (${res.status})`);
      }
      setDoc({ customerName: "", currency: "USD", items: [{ type: "Cement", metric: "Bags", unitPrice: 0, amount: 0, seller: "" }] });
      setRefreshToken((n) => n + 1);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createBuyerDoc} className="bg-gray-50 border rounded-xl p-4 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Create Re-Stock Order</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Customer/Site</label>
            <input className="w-full border px-3 py-2 rounded" value={doc.customerName} onChange={(e) => setDoc({ ...doc, customerName: e.target.value })} placeholder="Site or Customer" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Currency</label>
            <input className="w-full border px-3 py-2 rounded" value={doc.currency} onChange={(e) => setDoc({ ...doc, currency: e.target.value })} />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Line Items</h3>
            <button type="button" onClick={addLine} className="text-sm border px-3 py-2 rounded hover:bg-gray-50">Add Line</button>
          </div>
          <div className="space-y-3">
            {doc.items.map((ln, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div>
                  <label className="text-sm text-gray-600">Type</label>
                  <select className="w-full border px-3 py-2 rounded" value={ln.type} onChange={(e) => updateLine(idx, { type: e.target.value })}>
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
                </div>
                <div>
                  <label className="text-sm text-gray-600">Metric</label>
                  <input className="w-full border px-3 py-2 rounded" value={ln.metric} onChange={(e) => updateLine(idx, { metric: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Unit Price</label>
                  <input className="w-full border px-3 py-2 rounded" type="number" min="0" value={ln.unitPrice} onChange={(e) => updateLine(idx, { unitPrice: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Amount</label>
                  <input className="w-full border px-3 py-2 rounded" type="number" min="0" value={ln.amount} onChange={(e) => updateLine(idx, { amount: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Seller</label>
                  <input className="w-full border px-3 py-2 rounded" value={ln.seller} onChange={(e) => updateLine(idx, { seller: e.target.value })} />
                </div>
                <div className="flex gap-2 md:justify-end">
                  <button type="button" className="text-sm border px-3 py-2 rounded" onClick={() => removeLine(idx)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <button className="bg-[#0B3954] text-white px-4 py-2 rounded hover:bg-[#0b3954d9]" type="submit">Create Order</button>
        </div>
      </form>

      <BuyerRecords refreshToken={refreshToken} />
    </div>
  );
}
