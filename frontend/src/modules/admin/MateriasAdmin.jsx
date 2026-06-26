import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, AlertCircle, CheckCircle2, Plus, Search, Filter } from 'lucide-react';

const MateriasAdmin = () => {
    const [carreras, setCarreras] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Filtros y Paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [formData, setFormData] = useState({
        carrera: '',
        nombre_materia: '',
        sigla_materia: '',
        periodo_materia: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCarreras();
        fetchMaterias();
    }, []);

    // Reiniciar paginación cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCarrera]);

    const fetchCarreras = async () => {
        try {
            const res = await api.get('admin/carreras/');
            setCarreras(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMaterias = async () => {
        try {
            const res = await api.get('admin/materias/');
            setMaterias(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await api.put(`admin/materias/${editingId}/`, formData);
                setMessage({ type: 'success', text: `Materia actualizada exitosamente.` });
            } else {
                const res = await api.post('admin/materias/', formData);
                setMessage({ type: 'success', text: `Materia ${res.data.nombre_materia} registrada exitosamente.` });
            }
            setFormData({
                carrera: formData.carrera,
                nombre_materia: '',
                sigla_materia: '',
                periodo_materia: formData.periodo_materia
            });
            setEditingId(null);
            fetchMaterias();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al registrar la materia. Verifica que la sigla no esté duplicada dentro de la MISMA carrera y que los datos sean correctos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (m) => {
        setEditingId(m.id);
        setFormData({
            carrera: m.carrera_id || m.carrera,
            nombre_materia: m.nombre_materia,
            sigla_materia: m.sigla_materia,
            periodo_materia: m.periodo_materia || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta materia?')) return;
        try {
            await api.delete(`admin/materias/${id}/`);
            setMessage({ type: 'success', text: 'Materia eliminada correctamente.' });
            fetchMaterias();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar. Asegúrate de que no esté en uso.' });
        }
    };

    // Lógica de filtrado y búsqueda
    const filteredMaterias = materias.filter(m => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            (m.nombre_materia || '').toLowerCase().includes(term) ||
            (m.sigla_materia || '').toLowerCase().includes(term) ||
            (m.carrera_nombre || '').toLowerCase().includes(term) ||
            (m.periodo_materia || '').toString().toLowerCase().includes(term)
        );
        
        // carrera_id a veces viene directo o a veces como carrera (dependiendo del serializador)
        const materiaCarreraId = m.carrera_id || m.carrera;
        const matchesCarrera = filterCarrera ? materiaCarreraId.toString() === filterCarrera.toString() : true;
        
        return matchesSearch && matchesCarrera;
    });

    // Lógica de paginación
    const totalPages = Math.ceil(filteredMaterias.length / itemsPerPage) || 1;
    const paginatedMaterias = filteredMaterias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 text-left w-full animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Materias</h2>
                    <p className="text-gray-500 text-sm">Administra las materias y prerrequisitos del plan de estudios.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="xl:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-blue-600" /> {editingId ? 'Editar Materia' : 'Nueva Materia'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                            <select name="carrera" value={formData.carrera} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white">
                                <option value="">-- Selecciona Carrera --</option>
                                {carreras.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Materia</label>
                            <input type="text" name="nombre_materia" value={formData.nombre_materia} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sigla</label>
                            <input type="text" name="sigla_materia" value={formData.sigla_materia} onChange={handleChange} required placeholder="Ej: MAT101"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Periodo (Semestre N°)</label>
                            <input type="number" name="periodo_materia" value={formData.periodo_materia} onChange={handleChange} min="1" max="20" placeholder="Ej: 1, 2, 3..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                            <button type="submit" disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors shadow-md shadow-blue-200 disabled:opacity-50">
                                {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Materia')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => {
                                    setEditingId(null);
                                    setFormData({carrera: '', nombre_materia: '', sigla_materia: '', periodo_materia: ''});
                                }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista de Materias con Filtros */}
                <div className="xl:col-span-2 flex flex-col h-full">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                        
                        {/* Buscador y Filtro */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por sigla, nombre, carrera o periodo..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                            </div>
                            <div className="sm:w-64 relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select 
                                    value={filterCarrera}
                                    onChange={(e) => setFilterCarrera(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                                >
                                    <option value="">Todas las carreras</option>
                                    {carreras.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre_carrera}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3">Sigla</th>
                                        <th className="px-4 py-3">Nombre</th>
                                        <th className="px-4 py-3">Carrera</th>
                                        <th className="px-4 py-3 text-center">Periodo</th>
                                        <th className="px-4 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedMaterias.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-gray-900">{m.sigla_materia}</td>
                                            <td className="px-4 py-3 text-gray-800">{m.nombre_materia}</td>
                                            <td className="px-4 py-3 text-gray-600">{m.carrera_nombre}</td>
                                            <td className="px-4 py-3 text-center font-medium">{m.periodo_materia || '-'}</td>
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-800 mr-3 font-medium" title="Editar">✏️</button>
                                                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 font-medium" title="Eliminar">❌</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedMaterias.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                                                <BookOpen className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                                <p>No se encontraron materias que coincidan con la búsqueda.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {filteredMaterias.length > itemsPerPage && (
                            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
                                <span className="text-sm text-gray-600">
                                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredMaterias.length)} de {filteredMaterias.length} materias
                                </span>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors"
                                    >
                                        Anterior
                                    </button>
                                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors"
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
    );
};

export default MateriasAdmin;
