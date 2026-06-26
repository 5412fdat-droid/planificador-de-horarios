import React, { useState, useEffect, useRef, useContext } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, ArrowLeft, Download, Plus, AlertCircle, Info, X as CloseIcon, Save, Lock, Folder, UserCircle } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

// Horarios de la facultad: Periodos de 45 minutos desde 07:45 a 22:45
const periodos = [
  { inicio: '07:45', fin: '08:30' },
  { inicio: '08:30', fin: '09:15' },
  { inicio: '09:15', fin: '10:00' },
  { inicio: '10:00', fin: '10:45' },
  { inicio: '10:45', fin: '11:30' },
  { inicio: '11:30', fin: '12:15' },
  { inicio: '12:15', fin: '13:00' },
  { inicio: '13:00', fin: '13:45' },
  { inicio: '13:45', fin: '14:30' },
  { inicio: '14:30', fin: '15:15' },
  { inicio: '15:15', fin: '16:00' },
  { inicio: '16:00', fin: '16:45' },
  { inicio: '16:45', fin: '17:30' },
  { inicio: '17:30', fin: '18:15' },
  { inicio: '18:15', fin: '19:00' },
  { inicio: '19:00', fin: '19:45' },
  { inicio: '19:45', fin: '20:30' },
  { inicio: '20:30', fin: '21:15' },
  { inicio: '21:15', fin: '22:00' },
  { inicio: '22:00', fin: '22:45' }
];
const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Se removerá mockSubjects y se usará data de la API

// Helpers matemáticos para calcular tiempos y posiciones
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const isOverlapping = (h1, h2) => {
  if (h1.dia !== h2.dia) return false;
  const start1 = timeToMinutes(h1.inicio);
  const end1 = timeToMinutes(h1.fin);
  const start2 = timeToMinutes(h2.inicio);
  const end2 = timeToMinutes(h2.fin);
  return Math.max(start1, start2) < Math.min(end1, end2);
};

const PlanificadorPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!user && user.rol === 'Estudiante';
  
  // Múltiples planes de horario
  const [plans, setPlans] = useState([{ id: 'plan-1', name: 'Plan A', subjects: [] }]);
  const [activePlanId, setActivePlanId] = useState('plan-1');
  
  // Modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Modal de planes guardados
  const [showSavedPlansModal, setShowSavedPlansModal] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);

  // Sidebar en versión móvil
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Filtros del buscador
  const [filterCarrera, setFilterCarrera] = useState('Todas');
  const [filterSemestre, setFilterSemestre] = useState('Todos');
  const [filterSigla, setFilterSigla] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [carrerasOptions, setCarrerasOptions] = useState([]);
  const [semestresOptions, setSemestresOptions] = useState([]);

  // Referencia al contenedor del calendario para PDF
  const calendarRef = useRef(null);

  const [passedSubjects, setPassedSubjects] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.estudiante_id) {
      fetchHistorial();
    }
  }, [isAuthenticated, user]);

  const fetchHistorial = async () => {
    try {
      const res = await api.get(`admin/estudiantes/${user.estudiante_id}/historial/`);
      const passed = res.data.filter(h => h.nota >= 51).map(h => h.sigla_materia);
      setPassedSubjects(passed);
    } catch (e) {
      console.error("Error fetching historial:", e);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5); // "07:45:00" -> "07:45"
  };

  const fetchSchedules = async () => {
    try {
        const response = await api.get('admin/operador/horarios/');
        const data = response.data;
        
        const groups = {};
        const carrerasSet = new Set();
        const semestresSet = new Set();
        
        data.forEach(h => {
            const gid = h.grupo_materia;
            const semestre = `Semestre ${h.periodo}`;
            if (!groups[gid]) {
                groups[gid] = {
                    id: gid,
                    sigla: h.materia_sigla,
                    nombre: h.materia_nombre,
                    grupo: h.grupo_nombre,
                    aula: h.aula_nombre,
                    carrera: h.carrera_nombre,
                    semestre: semestre,
                    docente: h.docente_nombre || 'Por Asignar',
                    requisitos: h.requisitos || [],
                    horarios: []
                };
            }
            groups[gid].horarios.push({
                dia: h.dia_semana,
                inicio: formatTime(h.hora_inicio),
                fin: formatTime(h.hora_fin)
            });
            if (h.carrera_nombre) carrerasSet.add(h.carrera_nombre);
            if (h.periodo) semestresSet.add(semestre);
        });
        
        setSubjects(Object.values(groups));
        setCarrerasOptions(Array.from(carrerasSet).sort());
        
        // Ordenar semestres por número (ej: Semestre 1, Semestre 2)
        const sortedSemestres = Array.from(semestresSet).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, '')) || 0;
            const numB = parseInt(b.replace(/\D/g, '')) || 0;
            return numA - numB;
        });
        setSemestresOptions(sortedSemestres);
    } catch (error) {
        console.error("Error al cargar horarios:", error);
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    if (filterCarrera !== 'Todas' && subject.carrera !== filterCarrera) return false;
    if (filterSemestre !== 'Todos' && subject.semestre !== filterSemestre) return false;
    if (filterSigla && !subject.sigla.toLowerCase().includes(filterSigla.toLowerCase())) return false;
    if (searchQuery && !subject.nombre.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];

  // Calculamos las colisiones basándonos en las materias seleccionadas del plan actual
  const getCollisionMap = (subjectsList) => {
    const collisionMap = new Map();
    
    for (let i = 0; i < subjectsList.length; i++) {
      for (let j = i + 1; j < subjectsList.length; j++) {
        const sub1 = subjectsList[i];
        const sub2 = subjectsList[j];
        
        let overlapFound = false;
        for (const h1 of sub1.horarios) {
          for (const h2 of sub2.horarios) {
            if (isOverlapping(h1, h2)) {
              overlapFound = true;
              break;
            }
          }
          if (overlapFound) break;
        }
        
        if (overlapFound) {
          if (!collisionMap.has(sub1.id)) {
            collisionMap.set(sub1.id, 'original');
          }
          collisionMap.set(sub2.id, 'clash');
        }
      }
    }
    
    return collisionMap;
  };

  const collisionMap = getCollisionMap(activePlan.subjects);

  const handleAddSubject = (subject) => {
    if (activePlan.subjects.some(s => s.id === subject.id)) {
      alert('Esta materia ya está añadida al horario en este plan.');
      return;
    }

    const testList = [...activePlan.subjects, subject];
    const testCollisions = getCollisionMap(testList);
    
    if (testCollisions.has(subject.id)) {
      alert(`¡Advertencia! La materia "${subject.nombre}" choca con otra materia en este plan.`);
    }

    setPlans(plans.map(p => 
      p.id === activePlanId 
        ? { ...p, subjects: [...p.subjects, subject] }
        : p
    ));
  };

  const handleRemoveSubject = (subjectId) => {
    setPlans(plans.map(p => 
      p.id === activePlanId 
        ? { ...p, subjects: p.subjects.filter(s => s.id !== subjectId) }
        : p
    ));
  };

  const handleAddPlan = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const usedLetters = plans.map(p => p.name.replace('Plan ', ''));
    let nextLetter = 'A';
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        if (!usedLetters.includes(letter)) {
            nextLetter = letter;
            break;
        }
    }
    
    const newPlanId = `plan-${Date.now()}`;
    const newPlanName = `Plan ${nextLetter}`;
    
    const newPlans = [...plans, { id: newPlanId, name: newPlanName, subjects: [] }];
    newPlans.sort((a, b) => a.name.localeCompare(b.name));
    
    setPlans(newPlans);
    setActivePlanId(newPlanId);
  };

  const handleExportPDF = async () => {
    if (collisionMap.size > 0) {
      alert('No puedes exportar tu horario mientras existan choques de materias. Por favor resuelve los conflictos primero.');
      return;
    }
    
    if (!calendarRef.current) return;
    
    try {
      const { scrollWidth, scrollHeight } = calendarRef.current;
      
      const dataUrl = await toPng(calendarRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: scrollWidth,
        height: scrollHeight,
        style: {
          margin: '0',
          padding: '0',
          transform: 'none'
        }
      });
      
      const pdf = new jsPDF({
        orientation: scrollWidth > scrollHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate scale to fit within A4 with a 5% margin
      const marginFactor = 0.95;
      const scaleX = (pdfWidth * marginFactor) / scrollWidth;
      const scaleY = (pdfHeight * marginFactor) / scrollHeight;
      const scale = Math.min(scaleX, scaleY);
      
      const imgWidth = scrollWidth * scale;
      const imgHeight = scrollHeight * scale;
      
      // Center the image
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Horario_FIVC_${activePlan.name.replace(' ', '_')}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Ocurrió un error al generar el PDF.');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const payload = {
        nombre_escenario: activePlan.name,
        grupos: activePlan.subjects.map(sub => sub.id)
    };
    try {
        await api.post('simulaciones/', payload);
        alert('Plan guardado exitosamente.');
    } catch (e) {
        console.error("Error al guardar:", e);
        alert('Error al guardar el plan.');
    }
  };

  const fetchSavedPlans = async () => {
    try {
      const res = await api.get('simulaciones/');
      setSavedPlans(res.data);
    } catch (e) {
      console.error("Error al cargar planes:", e);
    }
  };

  const loadSavedPlan = (simulacion) => {
    const grupoIds = simulacion.detalles.map(d => d.grupo_materia);
    const planSubjects = subjects.filter(sub => grupoIds.includes(sub.id));
    
    let newPlans = [...plans];
    let newPlanId = '';
    
    const existingIndex = newPlans.findIndex(p => p.name === simulacion.nombre_escenario);
    if (existingIndex !== -1) {
        newPlans[existingIndex].subjects = planSubjects;
        newPlanId = newPlans[existingIndex].id;
    } else {
        newPlanId = `plan-${Date.now()}`;
        newPlans.push({ id: newPlanId, name: simulacion.nombre_escenario, subjects: planSubjects });
    }
    
    newPlans.sort((a, b) => a.name.localeCompare(b.name));
    
    setPlans(newPlans);
    setActivePlanId(newPlanId);
    setShowSavedPlansModal(false);
  };

  const deleteSavedPlan = async (simulacionId) => {
    if(!window.confirm('¿Estás seguro de eliminar este plan de tu cuenta?')) return;
    try {
      await api.delete(`simulaciones/?simulacion_id=${simulacionId}`);
      fetchSavedPlans(); // refresh
    } catch(e) {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-6 justify-between flex-shrink-0 z-10 relative">
        <div className="flex items-center gap-3">
          {/* Logo y título removidos para evitar redundancia con el Navbar principal */}
          
          <button 
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {showMobileSidebar ? <Calendar className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            {showMobileSidebar ? 'Calendario' : 'Materias'}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 sm:gap-2 text-slate-600 font-medium hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-4 py-2 rounded-lg transition-colors"
            title="Exportar PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          
          {isAuthenticated && (
            <button 
              onClick={() => {
                fetchSavedPlans();
                setShowSavedPlansModal(true);
              }}
              className="flex items-center gap-1.5 sm:gap-2 text-blue-700 font-medium hover:bg-blue-50 bg-blue-100 px-2.5 sm:px-4 py-2 rounded-lg transition-colors"
              title="Ver mis planes"
            >
              <Folder className="w-4 h-4" />
              <span className="hidden sm:inline">Ver mis planes</span>
            </button>
          )}

          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 sm:gap-2 text-white font-medium hover:bg-blue-700 bg-blue-600 px-2.5 sm:px-4 py-2 rounded-lg transition-colors"
            title="Guardar"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Guardar</span>
          </button>
          
          {!isAuthenticated ? (
            <button 
              onClick={() => navigate('/login')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ml-2"
            >
              Iniciar Sesión
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Conectado
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row relative">
        
        {/* Overlay oscuro para móvil si el sidebar está abierto */}
        {showMobileSidebar && (
          <div 
            className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
        )}

        {/* Sidebar: Buscador y Oferta */}
        <aside className={`${showMobileSidebar ? 'flex absolute inset-y-0 left-0 z-40 shadow-2xl' : 'hidden md:flex'} w-[85%] sm:w-80 md:w-80 md:relative bg-white border-r border-slate-200 flex-col flex-shrink-0 overflow-y-auto transition-all`}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Buscador de Materias</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Carrera</label>
                <select 
                  value={filterCarrera}
                  onChange={(e) => setFilterCarrera(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  <option value="Todas">Todas las Carreras</option>
                  {carrerasOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Semestre</label>
                  <select 
                    value={filterSemestre}
                    onChange={(e) => setFilterSemestre(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="Todos">Todos</option>
                    {semestresOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Sigla</label>
                  <input 
                    type="text" 
                    placeholder="Ej. INF110" 
                    value={filterSigla}
                    onChange={(e) => setFilterSigla(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre de Materia</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Resultados ({filteredSubjects.length})</h3>
            
            {filteredSubjects.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 font-medium">No se encontraron materias</p>
                <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros</p>
              </div>
            ) : (
              filteredSubjects.map(subject => {
              const isAdded = activePlan.subjects.some(s => s.id === subject.id);
              const colTheme = collisionMap.get(subject.id);
              
              // Validación académica (solo si está logueado como Estudiante)
              const isPassed = isAuthenticated && passedSubjects.includes(subject.sigla);
              const missingReqs = isAuthenticated ? subject.requisitos.filter(req => !passedSubjects.includes(req)) : [];
              const hasMissingReqs = missingReqs.length > 0;
              const isDisabled = isAuthenticated && (isPassed || hasMissingReqs);
              
              let containerClass = "border-slate-200 bg-white hover:border-blue-300";
              let statusText = null;
              
              if (isPassed) {
                containerClass = "border-gray-300 bg-gray-50 border-2 opacity-75";
                statusText = <span className="text-gray-600 font-bold flex items-center gap-1">Materia ya aprobada</span>;
              } else if (hasMissingReqs) {
                containerClass = "border-orange-300 bg-orange-50 border-2 opacity-75";
                statusText = <span className="text-orange-700 font-bold flex flex-col gap-0.5"><span className="flex items-center gap-1"><Lock className="w-3 h-3"/> Requiere aprobar:</span> <span className="text-[11px] font-medium opacity-90">{missingReqs.join(', ')}</span></span>;
              } else if (colTheme === 'original') {
                containerClass = "border-green-500 bg-green-50 border-2";
                statusText = <span className="text-green-700 font-bold flex items-center gap-1">Añadida (Primera)</span>;
              } else if (colTheme === 'clash') {
                containerClass = "border-red-500 bg-red-100 border-2";
                statusText = <span className="text-red-700 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Choque en Plan</span>;
              } else if (isAdded) {
                containerClass = "border-green-400 bg-white border-2";
                statusText = <span className="text-green-700 font-semibold flex items-center gap-1">Añadida al horario</span>;
              }
              
              return (
                <div key={subject.id} className={`p-3 border ${containerClass} rounded-xl mb-3 transition-colors shadow-sm group`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isDisabled ? 'text-gray-500 bg-gray-100' : 'text-blue-600 bg-blue-50'}`}>{subject.sigla}</span>
                    {!isAdded ? (
                      <button 
                        onClick={() => !isDisabled && handleAddSubject(subject)}
                        disabled={isDisabled}
                        className={`p-1 rounded transition-colors ${isDisabled ? 'text-gray-300 cursor-not-allowed bg-transparent' : 'text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50'}`}
                        title={isDisabled ? "No puedes inscribir esta materia" : "Añadir materia"}
                      >
                        {hasMissingReqs ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRemoveSubject(subject.id)}
                        className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Quitar materia"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm leading-tight mb-1">{subject.nombre}</h4>
                  <p className="text-xs text-slate-500">Grupo {subject.grupo} • Aula {subject.aula}</p>
                  {subject.horarios.map((h, i) => (
                    <p key={i} className="text-xs text-slate-500">{h.dia} ({h.inicio} - {h.fin})</p>
                  ))}
                  {statusText && (
                    <div className="mt-2 text-[10px]">
                      {statusText}
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
        </aside>

        {/* Contenido Principal (Calendario) */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* Tabs de Escenarios */}
          <div className="bg-white px-4 pt-3 border-b border-slate-200 flex gap-1 items-end">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActivePlanId(plan.id)}
                className={`px-6 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                  activePlanId === plan.id 
                  ? 'border-blue-600 text-blue-700 bg-blue-50/50' 
                  : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {plan.name}
              </button>
            ))}
            {plans.length < 3 && (
              <button
                onClick={handleAddPlan}
                className="px-4 py-2 text-sm font-semibold rounded-t-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors flex items-center gap-1 mb-0.5 ml-1"
              >
                <Plus className="w-4 h-4" /> Añadir Plan
              </button>
            )}
          </div>

          <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-800">Modo Interactivo - {activePlan.name}</h4>
              <p className="text-xs text-blue-700 mt-1">
                Añade materias desde el panel lateral izquierdo. El sistema calculará en tiempo real si existe algún choque de horarios y emitirá alertas visuales dinámicas.
              </p>
            </div>
          </div>

          {/* Grilla del Calendario y Leyenda */}
          <div className="flex-1 overflow-auto p-4 bg-slate-100 flex flex-col items-start gap-6">
            
            {/* Contenedor del PDF (Calendario + Leyenda) */}
            <div 
              ref={calendarRef}
              className="min-w-[800px] w-full bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col p-6 flex-shrink-0"
            >
              {/* Encabezado del PDF */}
              <div className="text-center pb-5 mb-6 border-b border-slate-200 flex flex-col items-center">
                <h3 className="font-black text-slate-800 text-xl sm:text-2xl uppercase tracking-widest">Horario Universitario - {activePlan.name}</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-widest">Facultad Integral de los Valles Cruceños (F.I.V.C.)</p>
                
                {isAuthenticated && user && (
                  <div className="mt-4 inline-flex items-center justify-center gap-x-6 text-sm bg-blue-50/60 px-6 py-2.5 rounded-xl border border-blue-100 whitespace-nowrap">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <UserCircle className="w-4 h-4 text-blue-600"/> {user.nombre}
                    </span>
                    <span className="font-bold text-blue-800">Registro: <span className="font-medium text-blue-700">{user.registro || '-'}</span></span>
                    <span className="font-bold text-blue-800">C.I.: <span className="font-medium text-blue-700">{user.carnet}</span></span>
                  </div>
                )}
              </div>

              {/* Calendario Body Wrapper */}
              <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col mb-8">

              <div className="flex bg-slate-100 py-2 border-b border-slate-200 sticky top-0 z-20 shadow-sm min-w-max">
                <div className="w-16 sm:w-28 flex-shrink-0"></div>
                {dias.map(dia => (
                  <div key={dia} className="flex-1 text-center font-bold text-slate-700 text-xs sm:text-sm uppercase tracking-wider py-1 px-1 min-w-[4rem] sm:min-w-[6rem]">
                    {dia}
                  </div>
                ))}
              </div>

              {/* Cuerpo del calendario */}
              <div className="flex relative min-w-max">
                
                {/* Columna de horas */}
                <div className="w-16 sm:w-28 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
                  {periodos.map((periodo, idx) => (
                    <div key={idx} className="h-16 border-b border-slate-100 flex items-center justify-center">
                      <span className="text-[9px] sm:text-[11px] font-medium text-slate-500 text-center px-0.5">
                        {periodo.inicio} - {periodo.fin}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grilla de días */}
                <div className="flex-1 flex relative">
                  {/* Filas horizontales */}
                  <div className="absolute inset-0 flex flex-col pointer-events-none">
                    {periodos.map((_, idx) => (
                      <div key={idx} className="h-16 border-b border-slate-100 w-full"></div>
                    ))}
                  </div>
                  
                  {/* Columnas verticales */}
                  {dias.map(dia => (
                    <div key={dia} className="flex-1 border-r border-slate-100 min-w-[4rem] sm:min-w-[6rem]"></div>
                  ))}

                  {/* --- RENDERIZADO DINÁMICO DE MATERIAS --- */}
                  {(() => {
                    const blocks = [];
                  activePlan.subjects.forEach((subject, subjectIdx) => {
                    subject.horarios.forEach((horario, hIdx) => {
                      blocks.push({
                        id: `${subject.id}-${hIdx}`,
                        subject,
                        horario,
                        subjectIdx,
                        overlapCount: 1,
                        overlapIndex: 0,
                        isOriginal: false,
                        isClash: false
                      });
                    });
                  });

                  dias.forEach(dia => {
                    const blocksDelDia = blocks.filter(b => b.horario.dia === dia);
                    blocksDelDia.sort((a, b) => a.subjectIdx - b.subjectIdx);
                    
                    const clusters = [];
                    blocksDelDia.forEach(block => {
                      let added = false;
                      for (const cluster of clusters) {
                        if (cluster.some(c => isOverlapping(c.horario, block.horario))) {
                          cluster.push(block);
                          added = true;
                          break;
                        }
                      }
                      if (!added) {
                        clusters.push([block]);
                      }
                    });
                    
                    clusters.forEach(cluster => {
                      cluster.forEach((block, idx) => {
                        block.overlapCount = cluster.length;
                        block.overlapIndex = idx;
                        if (cluster.length > 1) {
                          if (idx === 0) block.isOriginal = true;
                          else block.isClash = true;
                        }
                      });
                    });
                  });

                  return blocks.map((block) => {
                    const { subject, horario, overlapCount, overlapIndex, isOriginal, isClash, id } = block;
                    const colIndex = dias.indexOf(horario.dia);
                    if (colIndex === -1) return null;

                    const startIndex = periodos.findIndex(p => p.inicio === horario.inicio);
                    const endIndex = periodos.findIndex(p => p.fin === horario.fin);
                    if (startIndex === -1 || endIndex === -1) return null;

                    const fullTopPosition = startIndex * 4;
                    const fullBlockHeight = (endIndex - startIndex + 1) * 4;

                    const adjustedHeight = fullBlockHeight / overlapCount;
                    const adjustedTop = fullTopPosition + (adjustedHeight * overlapIndex);

                    let blockClass = "bg-indigo-200 border-l-4 border-indigo-600 hover:z-20";
                    let titleClass = "text-indigo-800";
                    let nameClass = "text-slate-900";
                    let timeClass = "text-slate-700";
                    let btnClass = "hover:bg-indigo-300 text-indigo-800";
                    let badgeClass = null;

                    if (isOriginal) {
                      blockClass = "bg-emerald-200 border-l-4 border-emerald-600 z-10 opacity-100";
                      titleClass = "text-emerald-800";
                      nameClass = "text-emerald-950";
                      timeClass = "text-emerald-700";
                      btnClass = "hover:bg-emerald-300 text-emerald-800";
                    } else if (isClash) {
                      blockClass = "bg-red-200 border-l-4 border-red-600 z-20 shadow-lg shadow-red-600/30";
                      titleClass = "text-red-800";
                      nameClass = "text-red-950";
                      timeClass = "text-red-700";
                      btnClass = "hover:bg-red-300 text-red-800";
                      badgeClass = "bg-red-600";
                    }

                    return (
                      <div 
                        key={id}
                        className={`absolute p-0.5 transition-all ${isClash ? 'z-30' : 'z-10'}`}
                        style={{
                          top: `${adjustedTop}rem`,
                          height: `${adjustedHeight}rem`,
                          left: `calc((100%) / 6 * ${colIndex})`,
                          width: `calc((100%) / 6)`
                        }}
                      >
                        <div className={`w-full h-full rounded-md p-2 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col relative group border ${blockClass}`}>
                          <div className="flex justify-between items-start">
                            <span className={`block text-[10px] font-bold ${titleClass} truncate pr-2`}>
                              {subject.sigla} - {subject.grupo}
                            </span>
                            <button 
                              onClick={() => handleRemoveSubject(subject.id)}
                              className={`p-0.5 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 ${btnClass}`}
                              title="Quitar"
                            >
                              <CloseIcon className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <span className={`block text-xs font-semibold leading-tight mt-0.5 ${nameClass} truncate`}>
                            {subject.nombre}
                          </span>
                          <span className={`block text-[10px] mt-1 ${timeClass}`}>
                            {horario.inicio} - {horario.fin}
                          </span>
                          
                          {badgeClass && (
                            <div className={`absolute bottom-1 right-1 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 shadow ${badgeClass}`}>
                              <AlertCircle className="w-2.5 h-2.5" /> Choque
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}

                </div>
              </div>
            </div>

            {/* LEYENDA (Lista de Docentes) */}
            {activePlan.subjects.length > 0 && (
              <div className="w-full">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                  Materias y Docentes Asignados
                </h4>
                <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-600">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Materia</th>
                        <th className="px-4 py-3">Sigla</th>
                        <th className="px-4 py-3 text-center">Grupo</th>
                        <th className="px-4 py-3">Docente</th>
                        <th className="px-4 py-3">Aula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {activePlan.subjects.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">{sub.nombre}</td>
                          <td className="px-4 py-3 font-medium text-slate-500">{sub.sigla}</td>
                          <td className="px-4 py-3 font-bold text-blue-600 text-center">{sub.grupo}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700 uppercase">{sub.docente}</td>
                          <td className="px-4 py-3 font-medium text-slate-500">{sub.aula || 'S/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            </div>
          </div>
        </main>
      </div>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Inicio de Sesión Requerido</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Para guardar tu horario, crear múltiples planes alternativos (Plan B, Plan C), necesitas iniciar sesión con tu registro universitario.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  Ir a Iniciar Sesión
                </button>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Planes Guardados */}
      {showSavedPlansModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Mis Planificaciones</h3>
                <button onClick={() => setShowSavedPlansModal(false)} className="text-slate-400 hover:text-slate-600">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {savedPlans.length === 0 ? (
                  <p className="text-slate-500 text-center py-4 text-sm">No tienes planes guardados todavía.</p>
                ) : (
                  savedPlans.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      <div>
                        <h4 className="font-bold text-slate-800">{plan.nombre_escenario}</h4>
                        <p className="text-xs text-slate-500">{plan.detalles.length} materias | {new Date(plan.fecha_creacion).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => deleteSavedPlan(plan.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                        <button 
                          onClick={() => loadSavedPlan(plan)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                          Cargar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlanificadorPage;
