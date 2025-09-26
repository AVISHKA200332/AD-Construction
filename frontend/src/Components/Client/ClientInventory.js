import React from "react";

function ClientInventory() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Inventory</h1>
      <p className="text-gray-600 mt-2">Materials and resources associated with your projects.</p>

      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <p className="text-gray-500">No inventory records yet.</p>
      </div>
    </div>
  );
}

export default ClientInventory;
