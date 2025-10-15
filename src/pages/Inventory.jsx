import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";

const defaultFormData = {
  product: "",
  color: "",
  size: "",
  quantity: 0,
};

export default function Inventory() {
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
