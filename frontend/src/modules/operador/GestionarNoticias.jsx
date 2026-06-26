import React, { useState } from 'react';
import { Newspaper, Save, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const GestionarNoticias = () => {
    const [formData, setFormData] = useState({
        titulo: '',
        categoria: '',
        color_categoria: 'blue',
        imagen_url: '',
        extracto: '',
        contenido: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/noticias/', formData);
            setSuccess('¡Noticia publicada exitosamente!');
            setFormData({
                titulo: '',
                categoria: '',
                color_categoria: 'blue',
                imagen_url: '',
                extracto: '',
                contenido: ''
            });
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError('Error al publicar la noticia. Por favor, revisa los datos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Newspaper className="w-6 h-6 text-blue-600" />
                    Publicar Nueva Noticia
                </h2>
                <p className="text-slate-500 mt-1">Crea un nuevo aviso o noticia que será visible para todos los estudiantes en el portal principal.</p>
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Título de la Noticia</label>
                        <input 
                            type="text" 
                            name="titulo"
                            required 
                            placeholder="Ej: Inicio de inscripciones para el Semestre II"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.titulo}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                            <input 
                                type="text" 
                                name="categoria"
                                required 
                                placeholder="Ej: Académico, Deportes, Eventos..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.categoria}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Color de la Categoría</label>
                            <select
                                name="color_categoria"
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={formData.color_categoria}
                                onChange={handleChange}
                            >
                                <option value="blue">Azul (Académico / Informativo)</option>
                                <option value="red">Rojo (Urgente / Importante)</option>
                                <option value="green">Verde (Éxitos / Medio Ambiente)</option>
                                <option value="amber">Naranja (Deportes / Eventos)</option>
                                <option value="purple">Morado (Institucional)</option>
                                <option value="slate">Gris (General)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            URL de la Imagen de Portada (Opcional)
                        </label>
                        <input 
                            type="url" 
                            name="imagen_url"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.imagen_url}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-slate-500 mt-2">Puedes pegar el enlace de cualquier imagen alojada en internet. Si lo dejas vacío, se usará un diseño por defecto.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Extracto Corto</label>
                        <input 
                            type="text" 
                            name="extracto"
                            required 
                            maxLength="500"
                            placeholder="Breve resumen que aparecerá en la tarjeta de la noticia..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.extracto}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Contenido Completo</label>
                        <textarea 
                            name="contenido"
                            required 
                            rows="8"
                            placeholder="Escribe aquí todo el cuerpo de la noticia o aviso..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.contenido}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Publicar Noticia
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default GestionarNoticias;
