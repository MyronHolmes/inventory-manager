// helper function used to create a user cookie object
export function userCookieObj(user) {
  const userCookie = {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
  };
  return userCookie;
}

export const makeRequest = async (route, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    ...options.headers,
  };

  // Only add Supabase auth headers if the key exists and is not empty
  if (process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY !== undefined && process.env.SUPABASE_ANON_KEY !== "") {
    headers["apikey"] = process.env.SUPABASE_ANON_KEY;
    headers["Authorization"] = `Bearer ${process.env.SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(route, {
    headers,
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.log(response);
    throw { info: {...error, status: response.status, route} };
  }

  return response.json();
};