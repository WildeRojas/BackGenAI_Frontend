
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Share2, LayoutDashboard, LogOut, Copy, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { connectWebSocket, sendMessage } from "../Services/webSocket";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCollabMenu, setShowCollabMenu] = useState(false);
  const [collaborationLink, setCollaborationLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };



  const generateCollaborationLink = async () => {
    try {
      // Generar un ID único para la sesión colaborativa
      const sessionId = crypto.randomUUID();
      const link = `${window.location.origin}/disenio?session=${sessionId}`;

      // Conectar al WebSocket para la colaboración
      await connectWebSocket(sessionId);

      // Enviar mensaje de nueva sesión
      sendMessage({
        type: 'session_created',
        sessionId: sessionId,
        user: user?.username || 'Usuario'
      });

      setCollaborationLink(link);
      setShowCollabMenu(true);
    } catch (error) {
      console.error('Error generating collaboration link:', error);
      alert('Error al generar el link de colaboración');
    }
  };




  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(collaborationLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-2 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="text-blue-600 w-7 h-7" />
        <Link to="/" className="text-xl font-bold text-blue-700 tracking-tight select-none">Class Diagramador</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/perfil" className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors">
          <User className="w-5 h-5" />
          <span className="hidden sm:inline">Perfil</span>
        </Link>

        {/* Menú de colaboración */}
        <div className="relative">
          <button
            onClick={generateCollaborationLink}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">Generar link colaboración</span>
          </button>

          {/* Dropdown del link de colaboración */}
          {showCollabMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Link de Colaboración</h3>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                <input
                  type="text"
                  value={collaborationLink}
                  readOnly
                  className="flex-1 text-sm bg-transparent border-none outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copiar link"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">Comparte este link para colaborar en tiempo real</p>
              <button
                onClick={() => setShowCollabMenu(false)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        {/* El botón de Gemini AI ahora se maneja en Diagrama.tsx */}

        {/* Botón de logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-700 hover:text-red-600 transition-colors p-2 rounded"
          title="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      {/* Overlay para cerrar los menús */}
      {(showCollabMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowCollabMenu(false);
          }}
        />
      )}
    </nav>
  );
}
