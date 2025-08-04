import DynamicTableContent from "../components/DynamicTableManager";

export default function categories() {
  const defaultFormData = {
    category: ""
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
