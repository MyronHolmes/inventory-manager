import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setMessage("Logged out successfully");
        } else {
          setMessage("Logout failed");
        }

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      })
      .catch((err) => {
        console.error("Logout error:", err);
        setMessage("Logout failed");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto" />
        <p>{message}</p>
      </div>
    </div>
  );
}
