import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ChecklistPage from './pages/ChecklistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// App is the top-level shell: it sets up routing and decides which page to show.
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/checklist" replace />} />
        <Route path="/checklist" element={<ChecklistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
