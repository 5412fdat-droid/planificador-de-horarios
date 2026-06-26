import React, { useState, useEffect } from 'react';
import { Newspaper, Edit2, Trash2, Plus, AlertCircle, X, Check, Search } from 'lucide-react';
import api from '../../services/api';

const VerNoticias = () => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingNoticia, setEditingNoticia] = useState(null);

    useEffect(() => {
        fetchNoticias();
    }, []);

    const fetchNoticias = async () => {
        try {
            setLoading(true);
            const response = await api.get('/noticias/');
            setNoticias(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar las noticias.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta noticia?')) {
            try {
                await api.delete(`/noticias/${id}/`);
                setNoticias(noticias.filter(n => n.id !== id));
                setSuccess('Noticia eliminada correctamente.');
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Error al eliminar la noticia.');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(`/noticias/${editingNoticia.id}/`, editingNoticia);
            setNoticias(noticias.map(n => n.id === editingNoticia.id ? response.data : n));
            setEditingNoticia(null);
            setSuccess('Noticia actualizada correctamente.');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Error al actualizar la noticia.');
            setTimeout(() => setError(''), 3000);
        }
    };

    const filteredNoticias = noticias.filter(n => 
        n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Newspaper className="w-6 h-6 text-blue-600" />
                        Ver Noticias
                    </h2>
                    <p className="text-slate-500 mt-1">Administra las noticias publicadas en el portal.</p>
                </div>
                
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar noticia..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {success}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNoticias.map((noticia) => (
                        <div key={noticia.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all hover:shadow-md">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {noticia.imagen_url ? (
                                    <img src={noticia.imagen_url} alt={noticia.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-400">
                                        <Newspaper className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full bg-${noticia.color_categoria}-500 text-white shadow-sm`}>
                                        {noticia.categoria}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2">{noticia.titulo}</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-3 flex-1">{noticia.extracto}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                    <span className="text-xs text-slate-400">
                                        {new Date(noticia.fecha_publicacion).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingNoticia(noticia)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(noticia.id)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredNoticias.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No se encontraron noticias.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Edición */}
            {editingNoticia && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-slate-800">Editar Noticia</h3>
                            <button 
                                onClick={() => setEditingNoticia(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingNoticia.titulo}
                                    onChange={(e) => setEditingNoticia({...editingNoticia, titulo: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingNoticia.categoria}
                                        onChange={(e) => setEditingNoticia({...editingNoticia, categoria: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Color (Inglés)</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingNoticia.color_categoria}
                                        onChange={(e) => setEditingNoticia({...editingNoticia, color_categoria: e.target.value})}
                                    >
                                        <option value="blue">Azul (blue)</option>
                                        <option value="red">Rojo (red)</option>
                                        <option value="green">Verde (green)</option>
                                        <option value="amber">Naranja (amber)</option>
                                        <option value="purple">Morado (purple)</option>
                                        <option value="slate">Gris (slate)</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen (Opcional)</label>
                                <input 
                                    type="url" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingNoticia.imagen_url || ''}
                                    onChange={(e) => setEditingNoticia({...editingNoticia, imagen_url: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Extracto Corto</label>
                                <input 
                                    type="text" 
                                    required 
                                    maxLength="500"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingNoticia.extracto}
                                    onChange={(e) => setEditingNoticia({...editingNoticia, extracto: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Contenido Completo</label>
                                <textarea 
                                    required 
                                    rows="6"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={editingNoticia.contenido}
                                    onChange={(e) => setEditingNoticia({...editingNoticia, contenido: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setEditingNoticia(null)}
                                    className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerNoticias;
