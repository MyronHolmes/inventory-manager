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
