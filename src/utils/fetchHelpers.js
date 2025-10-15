export function refreshRowData(route, table, setData) {
  apiRequest(`/api/${route}`)
    .then((res) => res.json())
    .then((data) => setData(data[table]))
    .catch((err) => console.error(`Failed to fetch ${route}:`, err));
}

// Helper function for error messages
export const getErrorMessage = (resData, name, operation) => {
  const operationText = operation === "Create" ? "Add" : operation;
  return `Failed To ${operationText} ${name}: ${resData.message}, \n ${resData.info.message}`;
};

const API_URL = import.meta.env.VITE_API;

export const apiRequest = async (endpoint, options = {}) => {
  try{

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add Authorization header if token exists
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

    // Handle 401 - redirect to login if token expired
    if (response.status === 401) {
      const resData = await response.json()
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      console.log(resData)
      throw new Error("Session Expired");
    }

  return response;
} catch (err) {
  console.log(err)
}
};
