import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";
import { getCookie } from "../utils/auth";

  const defaultFormData = {
    color: ""
  };

export default function Colors() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <DynamicTableContent
      defaultFormData={defaultFormData}
      location={location}
      user={user}
    />
  );
}