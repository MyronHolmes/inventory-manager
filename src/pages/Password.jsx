import { useState } from "react";
import { useNotification } from "../hooks/useNotification";
import { getCookie } from "../utils/auth";
import LoadingScreen from "../components/LoadingScreen";
import Notification from "../components/Notification";

const defaultFormData = {
  currentPassword: "",
  newPassword: "",
  newPasswordComfirmed: "",
};

const Password = () => {
  const userData = JSON.parse(getCookie("user"));
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);

  const {
    message,
    messageType,
    showMessage,
    showNotification,
    hideNotification,
  } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.newPasswordComfirmed
    ) {
      showNotification("fail", "Please Complete The Form");
      return;
    } else if (formData.newPassword !== formData.newPasswordComfirmed) {
      showNotification("fail", "New Password Does Not Match");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const resData = await response.json();

      if (response.ok) {
        showNotification("success", resData.message);
      } else {
        showNotification("fail", resData.message);
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-100 shadow-md rounded-xl p-6 mt-10">
      {showMessage && (
        <Notification
          type={messageType}
          message={message}
          onClose={hideNotification}
        />
      )}
      <h2 className="text-2xl font-semibold mb-6 text-orange-500">
        Change Password
      </h2>
      {loading ? (
        <LoadingScreen
          message={`Loading Your Account Details...`}
        />
      ) : (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <input
            type="text"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            className="text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="text"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comfirm New Password
          </label>
          <input
            type="text"
            name="newPasswordComfirmed"
            value={formData.newPasswordComfirmed}
            onChange={handleChange}
            required
            className="text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 border-gray-300 bg-white"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
        <div>
          <a className="text-center text-blue-600 underline" href="/account">
            Account Information
          </a>
        </div>
      </form>
      )}
    </div>
  );
};

export default Password;
