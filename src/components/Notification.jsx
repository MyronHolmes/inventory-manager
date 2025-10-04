import { useEffect } from "react";

function Notification({ message, type, onClose, duration = 5000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // cleanup to avoid memory leaks if component unmounts early
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`w-1/3 border-3 rounded-lg bg-gray-900 p-3 absolute top-2 right-2 z-100 ${
        type === "success" ? "border-green-500" : "border-red-500"
      }`}
    >
      <div className="flex justify-between">
        <h3>{message}</h3>
        <button className="cursor-pointer" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default Notification;
