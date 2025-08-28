import { PencilRuler, Ban } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center border border-gray-300 rounded-lg p-8 bg-gray-600 shadow-md max-w-3xl">
        <div className="mr-5">
          <Ban color="red" size={100} />
        </div>
        <div className="flex flex-col text-left mr-8 max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-white">
            You do not have sufficient privileges to access this page. If you
            believe you should be able to access this page, please contact your
            Surplus Depot manager.
          </p>
        </div>
      </div>
    </div>
  );
}
