import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './Components/Navbar';
import { Sidebar } from './Components/Sidebar';
import { Perfil } from './Pages/Perfil';
import { Diagrama } from './Pages/Diagrama';

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-16 sm:ml-56 min-h-screen bg-gray-50">
          <Navbar />
          <main className="p-4 pt-8">
            <Routes>
              <Route path="/" element={<Diagrama />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
