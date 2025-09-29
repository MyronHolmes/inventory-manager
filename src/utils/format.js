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

