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

export const parseTimestamp = (value) => {
  if (!value) return null;
  
  // Handle format: "2025-10-22 03:00:55.536795" (space separator)
  // Convert to: "2025-10-22T03:00:55.536795" (ISO format)
  const normalized = value.includes('T') 
    ? value 
    : value.replace(' ', 'T');
  
  const date = new Date(normalized);
  return isNaN(date) ? null : date;
}