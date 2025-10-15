import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";

const defaultFormData = {
  category: "",
};

export default function Categories() {
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
