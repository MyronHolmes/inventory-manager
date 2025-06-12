export function refreshRowData(route, setData) {
  fetch(`/api/auth${route}`)
    .then((res) => res.json())
    .then((data) => setData(data.colors))
    .catch((err) => console.error(`Failed to fetch ${route}:`, err));
}
