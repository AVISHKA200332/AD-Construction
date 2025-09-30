import React from "react";

function AddUserModal({ showModal }) {

  return (
    showModal && (
      <div className="modal">
        {/* Modal content here */}
      </div>
    )
  );
}

export default AddUserModal;
