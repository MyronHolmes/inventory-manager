// helper function used for making a request and returning the data object or throwing a error message
export const makeRequest = async (route, options = {}) => {
  const response = await fetch(route, {
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json();
    console.log(response)
    throw { info: {...error, status: response.status, route} };
  }

  return response.json();
};

// helper function used to parse table descriptions 
export const parseDescription = (properties) => {
    const definitions = Object.entries(properties)
    .filter(([columnName, columnDef]) => {
      return columnDef.description && !columnDef.description.startsWith('Note:');
    })
    .reduce((acc, [columnName, columnDef]) => {      
      try {
        columnDef.description = JSON.parse(columnDef.description);
      } catch (error) {
        console.error(`Failed to parse JSON for ${columnName}:`, error.message);
        return acc;
      }
      
      acc[columnName] = {
        ...columnDef,
      };
      return acc;
    }, {});
    return definitions
}

// helper function used to capitalize the first letter in a string
export function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

