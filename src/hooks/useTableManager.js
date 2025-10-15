import { useEffect, useState, useCallback } from "react";
import { createColDef } from "../utils/colDef";
import { formatColumnName } from "../utils/format";
import { apiRequest, getErrorMessage } from "../utils/fetchHelpers";

export const useTableManager = (location, user) => {
  // State
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [formDefs, setFormDefs] = useState({});
  const [title, setTitle] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [operationLoading, setOperationLoading] = useState(false);

  const getEditableValue = () => {
    if (location.pathname === "/users") {
      return user.role !== "admin" ? false : null;
    }
    return null;
  };

  const fetchTableData = async () => {
    try {
      setTableLoading(true);
      setError("");
      const response = await apiRequest(`/api${location.pathname}`);
      const tableData = await response.json();

      if (!response.ok) throw ("There was an erorr, " + tableData);
      
      setFormDefs(tableData.definitions);
      setTitle(tableData.table);

      if (tableData.content.length > 0) {
        const rawCols = createColDef(
          tableData.content[0],
          location.pathname,
          getEditableValue()
        );
        const enhancedCols = enhanceColumns(rawCols, tableData.definitions);

        setColumnDefs(enhancedCols);
        setRowData(tableData.content);
      }
    } catch (err) {
      console.log(err)
      setError(`${err.message}: ${err.info.message}`)
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
    async (formData, onMessage, name) => {
      setOperationLoading(true);
      try {
        const response = await apiRequest(`/api${location.pathname}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, created_by: user.id }),
        })
        
        const resData = await response.json();
        if (response.ok) {
          await fetchTableData();
          onMessage("success", resData.message);
          return { success: true };
        } else {
          const errorMessage = getErrorMessage(
            resData,
            name,
            "Create"
          );
          onMessage("fail", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err) {
        console.error(err);
        return { success: false, error: `${err.message}: ${err.info.message}` };
      } finally {
        setOperationLoading(false);
      }
    },
    [title, location.pathname, user.id]
  );

  const updateRecord = useCallback(
    async (recordData, onMessage, name) => {
      setOperationLoading(true);
      try {
        const response = await apiRequest(`/api${location.pathname}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...recordData, updated_by: user.id }),
        })

        const resData = await response.json();

        if (response.ok) {
          await fetchTableData();
          onMessage("success", resData.message);
          return { success: true };
        } else {
          const errorMessage = getErrorMessage(
            resData,
            name,
            "Update"
          );
          onMessage("fail", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        console.error(error);
        return {success: false, error: `${err.message}: ${err.info.message}` };
      } finally {
        setOperationLoading(false);
      }
    },
    [title, location.pathname, user.id]
  );

  const deleteRecords = useCallback(
    async (rows, onMessage, name) => {
      setOperationLoading(true);
      try {
        const ids = rows.map((row) => row.id);

        const response = await apiRequest(`/api${location.pathname}`, {
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
          const errorMessage = getErrorMessage(resData, name, "Delete");
          onMessage("fail", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err) {
        console.error(err);
        onMessage("fail", err.message);
        return { success: false, error: `${err.message}: ${err.info.message}` };
      } finally {
        setOperationLoading(false);
      }
    },
    [location.pathname]
  );

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
