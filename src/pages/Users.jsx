import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";
import { getCookie } from "../utils/auth";

const defaultFormData = {
  first_name: "",
  last_name: "",
  email: "",
  role: "",
};

export default function Users() {
  const location = useLocation();
  const user = JSON.parse(getCookie("user"));

  return (
    <DynamicTableContent
      defaultFormData={defaultFormData}
      location={location}
      user={user}
    />
  );
}
