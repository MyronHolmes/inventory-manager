import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { myTheme } from "../utils/tableConfig";
import { createColDef } from "../utils/colDef";
import { getCookie } from "../utils/auth";
import Button from "../components/Button";
import { refreshRowData } from "../utils/fetchHelpers";
import Notification from "../components/Notification";
import { Trash2 } from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Inventory() {
  const user = JSON.parse(getCookie("user"));
  const location = useLocation();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [prodData, setProdData] = useState([]);
  const [colorData, setColorData] = useState([]);
  const [sizeData, setSizeData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState([]);
  const [messageType, setMessageType] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    color: "",
    size: "",
    quantity: "",
  });

  useEffect(() => {
    fetch("/api/auth/inventory")
      .then((res) => res.json())
      .then((inventoryData) => {
        console.log(inventoryData);
        setProdData(inventoryData.products);
        const prodArray = inventoryData.products.map((p) => p.product);
        setColorData(inventoryData.colors);
        const colorArray = inventoryData.colors.map((c) => c.color);
        setSizeData(inventoryData.sizes);
        const sizeArray = inventoryData.sizes.map((s) => s.size);

        if (inventoryData.inventory.length > 0) {
          const rawCols = createColDef(
            inventoryData.inventory[0],
            "product_variants"
          );

          const updatedCols = rawCols.map((col) => {
            if (col.field === "product") {
              return {
                ...col,
                cellEditorParams: {
                  values: prodArray,
                },
              };
            }
            if (col.field === "color") {
              return {
                ...col,
                cellEditorParams: {
                  values: colorArray,
                },
              };
            }
            if (col.field === "size") {
              return {
                ...col,
                cellEditorParams: {
                  values: sizeArray,
                },
              };
            }
            return col;
          });

          setColumnDefs(updatedCols);
          setRowData(inventoryData.inventory);
        }
      });
  }, []);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      filter: true,
      sortable: true,
    }),
    []
  );
  const rowSelection = useMemo(
    () => ({
      mode: "multiRow",
      headerCheckbox: false,
    }),
    []
  );
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ product: "", color: "", size: "", quantity: "" });
    console.log(formData);
  };

  const closeMessage = () => {
    setShowMessage(false);
    setMessageType(null);
    setMessage(null);
  };
  const openMessage = (show, type, message) => {
    setShowMessage(show);
    setMessageType(type);
    setMessage(message);
  };
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    const response = await fetch("/api/auth/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, createdBy: user.id }),
    });

    if (response.ok) {
      const resData = await response.json();
      refreshRowData(location.pathname, "inventory", setRowData);
      closeModal();
      openMessage(true, "success", resData.message);
    } else {
      const resData = await response.json();
      openMessage(
        true,
        "fail",
        resData.error.code === "23505"
          ? `\This product variation already exists.`
          : `Failed to add this product variation.`
      );
      console.error("Error adding new product", resData);
    }
  };

  const onRowValueChanged = useCallback(async (event) => {
    const putObj = {
      ...event.data,
      updatedBy: user.id,
    };

    const response = await fetch("/api/auth/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(putObj),
    });

    if (response.ok) {
      const resData = await response.json();
      refreshRowData(location.pathname, "inventory", setRowData);
      openMessage(true, "success", resData.message);
    } else {
      const resData = await response.json();
      openMessage(
        true,
        "fail",
        resData.error.code === "23505"
          ? `\This product variation already exists.`
          : `Failed to add this product variation.`
      );
      console.error("Failed to update product", resData);
    }
  }, []);

  const onSelectionChanged = useCallback((event) => {
    const selected = event.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  const onDelete = async (rows) => {
    const ids = rows.map((row) => row.id);
    const response = await fetch("/api/auth/inventory", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (response.ok) {
      const resData = await response.json();
      console.log(rows);
      refreshRowData(location.pathname, "inventory", setRowData);
      openMessage(true, "success", resData.message);
    } else {
      const resData = await response.json();
      openMessage(true, "fail", "Failed to delete product(s)");
      console.error("Failed to delete product(s)", resData);
    }
  };

  return (
    <div className="ag-theme-alpine p-4 space-y-6 min-h-screen">
      {showMessage && (
        <Notification
          type={messageType}
          message={message}
          closeMessage={closeMessage}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">
          Inventory Management
        </h1>
        <Button context="+ Add Product Variant" bgColor="orange" textColor="white" onClick={setIsModalOpen}></Button>
      </div>

      <div
        className="ag-theme-alpine p-3"
        style={{ height: 600, width: "100%" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={myTheme}
          rowSelection={rowSelection}
          editType={"fullRow"}
          onRowValueChanged={onRowValueChanged}
          onSelectionChanged={onSelectionChanged}
        />
      </div>
      <div className="flex flex-row-reverse m-0 p-0">
        <Button context={<Trash2 />} bgColor="red" textColor="white" onClick={onDelete} selectedRows={selectedRows} ></Button>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-400">
                Add New Product Variant
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-red-400 text-2xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                >
                  <option value="" disabled>
                    Select A Product
                  </option>
                  {prodData.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                >
                  <option value="" disabled>
                    Select A Color
                  </option>
                  {colorData.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.color}
                    </option>
                  ))}
                </select>
              </div>{" "}
              <div>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                >
                  <option value="" disabled>
                    Select A Size
                  </option>
                  {sizeData.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 placeholder-gray-400"
                  min="0"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
