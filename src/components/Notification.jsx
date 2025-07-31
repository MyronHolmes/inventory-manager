function Notification({ message, type, hideNotification }) {
  return (
    <div
      className={`w-1/3 border-3 rounded-lg bg-gray-900 p-3 absolute top-2 right-2 z-100 ${
        type === "success" ? "border-green-500" : "border-red-500"
      }`}
    >
      <div className="flex justify-between">
        <h3>{message}</h3>
        <button className="cursor-pointer" onClick={hideNotification}>
          &times;
        </button>
      </div>
    </div>
  );
}

export default Notification;
