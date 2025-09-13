
import { PlusSquare, Link2, Users, Shapes, ArrowLeftRight, Trash2 } from "lucide-react";

export const Sidebar = () => {
	return (
		<aside className="h-full min-h-screen w-16 sm:w-56 bg-white border-r shadow-md flex flex-col items-center py-6 gap-6 fixed top-0 left-0 z-40 transition-all">
			<div className="flex flex-col items-center gap-4 w-full">
				<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group">
					<PlusSquare className="w-5 h-5 text-blue-600" />
					<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Agregar Clase</span>
				</button>
				<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group">
					<ArrowLeftRight className="w-5 h-5 text-blue-600" />
					<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Agregar Relación</span>
				</button>
				<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group">
					<Shapes className="w-5 h-5 text-blue-600" />
					<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Agregar Interfaz</span>
				</button>
				<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group">
					<Users className="w-5 h-5 text-blue-600" />
					<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Colaboradores</span>
				</button>
				<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-red-50 transition-colors group">
					<Trash2 className="w-5 h-5 text-red-600" />
					<span className="hidden sm:inline text-red-700 group-hover:text-red-800 font-medium">Eliminar</span>
				</button>
			</div>
			<div className="flex-1" />
			<button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-100 transition-colors group">
				<Link2 className="w-5 h-5 text-blue-600" />
				<span className="hidden sm:inline text-blue-700 group-hover:text-blue-900 font-medium">Compartir</span>
			</button>
		</aside>
	);
}

