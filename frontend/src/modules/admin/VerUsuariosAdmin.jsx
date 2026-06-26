import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, AlertCircle, CheckCircle2, Shield, Database, GraduationCap, Trash2, Power, Filter } from 'lucide-react';

const VerUsuariosAdmin = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState('');
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const res = await api.get('admin/usuarios/');
            setUsuarios(res.data);
        } catch (error) {
            console.error("Error fetching usuarios:", error);
            setMessage({ type: 'error', text: 'Error al cargar los usuarios.' });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (usuario) => {
        try {
            setMessage({ type: '', text: '' });
            const newStatus = !usuario.is_active;
            await api.patch(`admin/usuarios/${usuario.id}/`, { is_active: newStatus });
            
            setUsuarios(usuarios.map(u => 
                u.id === usuario.id ? { ...u, is_active: newStatus } : u
            ));
            
            setMessage({ 
                type: 'success', 
                text: `El usuario ${usuario.nombre} ahora está ${newStatus ? 'ACTIVO' : 'INACTIVO'}.` 
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            setMessage({ type: 'error', text: 'Error al cambiar el estado del usuario.' });
        }
    };

    const deleteUsuario = async (usuario) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
            return;
        }
        
        try {
            setMessage({ type: '', text: '' });
            await api.delete(`admin/usuarios/${usuario.id}/`);
            setUsuarios(usuarios.filter(u => u.id !== usuario.id));
            setMessage({ type: 'success', text: `Usuario ${usuario.nombre} eliminado permanentemente.` });
        } catch (error) {
            console.error("Error deleting usuario:", error);
            setMessage({ type: 'error', text: 'Error al eliminar el usuario. Puede que tenga registros asociados.' });
        }
    };

    const filteredUsuarios = usuarios.filter(u => {
        const matchesSearch = (
            u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.carnet?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesRol = filterRol ? u.rol === filterRol : true;
        return matchesSearch && matchesRol;
    });

    // Lógica de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsuarios = filteredUsuarios.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Reiniciar a la página 1 cuando se busca o filtra
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRol]);

    const getRoleIcon = (rol) => {
        switch (rol) {
            case 'Administrador': return <Shield className="w-4 h-4 text-purple-500" />;
            case 'Operador': return <Database className="w-4 h-4 text-emerald-500" />;
            case 'Estudiante': return <GraduationCap className="w-4 h-4 text-blue-500" />;
            default: return <Users className="w-4 h-4 text-gray-500" />;
        }
    };

    const getRoleBadge = (rol) => {
        switch (rol) {
            case 'Administrador': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Operador': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Estudiante': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[80vh]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Ver Usuarios</h2>
                        <p className="text-slate-500 text-sm mt-1">Gestiona accesos, permisos y elimina cuentas del sistema.</p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar usuario o correo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                        />
                    </div>
                    <div className="relative w-full sm:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            value={filterRol}
                            onChange={(e) => setFilterRol(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm appearance-none"
                        >
                            <option value="">Todos los Roles</option>
                            <option value="Administrador">Administradores</option>
                            <option value="Operador">Operadores de Datos</option>
                        </select>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-300 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Usuario</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Correo Electrónico</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Carnet (CI)</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Rol</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Estado / Permiso</th>
                                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {currentUsuarios.length > 0 ? (
                                    currentUsuarios.map((usuario) => (
                                        <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${usuario.is_active ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                                        {usuario.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${usuario.is_active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{usuario.nombre}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-slate-600">{usuario.correo}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-sm border border-slate-200">{usuario.carnet}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-sm ${getRoleBadge(usuario.rol)}`}>
                                                    {getRoleIcon(usuario.rol)}
                                                    {usuario.rol}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button 
                                                    onClick={() => toggleStatus(usuario)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${usuario.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                                    role="switch"
                                                    aria-checked={usuario.is_active}
                                                    title={usuario.is_active ? "Desactivar usuario" : "Activar usuario"}
                                                >
                                                    <span className="sr-only">Cambiar estado</span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${usuario.is_active ? 'translate-x-5' : 'translate-x-0'}`}
                                                    />
                                                </button>
                                                <span className={`ml-3 text-xs font-medium ${usuario.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                    {usuario.is_active ? 'Activo' : 'Suspendido'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => deleteUsuario(usuario)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar permanentemente"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-500">
                                            No se encontraron usuarios que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Controles de Paginación */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Mostrando <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> a <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredUsuarios.length)}</span> de <span className="font-medium text-gray-900">{filteredUsuarios.length}</span> resultados
                                </div>
                                <div className="flex gap-2">
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
            )}
        </div>
    );
};

export default VerUsuariosAdmin;
