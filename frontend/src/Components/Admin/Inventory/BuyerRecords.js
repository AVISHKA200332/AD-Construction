import React, { useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export default function BuyerRecords({ refreshToken = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/buyer-items`);
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message || "Failed to load buyer items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-lg">Recent Re-Stock Orders</h2>
        <button onClick={load} className="text-sm border px-3 py-2 rounded hover:bg-gray-50">Refresh</button>
      </div>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="py-2 pr-4">Customer/Site</th>
                <th className="py-2 pr-4">Currency</th>
                <th className="py-2 pr-4">Lines</th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc._id} className="border-t text-sm">
                  <td className="py-2 pr-4">{doc.customerName}</td>
                  <td className="py-2 pr-4">{doc.currency}</td>
                  <td className="py-2 pr-4">{Array.isArray(doc.items) ? doc.items.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="text-gray-500 py-4">No records yet.</p>}
        </div>
      )}
    </div>
  );
}
