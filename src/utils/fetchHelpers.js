export function refreshRowData(route, table, setData) {
  fetch(`/api/${route}`)
    .then((res) => res.json())
    .then((data) => setData(data[table]))
    .catch((err) => console.error(`Failed to fetch ${route}:`, err));
}

  // Helper function for error messages
  export const getErrorMessage = (resData, name, operation) => {

    const operationText = operation === "Create" ? "Add" : operation;
    return `Failed To ${operationText} ${name}: ${resData.message}, \n ${resData.info.message}`;
  };