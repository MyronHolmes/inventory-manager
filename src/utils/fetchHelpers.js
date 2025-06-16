export function refreshRowData(route, table, setData) {
  fetch(`/api/auth${route}`)
    .then((res) => res.json())
    .then((data) => setData(data[table]))
    .catch((err) => console.error(`Failed to fetch ${route}:`, err));
}
