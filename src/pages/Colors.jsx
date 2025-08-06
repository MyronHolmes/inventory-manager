import DynamicTableContent from "../components/DynamicTableManager";

export default function users() {
  const defaultFormData = {
    color: ""
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
