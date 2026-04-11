import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Teachers from './pages/Teachers';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ModulePage from './pages/ModulePage';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public auth routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected routes — require authentication */}
            <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="module/:slug" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
            <Route path="teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
