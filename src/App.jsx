import { Dashboard } from './pages/Dashboard';
import Login from './pages/Login';
import Logout from './pages/Logout';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NotFound from './pages/NotFound';
import NavBar from './components/NavBar';
import { getCookie } from './utils/auth';

function AppWrapper() {
  const location = useLocation();
  const hideNavOnPaths = ['/login'];
  const authenticated = getCookie("user");

  return (
    <>
      {!hideNavOnPaths.includes(location.pathname) && authenticated && <NavBar />}

      <Routes>
        <Route path="/login" element={
          authenticated ? <Navigate to="/" replace /> : <Login />
        } />

        {authenticated ? (
          <>
            <Route index element={<Dashboard />} />
            <Route path="/logout" element={<Logout />} />
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
