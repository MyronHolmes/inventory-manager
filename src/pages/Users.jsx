import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Users() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  useEffect(() => {
    fetch("/api/auth/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users.length > 0) {
          setColumnDefs(
            Object.keys(data.users[0]).map((key) => ({
              field: key,
              headerName: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
              sortable: true,
              filter: true,
              editable: false,
            }))
          );
          setRowData(data.users);
        }
      });
  }, []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    filter: true,
    sortable: true,
  }), []);

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      />
    </div>
  );
}
