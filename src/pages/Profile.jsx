import { getCookie } from "../utils/auth";
import { useState } from "react";

const Profile = () => {
  // get user data from cookie
  const userData = JSON.parse(getCookie("user"));

  // state for the saved user data
  const [user, setUser] = useState(userData);

  // edit mode state
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Updated user:", user);
    setIsEditing(false);
    // TODO: send updated user to your API if needed
  };

  return (
    <div className="max-w-md mx-auto bg-zinc-100 shadow-md rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-orange-500">
        Account Info
      </h2>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 ${
              isEditing
                ? "border-gray-300 bg-white"
                : "border-gray-300 bg-gray-200 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 ${
              isEditing
                ? "border-gray-300 bg-white"
                : "border-gray-300 bg-gray-200 cursor-not-allowed"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`text-gray-700 mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 ${
              isEditing
                ? "border-gray-300 bg-white"
                : "border-gray-300 bg-gray-200 cursor-not-allowed"
            }`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setUser(userData);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Save
              </button>
            </>
          )}
        </div>
      </form>
      <div>
        <a
          className="text-center text-blue-600 underline"
          href="/profile/password-change"
        >
          Change Your Password
        </a>
      </div>
    </div>
  );
};

export default Profile;
