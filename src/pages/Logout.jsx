import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate logging out: clear cookie/localStorage/sessionStorage
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    sessionStorage.clear();

    // Wait a second for loading effect, then redirect
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto" />
        <p>Logging out...</p>
      </div>
    </div>
  );
}
