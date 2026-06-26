import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Printer, Plus, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const BoletaInscripcionModal = ({ student, onClose }) => {
    const [materiasInscritas, setMateriasInscritas] = useState([]);
    const [materiasCarrera, setMateriasCarrera] = useState([]);
    const [horariosData, setHorariosData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Filtro para buscar materia a añadir
    const [searchMateria, setSearchMateria] = useState('');
    const [filterSemestre, setFilterSemestre] = useState('');

    const [formData, setFormData] = useState({
        materia: '',
        grupo: 'VA',
        modalidad: 'PRESENCIAL',
        horario: 'Lu 07:00-09:15 | Mi 09:15-11:30',
        gestion: '1-2026'
    });

    useEffect(() => {
        if (student) {
            fetchInscripciones();
            fetchMateriasCarrera();
            fetchHorariosData();
        }
    }, [student]);

    const fetchInscripciones = async () => {
        try {
            const res = await api.get(`admin/estudiantes/${student.id}/inscripciones/`);
            setMateriasInscritas(res.data);
        } catch (error) {
            console.error("Error cargando inscripciones", error);
        }
    };

    const fetchMateriasCarrera = async () => {
        try {
            const res = await api.get('admin/materias/');
            const materias = res.data.filter(m => m.carrera_id == student.carrera || m.carrera == student.carrera);
            setMateriasCarrera(materias);
        } catch (error) {
            console.error("Error cargando materias", error);
        }
    };

    const fetchHorariosData = async () => {
        try {
            const res = await api.get('admin/operador/horarios/');
            setHorariosData(res.data);
        } catch (error) {
            console.error("Error cargando horarios", error);
        }
    };

    useEffect(() => {
        if (formData.materia && formData.grupo && horariosData.length > 0) {
            const horariosMateria = horariosData.filter(h => 
                h.materia_id == formData.materia && 
                h.grupo_nombre?.toLowerCase() === formData.grupo?.toLowerCase()
            );

            if (horariosMateria.length > 0) {
                const dayMap = {
                    'Lunes': 'Lu', 'Martes': 'Ma', 'Miercoles': 'Mi',
                    'Jueves': 'Ju', 'Viernes': 'Vi', 'Sabado': 'Sa', 'Domingo': 'Do'
                };
                
                const timeBlocks = horariosMateria.map(h => {
                    const dia = dayMap[h.dia_semana] || h.dia_semana.substring(0,2);
                    const hIni = h.hora_inicio.substring(0, 5);
                    const hFin = h.hora_fin.substring(0, 5);
                    return `${dia} ${hIni}-${hFin}`;
                });
                
                const uniqueBlocks = [...new Set(timeBlocks)];
                const horarioText = uniqueBlocks.join(' | ');
                
                setFormData(prev => ({ ...prev, horario: horarioText }));
            } else {
                setFormData(prev => ({ ...prev, horario: 'Sin horario asignado' }));
            }
        }
    }, [formData.materia, formData.grupo, horariosData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddMateria = async (e) => {
        e.preventDefault();
        if (!formData.materia) {
            setMessage({ type: 'error', text: 'Por favor selecciona una materia.' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            await api.post(`admin/estudiantes/${student.id}/inscripciones/`, formData);
            setMessage({ type: 'success', text: 'Materia añadida a la boleta correctamente.' });
            setFormData({ ...formData, materia: '' });
            fetchInscripciones();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al añadir materia.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta materia de la boleta?')) return;
        
        try {
            await api.delete(`admin/inscripciones/${id}/`);
            fetchInscripciones();
            setMessage({ type: 'success', text: 'Materia eliminada correctamente.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar materia.' });
        }
    };

    if (!student) return null;

    // Filtrar materias por búsqueda y semestre
    const materiasFiltradas = materiasCarrera.filter(m => {
        const matchesSearch = m.nombre_materia.toLowerCase().includes(searchMateria.toLowerCase()) || 
                              m.sigla_materia.toLowerCase().includes(searchMateria.toLowerCase());
        const matchesSemestre = filterSemestre === '' || m.periodo_materia === filterSemestre;
        return matchesSearch && matchesSemestre;
    });

    // Obtener lista única de semestres para el filtro
    const semestresUnicos = [...new Set(materiasCarrera.map(m => m.periodo_materia).filter(Boolean))].sort((a, b) => parseInt(a) - parseInt(b));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 print:static print:bg-transparent print:p-0 print:block">
            <style type="text/css" media="print">
                {`
                    body * {
                        visibility: hidden;
                    }
                    #boleta-inscripcion-modal, #boleta-inscripcion-modal * {
                        visibility: visible;
                    }
                    #boleta-inscripcion-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                `}
            </style>
            <div id="boleta-inscripcion-modal" className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[95vh] relative print:shadow-none print:w-full print:max-w-none print:my-0 print:m-0 print:p-0 print:max-h-none print:rounded-none">
                
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 rounded-t-xl print-hide">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Boleta de Inscripción</h2>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-[#00a8b4] hover:bg-[#00929d] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Printer className="h-5 w-5" />
                            <span className="hidden sm:inline">Imprimir</span>
                        </button>
                        <button 
                            onClick={onClose}
                            className="p-2 bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-6 bg-white overflow-y-auto flex-1 print:overflow-visible print:p-0">
                    
                    {/* Panel de Edición (No imprimible) */}
                    <div className="w-full lg:w-1/3 flex flex-col gap-4 print-hide border-r border-gray-100 pr-0 lg:pr-6">
                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Añadir Materia</h3>
                        
                        {message.text && (
                            <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                                {message.type === 'error' ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />}
                                <p>{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleAddMateria} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Buscar Materia</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: INF413 o Sistemas..." 
                                    value={searchMateria}
                                    onChange={(e) => setSearchMateria(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-3"
                                />
                                
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Filtrar por Semestre</label>
                                <select 
                                    value={filterSemestre}
                                    onChange={(e) => setFilterSemestre(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-3 bg-white"
                                >
                                    <option value="">Todos los Semestres</option>
                                    {semestresUnicos.map(sem => (
                                        <option key={sem} value={sem}>Semestre / Nivel {sem}</option>
                                    ))}
                                </select>

                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Seleccionar Materia</label>
                                <select name="materia" value={formData.materia} onChange={handleChange} required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="">-- Selecciona una materia --</option>
                                    {materiasFiltradas.map(m => (
                                        <option key={m.id} value={m.id}>{m.sigla_materia} - {m.nombre_materia} (Nivel {m.periodo_materia})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Grupo</label>
                                    <input type="text" name="grupo" value={formData.grupo} onChange={handleChange} required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Modalidad</label>
                                    <input type="text" name="modalidad" value={formData.modalidad} onChange={handleChange} required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Horario Textual</label>
                                <input type="text" name="horario" value={formData.horario} onChange={handleChange} required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Gestión</label>
                                <input type="text" name="gestion" value={formData.gestion} onChange={handleChange} required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            
                            <button type="submit" disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50">
                                <Plus className="h-4 w-4" /> Añadir a la Boleta
                            </button>
                        </form>
                    </div>

                    {/* Contenido (Imprimible) */}
                    <div className="w-full lg:w-2/3 flex flex-col gap-6 print:w-full">
                        {/* Sección 1: Periodo y Datos del Estudiante */}
                        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#1a659e] pb-4">
                            <div>
                                <h1 className="text-3xl font-normal text-gray-800 tracking-wide uppercase">
                                    PERIODO NORMAL {materiasInscritas.length > 0 ? materiasInscritas[0].gestion : '1-2026'}
                                </h1>
                            </div>
                            <div className="text-right mt-4 sm:mt-0">
                                <p className="text-3xl font-bold text-[#1a659e]">{student.registro}</p>
                                <p className="text-sm text-gray-700 font-medium uppercase mt-1">{student.nombre}</p>
                                <p className="text-xs text-gray-500">{student.carnet}</p>
                            </div>
                        </div>

                        {/* Sección 2: Carrera y Origen */}
                        <div className="flex flex-col sm:flex-row justify-between items-end mb-2">
                            <div>
                                <h2 className="text-xl font-medium text-gray-800 uppercase">
                                    187-4 {student.carrera_nombre || 'INGENIERÍA'}
                                </h2>
                                <p className="text-xs text-gray-500 uppercase mt-1">MODALIDAD PRESENCIAL</p>
                                <p className="text-xs text-gray-500 uppercase">LOCALIDAD VALLEGRANDE</p>
                            </div>
                            <div>
                                <h2 className="text-3xl font-semibold text-[#5c9ebd] uppercase">
                                    ORIGEN
                                </h2>
                            </div>
                        </div>

                        {/* Sección 3: Tabla de Materias */}
                        <div className="w-full overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead className="bg-gray-100 text-gray-600 border-t border-b border-gray-200 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-4 py-3">SIGLA</th>
                                        <th className="px-4 py-3">GRUPO</th>
                                        <th className="px-4 py-3">MATERIA</th>
                                        <th className="px-4 py-3">MODALIDAD</th>
                                        <th className="px-4 py-3 text-center">NIVEL</th>
                                        <th className="px-4 py-3">HORARIO</th>
                                        <th className="px-4 py-3 text-center print-hide">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materiasInscritas.map((m, i) => (
                                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{m.sigla_materia}</td>
                                            <td className="px-4 py-3">{m.grupo}</td>
                                            <td className="px-4 py-3">{m.nombre_materia}</td>
                                            <td className="px-4 py-3">{m.modalidad}</td>
                                            <td className="px-4 py-3 text-center">{m.periodo_materia}</td>
                                            <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{m.horario}</td>
                                            <td className="px-4 py-3 text-center print-hide">
                                                <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Eliminar materia">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {materiasInscritas.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                El estudiante no tiene materias inscritas. Usa el panel izquierdo para añadir materias.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoletaInscripcionModal;
