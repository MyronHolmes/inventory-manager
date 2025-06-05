export function formatColumnName(key){
  return key
    .replace(/([A-Z])/g, " $1") 
    .replace(/^./, (str) => str.toUpperCase()); 
}

export function reverseFormatColumnName(key){
  const words = key.trim().split(" ");
  return words[0].toLowerCase() + words.slice(1).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join("");
}