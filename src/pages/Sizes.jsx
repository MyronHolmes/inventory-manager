import { useLocation } from "react-router-dom";
import DynamicTableContent from "../components/DynamicTableManager";

const defaultFormData = {
  size: "",
};

export default function Sizes() {
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
