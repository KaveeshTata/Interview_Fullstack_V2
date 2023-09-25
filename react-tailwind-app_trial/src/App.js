import './App.css';
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoginPage from './pages/Login';
import PasswordresetPage from './pages/Passwordreset';
import UserHomepage from './pages/userHome';
import UserRegistrationePage from './pages/Userregistration';
import AdminHomepage from './pages/adminHome';
import Dashboardpage from './pages/Dashboard';
import Resultspage from './pages/Results';
import Audiopage from './pages/Audio';
import Videopage from './pages/Video';

function App() {
  return (
    <div className="min-h-full h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/passwordreset" element={<PasswordresetPage />} />
            <Route path="/userhome" element={<UserHomepage />} />
            <Route path="/results" element={<Resultspage />} />
            <Route path="/adminhome" element={<AdminHomepage />} />
            <Route path="/userregistration" element={<UserRegistrationePage />} />
            <Route path="/dashboard" element={<Dashboardpage />} />
            <Route path="/audio" element={<Audiopage />} />
            <Route path="/video" element={<Videopage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;