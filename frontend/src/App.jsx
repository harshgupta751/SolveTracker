import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore  from '@/store/authStore';
import useThemeStore from '@/store/themeStore';

import Landing           from '@/pages/Landing';
import Login             from '@/pages/Login';
import Register          from '@/pages/Register';
import StudentDashboard  from '@/pages/student/Dashboard';
import MySheets          from '@/pages/student/MySheets';
import Progress          from '@/pages/student/Progress';
import TeacherDashboard  from '@/pages/teacher/Dashboard';
import CreateSheet       from '@/pages/teacher/CreateSheet';
import SheetEditor       from '@/pages/teacher/SheetEditor';
import StudentView       from '@/pages/teacher/StudentView';
import Leaderboard       from '@/pages/Leaderboard';
import AppLayout         from '@/components/layout/AppLayout';

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (token && user) return <Navigate to={`/${user.role}`} replace />;
  return children;
};

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<PublicRoute><Landing  /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><Login    /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Student layout */}
      <Route path="/student" element={<PrivateRoute role="student"><AppLayout /></PrivateRoute>}>
        <Route index            element={<StudentDashboard />} />
        <Route path="sheets"    element={<MySheets />} />
        <Route path="progress"  element={<Progress />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Teacher layout */}
      <Route path="/teacher" element={<PrivateRoute role="teacher"><AppLayout /></PrivateRoute>}>
        <Route index                        element={<TeacherDashboard />} />
        <Route path="create-sheet"          element={<CreateSheet />} />
        <Route path="edit-sheet/:sheetId"   element={<SheetEditor />} />
        <Route path="student/:studentId"    element={<StudentView />} />
        <Route path="leaderboard"           element={<Leaderboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}