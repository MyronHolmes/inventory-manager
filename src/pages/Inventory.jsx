import DynamicTableContent from "../components/DynamicTableManager";

export default function inventory() {
  const defaultFormData = {
    product: "",
    color: "",
    size: "",
    quantity: 0,
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
