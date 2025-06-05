import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 
import { myTheme } from "../utils/tableConfig";
import { createColDef } from "../utils/colDef";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Users() {
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  useEffect(() => {
    fetch("/api/auth/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users.length > 0) {
          setColumnDefs(createColDef(data.users[0], "users"));
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
    <div className="ag-theme-alpine p-4" style={{ height: 600, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={myTheme}
      />
    </div>
  );
}
