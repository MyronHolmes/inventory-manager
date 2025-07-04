import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { myTheme } from "../utils/tableConfig";
import { createColDef } from "../utils/colDef";
import { getCookie } from "../utils/auth";
import DeleteButton from "../components/DeleteButton";
import { refreshRowData } from "../utils/fetchHelpers";
import AddButton from "../components/AddButton";
import Notification from "../components/Notification";
import { formatColumnName } from "../utils/format";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Products() {
  const user = JSON.parse(getCookie("user"));
  const location = useLocation();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [catData, setCatData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState([]);
  const [messageType, setMessageType] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    created_by: user.id,
  });

  useEffect(() => {
    fetch("/api/auth/products")
      .then((res) => res.json())
      .then((prodData) => {
        setCatData(prodData.categories);
        const categoryArray = prodData.categories.map((cat) => cat.category);

        if (prodData.products.length > 0) {
          const rawCols = createColDef(prodData.products[0], "products");

          const updatedCols = rawCols.map((col) => {
            if (col.field === "category") {
              return {
                ...col,
                cellEditorParams: {
                  values: categoryArray,
                },
              };
            }
            if (col.field === "status") {
              return {
                ...col,
                cellEditorParams: {
                  values: prodData.status,
                },
                valueFormatter: (params) => formatColumnName(params.value),
              };
            }
            return col;
          });

          setColumnDefs(updatedCols);
          setRowData(prodData.products);
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
    setFormData({
      product: "",
      description: "",
      category: "",
      status: "",
      updated_by: user.id,
    });
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
    const response = await fetch("/api/auth/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const resData = await response.json();
      refreshRowData(location.pathname, "products", setRowData);
      closeModal();
      openMessage(true, "success", resData.message);
    } else {
      const resData = await response.json();
      openMessage(
        true,
        "fail",
        resData.error.code === "23505"
          ? `\'${formData.product}\' already exists.`
          : `Failed to add \'${formData.product}\'.`
      );
      console.error("Error adding new product", resData);
    }
  };

  const onRowValueChanged = useCallback(async (event) => {
    const putObj = {
      ...event.data,
      updated_by: user.id,
    };

    const response = await fetch("/api/auth/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(putObj),
    });

    if (response.ok) {
      const resData = await response.json();
      refreshRowData(location.pathname, "products", setRowData);
      openMessage(true, "success", resData.message);
    } else {
      const resData = await response.json();
      openMessage(
        true,
        "fail",
        resData.error.code === "23505"
          ? `\'${putObj.product}\' already exists.`
          : `Failed to update product to \'${putObj.product}\'.`
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
    const response = await fetch("/api/auth/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (response.ok) {
      const resData = await response.json();
      console.log(rows);
      refreshRowData(location.pathname, "product", setRowData);
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
          Products Management
        </h1>
        <AddButton setIsModalOpen={setIsModalOpen} table={"Products"} />
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
        <DeleteButton selectedRows={selectedRows} onDelete={onDelete} />
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-400">
                Add New Product
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
                <input
                  type="text"
                  name="product"
                  placeholder="Product Name"
                  value={formData.product}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <textarea
                  name="description"
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700 placeholder-gray-400 resize-none"
                  rows="3"
                />
              </div>

              <div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-gray-700"
                  required
                >
                  <option value="" disabled>
                    Select A Category
                  </option>
                  {catData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category}
                    </option>
                  ))}
                </select>
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
