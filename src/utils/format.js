export function formatColumnName(key){
  return key
    .split('_' || " ")                               
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) 
    .join(' ');
}

export function reverseFormatColumnName(key){
  const words = key.trim().split(" ");
  return words[0].toLowerCase() + words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join("");
}

export function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const parseDescription = (properties) => {
    const definitions = Object.entries(properties)
    .filter(([columnName, columnDef]) => {
      // Only include if description exists and doesn't start with "Note:"
      return columnDef.description && !columnDef.description.startsWith('Note:');
    })
    .reduce((acc, [columnName, columnDef]) => {      
      try {
        // Parse the JSON description
        columnDef.description = JSON.parse(columnDef.description);
      } catch (error) {
        console.log(`Failed to parse JSON for ${columnName}:`, error.message);
        // Skip columns that don't have valid JSON descriptions
        return acc;
      }
      
      // Merge the parsed data directly into the column definition
      acc[columnName] = {
        ...columnDef,
      };
      return acc;
    }, {});
    return definitions
}