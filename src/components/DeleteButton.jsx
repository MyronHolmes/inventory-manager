import { Trash2 } from "lucide-react";

function DeleteButton({ selectedRows, onDelete }) {
  return (
    <button
      style={{ color: "#dc2626" }}
      disabled={selectedRows.length === 0}
      className={`p-2 rounded ${
        selectedRows.length === 0
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-red-900 cursor-pointer"
      }`}
      onClick={() => {
        onDelete?.(selectedRows);
      }}
    >
      <Trash2 />
    </button>
  );
}

export default DeleteButton;
