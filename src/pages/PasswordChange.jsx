import { useState } from "react";

const defaultFormData = {
  currentPassword: "",
  newPassword: "",
  newPasswordComfirmed: "",
};

const PasswordChange = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated formData:", formData);
    setIsEditing(false);
    // TODO: send updated user to your API if needed
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-100 shadow-md rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-orange-500">
        Change Password
      </h2>

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
        <a
          className="text-center text-blue-600 underline"
          href="/account/"
        >
          Account Information
        </a>
      </div>
      </form>

    </div>
  );
};

export default PasswordChange;
