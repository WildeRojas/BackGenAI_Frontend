import { GoogleGenAI } from "@google/genai";
import type { UMLClass, UMLRelation } from "../Interfaces/proyectos";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function generateCode(prompt: string): Promise<string> {
  const model = "gemini-2.5-flash"; // O usa "gemini-pro" si tienes acceso
  const result = await genAI.models.generateContent({
    model,
    contents: [prompt]
  });
  // El resultado puede variar según la versión, revisa la estructura
  return result.text || "No response";
}

export async function generateClassDiagram(prompt: string): Promise<{ classes: UMLClass[], relations: UMLRelation[] }> {
  const enhancedPrompt = `
Eres un experto en diseño de bases de datos y diagramas UML. Crea un diagrama de clases para: ${prompt}

EJEMPLO DE RESPUESTA ESPERADA para "Sistema de asistencia para un colegio":
{
  "classes": [
    {
      "id": "1",
      "nombre": "Estudiante",
      "atributos": [
        { "nombre": "id", "tipo": "Int" },
        { "nombre": "nombre", "tipo": "string" },
        { "nombre": "apellido", "tipo": "string" },
        { "nombre": "email", "tipo": "string" },
        { "nombre": "fechaNacimiento", "tipo": "date" }
      ],
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "2", 
      "nombre": "Profesor",
      "atributos": [
        { "nombre": "id", "tipo": "Int" },
        { "nombre": "nombre", "tipo": "string" },
        { "nombre": "apellido", "tipo": "string" },
        { "nombre": "especialidad", "tipo": "string" }
      ],
      "position": { "x": 400, "y": 100 }
    },
    {
      "id": "3",
      "nombre": "Materia", 
      "atributos": [
        { "nombre": "id", "tipo": "Int" },
        { "nombre": "nombre", "tipo": "string" },
        { "nombre": "codigo", "tipo": "string" },
        { "nombre": "creditos", "tipo": "Int" }
      ],
      "position": { "x": 700, "y": 100 }
    },
    {
      "id": "4",
      "nombre": "Asistencia",
      "atributos": [
        { "nombre": "id", "tipo": "Int" },
        { "nombre": "fecha", "tipo": "date" },
        { "nombre": "presente", "tipo": "boolean" },
        { "nombre": "observaciones", "tipo": "string" }
      ],
      "position": { "x": 250, "y": 400 }
    }
  ],
  "relations": [
    {
      "id": "rel1",
      "source": "1",
      "target": "4", 
      "type": "association",
      "sourceCardinality": "1..1",
      "targetCardinality": "0..*"
    },
    {
      "id": "rel2",
      "source": "2",
      "target": "3",
      "type": "association", 
      "sourceCardinality": "1..*",
      "targetCardinality": "1..*"
    },
    {
      "id": "rel3",
      "source": "3",
      "target": "4",
      "type": "association",
      "sourceCardinality": "1..*", 
      "targetCardinality": "0..*"
    }
  ]
}

INSTRUCCIONES:
- Responde SOLO con un JSON válido siguiendo la estructura exacta del ejemplo
- Tipos de atributos válidos: "string", "Int", "float", "boolean", "date"
- Tipos de relaciones válidas: "association", "inheritance", "aggregation", "composition"
- UTILIZA ESTAS Cardinalidades válidas: "1..1", "0..1", "1..*", "0..*"
- Genera entre 4-7 clases relacionadas
- Posiciona las clases en diferentes ubicaciones (x entre 50-800, y entre 50-600)
- Incluye relaciones lógicas entre las clases
- NO agregues explicaciones, comentarios o texto adicional, solo el JSON

AHORA GENERA EL DIAGRAMA PARA: ${prompt}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [enhancedPrompt]
  });

  const response = result.text || "{}";
  
  try {
    // Limpiar la respuesta de posibles markdown o texto extra
    let cleanJson = response.replace(/```json\s*|\s*```/g, '').trim();
    
    // Buscar el JSON dentro del texto si hay texto adicional
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }
    
    const parsed = JSON.parse(cleanJson);
    
    return {
      classes: parsed.classes || [],
      relations: parsed.relations || []
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw response:', response);
    throw new Error('La IA no devolvió un JSON válido. Intenta reformular tu prompt.');
  }
}