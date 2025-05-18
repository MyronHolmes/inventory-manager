import { Dashboard } from './pages/Dashboard'
import Login from './pages/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NotFound from './pages/NotFound'

function App() {
return (
<>
<BrowserRouter>
<Routes>
    <Route index element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="*" element={<NotFound />} />
</Routes>
</BrowserRouter>
</>

)
}

export default App
