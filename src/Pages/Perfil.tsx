import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Edit2, Save, Image, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  // Datos de usuario de ejemplo (normalmente vendrían de un estado global o API)
  const [profile, setProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+598 99 123 456',
    location: 'Montevideo, Uruguay',
    company: 'Universidad ORT',
    bio: 'Estudiante de Ingeniería de Software apasionado por el diseño de diagramas UML y arquitectura de software.',
    projectsCount: 12,
    followers: 48,
    following: 36,
  });

  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const navigate = useNavigate();

  const handleEditToggle = () => {
    if (editing) {
      // Guardar cambios
      setProfile(editedProfile);
    }
    setEditing(!editing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value,
    });
  };

  const handleLogout = () => {
    // Eliminar datos de sesión
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado de perfil */}
      <div className="bg-indigo-700 h-48 relative">
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end pb-4">
              <div className="flex items-end">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                  <div className="w-full h-full bg-indigo-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4 mb-2">
                  <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                  <p className="text-indigo-200">{profile.email}</p>
                </div>
              </div>
              <div className="flex space-x-2 mb-2">
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-white text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-50"
                  onClick={handleEditToggle}
                >
                  {editing ? (
                    <>
                      <Save className="h-4 w-4" />
                      Guardar
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Editar
                    </>
                  )}
                </button>
                <button
                  className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg shadow-sm hover:bg-red-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel izquierdo */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={editedProfile.name}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={editedProfile.email}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        value={editedProfile.phone}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={editedProfile.location}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa/Universidad</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="company"
                        value={editedProfile.company}
                        onChange={handleInputChange}
                        className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
                    <textarea
                      name="bio"
                      value={editedProfile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{profile.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{profile.company}</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Biografía</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{profile.projectsCount}</div>
                  <div className="text-sm text-gray-600">Proyectos</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{profile.followers}</div>
                  <div className="text-sm text-gray-600">Seguidores</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{profile.following}</div>
                  <div className="text-sm text-gray-600">Siguiendo</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Panel derecho */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mis Proyectos Recientes</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((project) => (
                  <div key={project} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-indigo-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image className="h-12 w-12 text-indigo-300" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">Diagrama UML {project}</h3>
                      <p className="text-sm text-gray-600 mt-1">Actualizado hace {project * 2} días</p>
                      <div className="flex justify-between mt-3">
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Clase</span>
                        <button className="text-indigo-600 text-sm hover:underline">Ver</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Ver todos mis proyectos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;