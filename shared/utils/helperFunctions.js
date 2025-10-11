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

