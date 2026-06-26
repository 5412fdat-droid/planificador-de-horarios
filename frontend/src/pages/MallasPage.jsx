import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Monitor, Calculator, Leaf, BookOpen, Layers, Factory, ArrowRight, AlertCircle, Search } from 'lucide-react';

// Mapeo estático de iconos y colores por sigla de carrera para mantener el diseño UI moderno
const careerStyles = {
  'SIS': { icon: Monitor, color: 'blue' },
  'CON': { icon: Calculator, color: 'blue' },
  'AGRO': { icon: Leaf, color: 'blue' },
  'IND-AL': { icon: Factory, color: 'blue' }
};

const MallasPage = () => {
  const [carreras, setCarreras] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [activeCareerId, setActiveCareerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para la materia seleccionada y su interactividad
  const [selectedMateria, setSelectedMateria] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carrerasRes, materiasRes] = await Promise.all([
        api.get('admin/carreras/'),
        api.get('admin/materias/')
      ]);
      
      setCarreras(carrerasRes.data);
      setMaterias(materiasRes.data);
      
      if (carrerasRes.data.length > 0) {
        setActiveCareerId(carrerasRes.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extraer las siglas de los prerrequisitos del texto en bruto de la BD
  const getPrerequisiteSiglas = (reqText) => {
    if (!reqText || reqText === 'Ninguno' || reqText.toLowerCase().includes('modalidad') || reqText.toLowerCase().includes('todas las')) return [];
    // Busca patrones que parezcan siglas (ej. MAT-100, MAT100, etc)
    const regex = /[A-Z]{2,4}[-\s]?\d{3}/g;
    const matches = reqText.toUpperCase().match(regex) || [];
    return matches.map(s => s.replace(/\s+/g, '-').replace(/([A-Z]+)(\d+)/, '$1-$2')); // Normalizar a formato XXX-000 si es posible
  };

  // Lógica interactiva
  const isPrerequisite = (materia) => {
    if (!selectedMateria) return false;
    const reqs = getPrerequisiteSiglas(selectedMateria.requisito_texto);
    // Verificamos si la sigla de la materia evaluada está en los requisitos de la seleccionada
    return reqs.some(req => materia.sigla_materia.replace(/\s+/g, '').replace('-', '').includes(req.replace('-', '')) || req.includes(materia.sigla_materia));
  };

  const isDependent = (materia) => {
    if (!selectedMateria) return false;
    const reqs = getPrerequisiteSiglas(materia.requisito_texto);
    // Verificamos si la materia seleccionada está en los requisitos de la materia evaluada
    return reqs.some(req => selectedMateria.sigla_materia.replace(/\s+/g, '').replace('-', '').includes(req.replace('-', '')) || req.includes(selectedMateria.sigla_materia));
  };

  const handleMateriaClick = (materia) => {
    if (selectedMateria?.id === materia.id) {
      setSelectedMateria(null); // Deseleccionar si se hace click en la misma
    } else {
      setSelectedMateria(materia);
    }
  };

  // Filtrar y agrupar materias para la carrera activa
  const activeCarrera = carreras.find(c => c.id === activeCareerId);
  const activeColor = activeCarrera ? (careerStyles[activeCarrera.sigla_carrera]?.color || 'blue') : 'blue';
  
  const materiasActivas = materias.filter(m => (m.carrera_id === activeCareerId || m.carrera === activeCareerId));
  
  const materiasFiltradas = materiasActivas.filter(m => 
    m.nombre_materia.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.sigla_materia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.requisito_texto && m.requisito_texto.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Agrupar por semestre
  const semestresDict = {};
  materiasFiltradas.forEach(m => {
    const periodo = parseInt(m.periodo_materia) || 99; // 99 para las que no tienen periodo claro
    if (!semestresDict[periodo]) semestresDict[periodo] = [];
    semestresDict[periodo].push(m);
  });

  const mallasAgrupadas = Object.keys(semestresDict).sort((a, b) => parseInt(a) - parseInt(b)).map(periodo => ({
    semestre: `Semestre ${periodo}`,
    materias: semestresDict[periodo]
  }));

  // Helper para asignar color a la fila de la tabla dependiendo del estado
  const getRowClassName = (materia) => {
    const isSelected = selectedMateria?.id === materia.id;
    const req = isPrerequisite(materia);
    const dep = isDependent(materia);

    if (isSelected) return `bg-blue-200 border-l-4 border-blue-600 shadow-sm relative z-10 scale-[1.01] transition-all`;
    if (req) return `bg-orange-200 border-l-4 border-orange-500 transition-all`;
    if (dep) return `bg-emerald-200 border-l-4 border-emerald-500 transition-all`;
    
    // Si hay una materia seleccionada pero esta no es nada, opacarla un poco
    if (selectedMateria) return `opacity-40 hover:opacity-100 transition-opacity bg-white border-l-4 border-transparent`;
    
    return `hover:bg-slate-50 transition-colors border-l-4 border-transparent bg-white`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-8 justify-between sticky top-20 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Mallas Curriculares</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Planes de Estudio Vigentes</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Consulta el pensum actualizado de cada carrera. 
            <strong className="text-white"> ¡Haz click en cualquier materia!</strong> El sistema iluminará en <span className="text-orange-400">naranja</span> los prerrequisitos que necesitas aprobar antes, y en <span className="text-emerald-400">verde</span> las materias posteriores que desbloquearás.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Career Selector Tabs */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {carreras.map((carrera) => {
                const style = careerStyles[carrera.sigla_carrera] || { icon: BookOpen, color: 'blue' };
                const Icon = style.icon;
                const isActive = activeCareerId === carrera.id;
                
                return (
                  <button
                    key={carrera.id}
                    onClick={() => { setActiveCareerId(carrera.id); setSelectedMateria(null); }}
                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all shadow-sm ${
                      isActive 
                      ? `border-${style.color}-500 bg-white shadow-md transform -translate-y-1` 
                      : 'border-transparent bg-white hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                      isActive ? `bg-${style.color}-600 text-white` : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className={`font-bold text-center leading-tight ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                      {carrera.nombre_carrera}
                    </h3>
                  </button>
                );
              })}
            </div>

            {/* Leyenda de Interactividad */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 animate-in fade-in duration-500">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500 border border-blue-600"></div>
                    <span className="text-sm font-semibold text-slate-700">Materia Seleccionada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-400 border border-orange-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Prerrequisito (Debes aprobar primero)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-emerald-400 border border-emerald-500"></div>
                    <span className="text-sm font-semibold text-slate-700">Subsecuente (Se desbloquea después)</span>
                </div>
            </div>

            {/* Buscador de Materias */}
            <div className="mb-8 relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
                placeholder="Buscar por sigla, nombre o prerrequisito..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Malla Content */}
            {mallasAgrupadas.length > 0 ? (
              <div className="space-y-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">PLAN DE ESTUDIOS {activeCarrera?.sigla_carrera}</h1>
                    <h2 className="text-xl font-bold uppercase text-slate-700">{activeCarrera?.nombre_carrera}</h2>
                    <h3 className="text-lg font-bold uppercase italic text-slate-600">FACULTAD INTEGRAL DE LOS VALLES</h3>
                </div>
                {mallasAgrupadas.map((semestreBlock, idx) => (
                  <div key={idx} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className={`px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-${activeColor}-500`}>
                        {semestreBlock.semestre.split(' ')[1]}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">{semestreBlock.semestre}</h3>
                    </div>
                    
                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse cursor-pointer">
                        <thead>
                          <tr className="bg-white border-b border-slate-100">
                            <th className="py-4 px-6 font-semibold text-slate-500 text-sm uppercase tracking-wider w-32">Sigla</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-sm uppercase tracking-wider">Materia</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-sm uppercase tracking-wider w-24 text-center">Créditos</th>
                            <th className="py-4 px-6 font-semibold text-slate-500 text-sm uppercase tracking-wider w-64">Prerrequisito</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {semestreBlock.materias.map((materia) => (
                            <tr 
                                key={materia.id} 
                                onClick={() => handleMateriaClick(materia)}
                                className={getRowClassName(materia)}
                            >
                              <td className="py-4 px-6">
                                <span className={`inline-block px-2 py-1 rounded font-bold text-xs ${selectedMateria?.id === materia.id ? 'bg-blue-600 text-white' : `bg-${activeColor}-50 text-${activeColor}-700`}`}>
                                  {materia.sigla_materia}
                                </span>
                              </td>
                              <td className="py-4 px-6 font-semibold text-slate-800">
                                {materia.nombre_materia}
                              </td>
                              <td className="py-4 px-6 text-center font-medium text-slate-500">
                                {materia.credito_materia}
                              </td>
                              <td className="py-4 px-6">
                                {!materia.requisito_texto || materia.requisito_texto === 'Ninguno' ? (
                                  <span className="text-slate-400 text-sm italic">Ninguno</span>
                                ) : (
                                  <span className="text-slate-700 text-sm font-medium border-b border-slate-300 border-dashed pb-0.5">
                                    {materia.requisito_texto.replace(/\|\[SPAN:\d+\]\|/gi, '').trim()}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">Información no disponible</h3>
                <p className="text-slate-500">El pensum de esta carrera aún no ha sido cargado en el sistema.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MallasPage;
