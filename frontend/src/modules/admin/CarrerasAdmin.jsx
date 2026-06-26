import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, AlertCircle, CheckCircle2, Search } from 'lucide-react';

const CarrerasAdmin = () => {
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        nombre_carrera: '',
        sigla_carrera: ''
    });
    const [editingId, setEditingId] = useState(null);

    // Búsqueda y Paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCarreras();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await api.put(`admin/carreras/${editingId}/`, formData);
                setMessage({ type: 'success', text: `Carrera actualizada exitosamente.` });
            } else {
                const res = await api.post('admin/carreras/', formData);
                setMessage({ type: 'success', text: `Carrera ${res.data.nombre_carrera} registrada exitosamente.` });
            }
            setFormData({ nombre_carrera: '', sigla_carrera: '' });
            setEditingId(null);
            fetchCarreras();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al registrar la carrera. Verifica que el plan de estudio no esté duplicado.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        setFormData({
            nombre_carrera: c.nombre_carrera,
            sigla_carrera: c.sigla_carrera
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta carrera?')) return;
        try {
            await api.delete(`admin/carreras/${id}/`);
            setMessage({ type: 'success', text: 'Carrera eliminada correctamente.' });
            fetchCarreras();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar. Asegúrate de que no tenga materias ni horarios asignados.' });
        }
    };

    // Filtro y Paginación
    const filteredCarreras = carreras.filter(c => 
        (c.nombre_carrera || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sigla_carrera || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCarreras = filteredCarreras.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCarreras.length / itemsPerPage) || 1;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 text-left w-full animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Carreras</h2>
                    <p className="text-gray-500 text-sm">Administra las carreras y mallas curriculares de la facultad.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="h-5 w-5 text-blue-600" /> {editingId ? 'Editar Carrera' : 'Nueva Carrera'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Carrera</label>
                            <input type="text" name="nombre_carrera" value={formData.nombre_carrera} onChange={handleChange} required
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plan de Estudio</label>
                            <input type="text" name="sigla_carrera" value={formData.sigla_carrera} onChange={handleChange} required placeholder="Ej: 168-0"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase" />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="submit" disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors shadow-md shadow-blue-200 disabled:opacity-50">
                                {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar Carrera')}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => {
                                    setEditingId(null);
                                    setFormData({ nombre_carrera: '', sigla_carrera: '' });
                                }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                        
                        {/* Buscador */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar carrera por nombre o plan de estudio..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Plan de Estudio</th>
                                    <th className="px-6 py-4">Nombre de la Carrera</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentCarreras.length > 0 ? (
                                    currentCarreras.map((c) => (
                                        <tr key={c.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{c.sigla_carrera}</td>
                                            <td className="px-6 py-4">{c.nombre_carrera}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleEdit(c)} className="text-blue-600 hover:underline mr-3">Editar</button>
                                                <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Eliminar</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                                            No hay carreras registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                        
                        {/* Controles de Paginación */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Mostrando <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> a <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredCarreras.length)}</span> de <span className="font-medium text-gray-900">{filteredCarreras.length}</span> resultados
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
    );
};

export default CarrerasAdmin;
