import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import CataloguePage from './CataloguePage';
import MediaPage from './MediaPage';
import UsersPage from './UsersPage';
import './admin.css';

export default function AdminSpace() {
  return (
    <div className="admin-space">
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="utilisateurs" element={<UsersPage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="mediatheque" element={<MediaPage />} />
        <Route path="*" element={<Navigate to="/administration" replace />} />
      </Routes>
    </div>
  );
}
