import Notification from "../components/Notification";
import { useNotification } from "../hooks/useNotification";
import { useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { apiRequest } from "../utils/fetchHelpers";

const Account = () => {
  const [userItem, setUserItem] = useState(
    JSON.parse(localStorage.getItem("user"))
  );
  const [user, setUser] = useState(userItem);
  const [isEditing, setIsEditing] = useState(false);
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
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (JSON.stringify(user) === JSON.stringify(userItem)) {
      setIsEditing(false);
      return;
    } else if (!user.firstName || !user.lastName || !user.email) {
      showNotification("fail", "Please Complete The Form");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Referer-Path": window.location.pathname,
        },
        body: JSON.stringify({
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          role: user.role,
          updated_by: user.id,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        setUser({
          id: resData.user.id,
          firstName: resData.user.first_name,
          lastName: resData.user.last_name,
          email: resData.user.email,
          role: resData.user.role,
        });
        setUserItem(user);
        localStorage.setItem("user", JSON.stringify(user));
        setIsEditing(false);
        showNotification("success", resData.message);
      } else {
        showNotification("fail", `${resData.message}: ${resData.info.message}`);
      }
    } catch (err) {
      console.error(err);
      return showNotification("fail", `${err.message}: ${err.info.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 md:px-0">
      <div className="max-w-md mx-auto bg-zinc-100 shadow-md rounded-xl p-6 mt-10">
        {showMessage && (
          <Notification
            type={messageType}
            message={message}
            onClose={hideNotification}
          />
        )}
        <h2 className="text-2xl font-semibold mb-6 text-orange-500">
          Account Info
        </h2>
        {loading ? (
          <LoadingScreen
            message={`Loading Your Account Details...`}
            size={"large"}
          />
        ) : (
          <form className="space-y-4 m-1">
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
                      setUser(userItem);
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
        )}
        <div>
          <a
            className="text-center text-blue-600 underline"
            href="/account/password"
          >
            Change Your Password
          </a>
        </div>
      </div>
    </div>
  );
};

export default Account;
