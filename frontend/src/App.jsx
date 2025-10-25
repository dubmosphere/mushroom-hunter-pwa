import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SpeciesExplorer from './pages/SpeciesExplorer';
import SpeciesDetail from './pages/SpeciesDetail';
import MyFindings from './pages/MyFindings';
import FindingsMap from './pages/FindingsMap';
import AddFinding from './pages/AddFinding';
import FindingDetail from './pages/FindingDetail';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="species" element={<SpeciesExplorer />} />
        <Route path="species/:id" element={<SpeciesDetail />} />
        <Route path="findings" element={<MyFindings />} />
        <Route path="findings/new" element={<AddFinding />} />
        <Route path="findings/:id" element={<FindingDetail />} />
        <Route path="map" element={<FindingsMap />} />
      </Route>
    </Routes>
  );
}

export default App;
