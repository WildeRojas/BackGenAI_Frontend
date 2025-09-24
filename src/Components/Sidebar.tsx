import { ArrowLeftRight, Link2, PlusSquare, Shapes, Trash2, Users } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
	onAddNode?: () => void;
	onSelectRelation?: (relationType: string) => void;
}


const RELATION_TYPES = [
	{ key: "association", label: "Asociación" },
	{ key: "inheritance", label: "Herencia" },
	{ key: "aggregation", label: "Agregación" },
	{ key: "composition", label: "Composición" },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode, onSelectRelation }) => {
	const [relationOpen, setRelationOpen] = useState(false);

	return (
		<aside className="h-full min-h-screen w-16 sm:w-56 bg-white border-r shadow-md flex flex-col items-center py-6 gap-6 fixed top-0 left-0 z-40 transition-all">
			<div className="flex flex-col items-center gap-4 w-full">
				<button
					onClick={onAddNode}
					className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group"
				>
					<PlusSquare className="w-5 h-5 text-blue-600" />
					<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Agregar Clase</span>
				</button>

				{/* Menú desplegable de relaciones */}
				<div className="relative w-full">
					<button
						onClick={() => setRelationOpen((v) => !v)}
						className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors group justify-between"
					>
						<span className="flex items-center gap-2">
							<ArrowLeftRight className="w-5 h-5 text-blue-600" />
							<span className="hidden sm:inline text-gray-700 group-hover:text-blue-700 font-medium">Agregar Relación</span>
						</span>
						<svg className={`w-4 h-4 ml-2 transition-transform ${relationOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
					</button>
					{relationOpen && (
						<div className="absolute left-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
							{RELATION_TYPES.map((rel) => (
								<button
									key={rel.key}
									onClick={() => {
										if (onSelectRelation) {
											onSelectRelation(rel.key);
										}
										setRelationOpen(false);
									}}
									className="w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-700"
								>
									{rel.label}
								</button>
							))}
						</div>
					)}
				</div>

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

