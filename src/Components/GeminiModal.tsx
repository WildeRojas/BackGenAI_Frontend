import React, { useState } from "react";
import { generateCode, generateClassDiagram } from "../Services/GoogleGemini";
import type { UMLClass, UMLRelation } from "../Interfaces/proyectos";

interface GeminiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateCode?: (text: string) => void;
    onGenerateDiagram?: (classes: UMLClass[], relations: UMLRelation[]) => void;
}

export const GeminiModal: React.FC<GeminiModalProps> = ({ isOpen, onClose, onGenerateCode, onGenerateDiagram }) => {

    const [prompt, setPrompt] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'code' | 'diagram'>('code');

    const handleGenerate = async (): Promise<void> => {
        if (!prompt.trim()) return;
        setLoading(true);
        setError(null);
        setOutput("");

        try {
            if (mode === 'code') {
                const text = await generateCode(prompt);
                setOutput(text);
                onGenerateCode?.(text);
            } else {
                const diagramData = await generateClassDiagram(prompt);
                setOutput(JSON.stringify(diagramData, null, 2));
                
                // Aplicar automáticamente al canvas si está disponible
                if (onGenerateDiagram) {
                    onGenerateDiagram(diagramData.classes, diagramData.relations);
                }
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Error al generar";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyOutput = async (): Promise<void> => {
        if (!output) return;
        await navigator.clipboard.writeText(output);
    };

    const downloadOutput = (): void => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "codigo_generado.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
                    <div className="px-5 py-4 border-b flex-shrink-0">
                        <h2 className="text-lg font-semibold">Generador de Código con IA</h2>
                    </div>

                    <div className="px-5 py-4 space-y-3 flex-1 overflow-y-auto">
                        {/* Selector de modo */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                ¿Qué quieres generar?
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setMode('code')}
                                    className={`px-3 py-1 rounded text-xs ${mode === 'code' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Código
                                </button>
                                <button
                                    onClick={() => setMode('diagram')}
                                    className={`px-3 py-1 rounded text-xs ${mode === 'diagram' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Diagrama de Clases
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                {mode === 'code' 
                                    ? 'Describe el código que quieres generar'
                                    : 'Describe el sistema para crear el diagrama de clases'}
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'code' 
                                    ? "Ej: Crea una clase Usuario con atributos id:int, nombre:string…"
                                    : "Ej: Sistema de asistencia para un colegio con estudiantes, profesores, materias y asistencias"}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                rows={4}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !prompt.trim()}
                            className={`w-full ${mode === 'code' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors`}
                        >
                            {loading ? "Generando..." : `Generar ${mode === 'code' ? 'Código' : 'Diagrama'}`}
                        </button>

                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        
                        {/* Mensaje de éxito para diagramas */}
                        {mode === 'diagram' && output && !error && !loading && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <p className="text-green-800 text-sm">
                                    ✅ Diagrama generado exitosamente. {onGenerateDiagram ? 'Se aplicará automáticamente al canvas.' : 'Usa el botón "Aplicar al Canvas" para visualizarlo.'}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Resultado
                            </label>
                            <div className="relative">
                                <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs overflow-auto h-64 font-mono whitespace-pre-wrap">
                                    {output || (loading ? "..." : "Sin resultados")}
                                </pre>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={copyOutput}
                                        disabled={!output}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs"
                                    >
                                        Copiar
                                    </button>
                                    <button
                                        onClick={downloadOutput}
                                        disabled={!output}
                                        className="bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-xs"
                                    >
                                        Descargar
                                    </button>
                                    {mode === 'diagram' && output && (
                                        <button
                                            onClick={() => {
                                                try {
                                                    const parsed = JSON.parse(output);
                                                    if (onGenerateDiagram && parsed.classes && parsed.relations) {
                                                        onGenerateDiagram(parsed.classes, parsed.relations);
                                                    }
                                                } catch (error) {
                                                    console.error('Error al aplicar diagrama:', error);
                                                    alert('Error al aplicar diagrama: JSON inválido');
                                                }
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs"
                                        >
                                            Aplicar al Canvas
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-3 border-t flex justify-end flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="text-sm text-gray-600 hover:text-gray-800"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
