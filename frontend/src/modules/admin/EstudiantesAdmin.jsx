import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, AlertCircle, CheckCircle2, GraduationCap, Pencil, Trash2, Search, Filter, Printer, FileSpreadsheet, FileText } from 'lucide-react';
import AvanceAcademicoModal from './AvanceAcademicoModal';
import BoletaInscripcionModal from './BoletaInscripcionModal';
import { exportToCSV } from '../../utils/exportUtils';

const EstudiantesAdmin = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        nombre: '',
        carnet: '',
        registro: '',
        carrera_id: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [selectedStudentForAvance, setSelectedStudentForAvance] = useState(null);
    const [selectedStudentForBoleta, setSelectedStudentForBoleta] = useState(null);

    // Búsqueda, Filtro y Paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchEstudiantes();
        fetchCarreras();
    }, []);

    const fetchEstudiantes = async () => {
        try {
            const res = await api.get('admin/estudiantes/');
            setEstudiantes(res.data);
        } catch (error) {
            console.error("Error cargando estudiantes:", error);
        }
    };

    const fetchCarreras = async () => {
        try {
            const res = await api.get('admin/carreras/');
            setCarreras(res.data);
        } catch (error) {
            console.error("Error cargando carreras:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (estudiante) => {
        setIsEditing(true);
        setEditingId(estudiante.id);
        setFormData({
            nombre: estudiante.nombre,
            carnet: estudiante.carnet,
            registro: estudiante.registro,
            carrera_id: estudiante.carrera || estudiante.carrera_id || carreras.find(c => c.nombre_carrera === estudiante.carrera_nombre)?.id || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if(window.confirm('¿Estás seguro de que deseas eliminar este estudiante? Se eliminará toda su información asociada.')){
            try {
                await api.delete(`admin/estudiantes/${id}/`);
                setMessage({ type: 'success', text: 'Estudiante eliminado exitosamente.' });
                fetchEstudiantes();
            } catch (error) {
                setMessage({ type: 'error', text: 'Error al eliminar el estudiante.' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isEditing) {
                await api.put(`admin/estudiantes/${editingId}/`, formData);
                setMessage({ type: 'success', text: `Estudiante actualizado exitosamente.` });
                setIsEditing(false);
                setEditingId(null);
            } else {
                const res = await api.post('admin/estudiantes/', formData);
                setMessage({ type: 'success', text: `Estudiante ${res.data.nombre || formData.nombre} registrado exitosamente.` });
            }
            setFormData({ nombre: '', carnet: '', registro: '', carrera_id: '' });
            fetchEstudiantes();
        } catch (error) {
            let errorMsg = 'Error al registrar estudiante. Verifica que el Carnet o Registro no existan ya.';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.registro) errorMsg = data.registro[0];
                else if (data.carnet) errorMsg = data.carnet[0];
                else if (data.error) errorMsg = data.error;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    // Lógica de filtrado y búsqueda
    const filteredEstudiantes = estudiantes.filter(e => {
        const matchesSearch = (
            (e.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.registro || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.carnet || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const estudianteCarreraId = e.carrera || e.carrera_id || (carreras.find(c => c.nombre_carrera === e.carrera_nombre)?.id);
        const matchesCarrera = filterCarrera ? String(estudianteCarreraId) === String(filterCarrera) : true;
        
        return matchesSearch && matchesCarrera;
    });

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEstudiantes = filteredEstudiantes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage) || 1;

    // Reiniciar página al buscar o filtrar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCarrera]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleExportExcel = () => {
        const dataToExport = filteredEstudiantes.map(e => ({
            "Registro": e.registro,
            "Nombre Completo": e.nombre,
            "Carnet de Identidad": e.carnet,
            "Carrera": e.carrera_nombre || '',
            "Avance (%)": e.avance_academico || '0%'
        }));
        exportToCSV(dataToExport, "Estudiantes_Facultad");
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 text-left w-full animate-in fade-in duration-500">
            {/* Contenedor principal que se oculta al imprimir si hay un modal abierto */}
            <div className={(selectedStudentForAvance || selectedStudentForBoleta) ? 'print:hidden' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Estudiantes</h2>
                        <p className="text-gray-500 text-sm">Registra y administra los estudiantes de la facultad.</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 print-hide w-full sm:w-auto mt-4 sm:mt-0">
                    <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <Printer className="h-4 w-4" /> Imprimir
                    </button>
                    <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
                {/* Formulario */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit print-hide">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        {isEditing ? <Pencil className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />} 
                        {isEditing ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Carnet de Identidad (CI)</label>
                            <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} required placeholder="Este será su password inicial"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Registro</label>
                            <input type="text" name="registro" value={formData.registro} onChange={handleChange} required placeholder="Ej: 218000000"
                                pattern="\d{9}" maxLength="9" minLength="9" title="Debe contener exactamente 9 números"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            <p className="text-xs text-gray-500 mt-1">Debe tener exactamente 9 dígitos numéricos.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                            <select name="carrera_id" value={formData.carrera_id} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                                <option value="">-- Selecciona Carrera --</option>
                                {carreras.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                ))}
                            </select>
                        </div>
                        
                        <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors shadow-md shadow-blue-200 disabled:opacity-50 mt-4">
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Estudiante' : 'Guardar Estudiante')}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ nombre: '', carnet: '', registro: '', carrera_id: '' }); }}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-colors mt-2">
                                Cancelar Edición
                            </button>
                        )}
                    </form>
                </div>

                {/* Lista */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                        
                        {/* Buscador y Filtro */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4 print-hide">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por nombre, registro o CI..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                            <div className="sm:w-64 relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select 
                                    value={filterCarrera}
                                    onChange={(e) => setFilterCarrera(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                                >
                                    <option value="">Todas las Carreras</option>
                                    {carreras.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1 print-hide">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Registro</th>
                                    <th className="px-6 py-4">Nombre</th>
                                    <th className="px-6 py-4">CI</th>
                                    <th className="px-6 py-4">Carrera</th>
                                    <th className="px-6 py-4 text-center print-hide">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEstudiantes.length > 0 ? (
                                    currentEstudiantes.map((e) => (
                                        <tr key={e.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{e.registro}</td>
                                            <td className="px-6 py-4">{e.nombre}</td>
                                            <td className="px-6 py-4">{e.carnet}</td>
                                            <td className="px-6 py-4">{e.carrera_nombre}</td>
                                            <td className="px-6 py-4 flex items-center justify-center gap-2 print-hide">
                                                <button onClick={() => setSelectedStudentForAvance(e)} className="inline-flex items-center gap-1 bg-[#00a8b4] hover:bg-[#00929d] text-white px-3 py-1.5 rounded shadow-sm text-xs font-semibold uppercase tracking-wider transition-colors" title="Avance Académico">
                                                    <GraduationCap className="h-4 w-4" /> Avance
                                                </button>
                                                <button onClick={() => setSelectedStudentForBoleta(e)} className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded shadow-sm text-xs font-semibold uppercase tracking-wider transition-colors" title="Boleta de Inscripción">
                                                    <FileText className="h-4 w-4" /> Boleta
                                                </button>
                                                <button onClick={() => handleEdit(e)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors" title="Editar">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No hay estudiantes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>

                        {/* Tabla oculta para imprimir TODOS los estudiantes filtrados */}
                        <div className="hidden print:block w-full">
                            <h2 className="text-2xl font-bold text-center mb-6">Reporte de Estudiantes</h2>
                            <table className="w-full text-sm text-left text-black border-collapse">
                                <thead className="text-xs uppercase border-b-2 border-black">
                                    <tr>
                                        <th className="px-2 py-2 border border-gray-300">Nº</th>
                                        <th className="px-2 py-2 border border-gray-300">Registro</th>
                                        <th className="px-2 py-2 border border-gray-300">Nombre Completo</th>
                                        <th className="px-2 py-2 border border-gray-300">CI</th>
                                        <th className="px-2 py-2 border border-gray-300">Carrera</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEstudiantes.map((e, idx) => (
                                        <tr key={e.id} className="border-b border-gray-300">
                                            <td className="px-2 py-1 border border-gray-300 text-center">{idx + 1}</td>
                                            <td className="px-2 py-1 border border-gray-300 font-medium">{e.registro}</td>
                                            <td className="px-2 py-1 border border-gray-300">{e.nombre}</td>
                                            <td className="px-2 py-1 border border-gray-300">{e.carnet}</td>
                                            <td className="px-2 py-1 border border-gray-300">{e.carrera_nombre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Controles de Paginación */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200 print-hide">
                                <div className="text-sm text-gray-500">
                                    Mostrando <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> a <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredEstudiantes.length)}</span> de <span className="font-medium text-gray-900">{filteredEstudiantes.length}</span> resultados
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button 
                                        onClick={() => handlePageChange(currentPage - 1)} 
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => handlePageChange(currentPage + 1)} 
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 transition-colors"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>

            {/* Modal Avance Académico */}
            {selectedStudentForAvance && (
                <AvanceAcademicoModal 
                    student={selectedStudentForAvance} 
                    onClose={() => setSelectedStudentForAvance(null)} 
                />
            )}

            {selectedStudentForBoleta && (
                <BoletaInscripcionModal 
                    student={selectedStudentForBoleta} 
                    onClose={() => setSelectedStudentForBoleta(null)} 
                />
            )}
        </div>
    );
};

export default EstudiantesAdmin;
