import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { myTheme } from "../utils/tableConfig";
import { createColDef } from "../utils/colDef";
import { getCookie } from "../utils/auth";
import { refreshRowData } from "../utils/fetchHelpers";
import Button from "../components/Button";
import Notification from "../components/Notification";
import { capitalizeWords, formatColumnName } from "../utils/format";
import { Trash2 } from "lucide-react";
import { Modal } from "../components/Modal";
import { Form } from "../components/Form";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Products() {
  const user = JSON.parse(getCookie("user"));
  const location = useLocation();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [formDefs, setFormDefs] = useState([]);
  const [title, setTitle] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState([]);
  const [messageType, setMessageType] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    description: "",
    category: "",
    status: "",
    quanity: 0,
    updated_by: user.id,
  });

  useEffect(() => {
    fetch("/api/auth/products")
      .then((res) => res.json())
      .then((prodData) => {
        setFormDefs(prodData.definitions);
        setTitle(prodData.table);
        const categoryArray =
          prodData.definitions.category.description.categoryOptions.map(
            (cat) => cat.category
          );
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
                  values: prodData.definitions.status.enum,
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
      quanity: 0,
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
          {title} Management
        </h1>
        <Button
          context={"+ Add " + title}
          bgColor="orange"
          textColor="white"
          onClick={setIsModalOpen}
        ></Button>
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
        <Button
          context={<Trash2 />}
          bgColor="red"
          textColor="white"
          onClick={onDelete}
          selectedRows={selectedRows}
        ></Button>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <Modal title={"Add New " + title} onClose={closeModal}>
          <Form
            title={title}
            formData={formData}
            definitions={formDefs}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onClose={closeModal}
          ></Form>
        </Modal>
      )}
    </div>
  );
}
