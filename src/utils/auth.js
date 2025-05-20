export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString(); // 86400000 ms = 1 day
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

export function removeCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}
