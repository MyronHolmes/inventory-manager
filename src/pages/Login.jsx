import { useState } from "react";
import VideoBackground from "../components/VideoBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and Password can not be empty.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.info.message);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setLoading(false);
      // Example: redirect or store user info
      window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full bg-red-600 text-white text-center">
        {" "}
        For Demo Purposes Use Email: demo-m@example.com With Password: Demo!123
        For A Manager Role Or <br /> Email: demo-s@example.com With Password: Demo!123
        For A Staff Role{" "}
      </div>
      <VideoBackground />
      <div style={{ position: "relative", zIndex: 10 }}>
        {
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-orange-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-md w-full max-w-xl">
              <h2 className="text-2xl font-bold mb-6 text-center text-stone-50">
                Surplus Depot User Login
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="mt-1 w-full px-4 py-2 border-b-4 border-white focus:outline-none focus:ring-2 text-white "
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <input
                    id="password"
                    type="password"
                    required
                    className="mt-1 w-full px-4 py-2 border-b-4 border-white focus:outline-none focus:ring-2 text-white "
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg transition ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-stone-50 hover:bg-gray-200"
                  } text-stone-950`}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>
              {error && (
                <div className="mt-4 text-red-600 bg-red-100 border border-red-300 p-2 rounded text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        }
      </div>
    </>
  );
}
