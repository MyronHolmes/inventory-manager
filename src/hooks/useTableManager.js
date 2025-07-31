import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getCookie } from "../utils/auth";
import { createColDef } from "../utils/colDef";
import { formatColumnName } from "../utils/format";

export const useTableManager = () => {
  const location = useLocation();
  const user = JSON.parse(getCookie("user"));

  // State
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [formDefs, setFormDefs] = useState({});
  const [title, setTitle] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  const fetchTableData = async () => {
    try {
      setTableLoading(true);
      const response = await fetch(`/api/auth${location.pathname}`);
      if (!response.ok) throw new Error("Failed to fetch table data");

      const tableData = await response.json();
      setFormDefs(tableData.definitions);
      setTitle(tableData.table);

      if (tableData.content.length > 0) {
        const rawCols = createColDef(tableData.content[0], location.pathname);
        const enhancedCols = enhanceColumns(rawCols, tableData.definitions);

        setColumnDefs(enhancedCols);
        setRowData(tableData.content);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTableLoading(false);
    }
  };

  const enhanceColumns = (columns, definitions) => {
    return columns.map((col) => {
      const fieldDef = definitions[col.field];
      if (!fieldDef) return col;
      const enhanced = { ...col };
      if (fieldDef.description.field === "select") {
        if (fieldDef.enum) {
          enhanced.cellEditorParams = { values: fieldDef.enum };
        }
        enhanced.valueFormatter = (params) => {
          const value = params.value;
          return formatColumnName(value);
        };
        if (
          Array.isArray(fieldDef.description?.options) &&
          fieldDef.description.options.length > 0 &&
          typeof fieldDef.description.options[0] === "object"
        ) {
          enhanced.cellEditorParams = {
            values: fieldDef.description?.options?.map((opt) => opt[col.field]),
          };
        }
      }
      return enhanced;
    });
  };

  const createRecord = useCallback(
    async (formData, onMessage) => {
      setOperationLoading(true);
      try {
        const response = await fetch(`/api/auth${location.pathname}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, created_by: user.id }),
        });

        const resData = await response.json();

        if (response.ok) {
          await fetchTableData();
          onMessage("success", resData.message);
          return { success: true };
        } else {
          const errorMessage = getErrorMessage(resData, formData, "Create");
          onMessage("fail", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
      } finally {
        setOperationLoading(false);
      }
    },
    [title, location.pathname, user.id]
  );

  const updateRecord = useCallback(
    async (recordData, onMessage) => {
      setOperationLoading(true);
      try {
        const response = await fetch(`/api/auth${location.pathname}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...recordData, updated_by: user.id }),
        });

        const resData = await response.json();

        if (response.ok) {
          await fetchTableData();
          onMessage("success", resData.message);
          return { success: true };
        } else {
          const errorMessage = getErrorMessage(
            resData,
            title,
            recordData,
            "Update"
          );
          onMessage("fail", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
      } finally {
        setOperationLoading(false);
      }
    },
    [title, location.pathname, user.id]
  );

  const deleteRecords = useCallback(
    async (rows, onMessage) => {
      setOperationLoading(true);
      try {
        const ids = rows.map((row) => row.id);

        const response = await fetch(`/api/auth${location.pathname}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        });

        const resData = await response.json();
        if (response.ok) {
          await fetchTableData();
          onMessage("success", resData.message);
          return { success: true };
        } else {
          onMessage("fail", `Failed to delete ${title.toLowerCase()}(s)`);
          return { success: false, error: "Delete failed" };
        }
      } catch (error) {
        console.error(error);
        onMessage("fail", "Network error occurred");
        return { success: false, error: error.message };
      } finally {
        setOperationLoading(false);
      }
    },
    [location.pathname]
  );

  // Helper function for error messages
  const getErrorMessage = (resData, data, operation) => {
    if (resData.error?.code === "23505") {
      return `'The ${title} '${data[title.toLowerCase()]}' Already Exists.`;
    }

    const operationText = operation === "Create" ? "Add" : operation;
    return `Failed To ${operationText} '${title}'.`;
  };

  // Initialize on mount
  useEffect(() => {
    fetchTableData();
  }, [location.pathname]);

  return {
    // Data
    rowData,
    setRowData,
    columnDefs,
    formDefs,
    title,

    // States
    tableLoading,
    error,
    operationLoading,

    // Operations
    createRecord,
    updateRecord,
    deleteRecords,
    refreshData: fetchTableData,
  };
};
