import { Dashboard } from "./pages/Dashboard";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Users from "./pages/Users";
import Colors from "./pages/Colors";
import AccessDenied from "./pages/AccessDenied";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import NavBar from "./components/NavBar";
import { getCookie } from "./utils/auth";
import Categories from "./pages/Categories";
import Sizes from "./pages/Sizes";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";

function AppWrapper() {
  const location = useLocation();
  const hideNavOnPaths = ["/login"];
  const authenticated = JSON.parse(getCookie("user"));
  const authorized = authenticated?.role;

  return (
    <>
      {!hideNavOnPaths.includes(location.pathname) && authenticated && (
        <NavBar />
      )}

      <Routes>
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/" replace /> : <Login />}
        />

        {authenticated ? (
          <>
            <Route index element={<Dashboard />} />
            <Route path="/logout" element={<Logout />} />
            <Route
              path="/users"
              element={
                ["admin", "manager"].includes(authorized) ? (
                  <Users />
                ) : (
                  <AccessDenied />
                )
              }            />
            <Route
              path="/colors"
              element={
                ["admin", "manager"].includes(authorized) ? (
                  <Colors />
                ) : (
                  <AccessDenied />
                )
              }
            />
            <Route
              path="/categories"
              element={
                ["admin", "manager"].includes(authorized) ? (
                  <Categories />
                ) : (
                  <AccessDenied />
                )
              }
            />
            <Route
              path="/sizes"
              element={
                ["admin", "manager"].includes(authorized) ? (
                  <Sizes />
                ) : (
                  <AccessDenied />
                )
              }
            />
            <Route
              path="/products"
              element={
                ["admin", "manager"].includes(authorized) ? (
                  <Products />
                ) : (
                  <AccessDenied />
                )
              }
            />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
