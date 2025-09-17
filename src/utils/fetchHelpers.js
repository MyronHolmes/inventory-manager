export function refreshRowData(route, table, setData) {
  fetch(`/api/auth${route}`)
    .then((res) => res.json())
    .then((data) => setData(data[table]))
    .catch((err) => console.error(`Failed to fetch ${route}:`, err));
}
export const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw { status: response.status, error };
  }

  return response.json();
};

  // Helper function for error messages
  export const getErrorMessage = (resData, name, operation) => {
    if (resData.error?.code === "23505") {
      return `This ${name} Already Exists.`;
    }
    if (resData.error?.code === "23503") {
      return `This ${name} Has Connections To Other Tables.`;
    }

    const operationText = operation === "Create" ? "Add" : operation;
    return `Failed To ${operationText} ${name}.`;
  };