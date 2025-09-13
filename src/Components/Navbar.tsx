
import { Link } from "react-router-dom";
import { User, Share2, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
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
        <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm text-sm font-medium">
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Generar link colaboración</span>
        </button>
      </div>
    </nav>
  );
}
