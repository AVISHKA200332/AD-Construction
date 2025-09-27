import React from "react";

function LaborInventory() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold text-[#0B3954]">Inventory / Tools</h1>
      <p className="text-gray-600 mt-2">Tools and PPE assigned to you.</p>

      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <p className="text-gray-500">No items assigned.</p>
      </div>
    </div>
  );
}

export default LaborInventory;
