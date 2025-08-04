import DynamicTableContent from "../components/DynamicTableManager";

export default function sizes() {
  const defaultFormData = {
    size: ""
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
