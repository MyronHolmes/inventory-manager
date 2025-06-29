import { useEffect, useState } from "react";
import { getCookie } from "../utils/auth";
import { capitalizeWords } from "../utils/format";

export const Dashboard = () => {
  const user = JSON.parse(getCookie("user"));
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-500">Welcome to Surplus Depot</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
        <p className="text-lg">
          <span className="font-semibold text-gray-300">Current Date:</span>{" "}
          {dateTime.toLocaleDateString()}
        </p>
        <p className="text-lg">
          <span className="font-semibold text-gray-300">Current Time:</span>{" "}
          {dateTime.toLocaleTimeString()}
        </p>
        <p className="text-lg">
          <span className="font-semibold text-gray-300">User:</span>{" "}
          {user.firstName} {user.lastName}
        </p>
        <p className="text-lg">
          <span className="font-semibold text-gray-300">Role:</span>{" "}
          {capitalizeWords(user.role)}
        </p>
      </div>
    </div>
  );
};
