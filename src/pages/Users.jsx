import DynamicTableContent from "../components/DynamicTableManager";

export default function users() {
  const defaultFormData = {
    first_name: "",
    last_name: "",
    email: "",
    role: "",
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
