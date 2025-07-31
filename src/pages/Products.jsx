import DynamicTableContent from "../components/DynamicTableManager";

export default function Products() {
  const defaultFormData = {
    product: "",
    description: "",
    category: "",
    status: "",
    quantity: 0,
  };

  return <DynamicTableContent defaultFormData={defaultFormData} />;
}
