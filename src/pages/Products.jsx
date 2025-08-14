import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";
import { getCookie } from "../utils/auth";

  const defaultFormData = {
    product: "",
    description: "",
    category: "",
    status: "",
    quantity: 0,
  };

export default function Products() {
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
