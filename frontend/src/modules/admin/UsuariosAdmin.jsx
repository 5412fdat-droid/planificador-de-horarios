import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserPlus, AlertCircle, CheckCircle2, Shield, Database, GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UsuariosAdmin = () => {
    const navigate = useNavigate();
    const [carreras, setCarreras] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeRole, setActiveRole] = useState(null); // null, 'Administrador', 'Operador', 'Estudiante'

    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        carnet: '',
        password: '',
        registro: '',
        carrera_id: '',
        avance_academico: ''
    });

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const res = await api.get('admin/carreras/');
                setCarreras(res.data);
            } catch (error) {
                console.error("Error cargando carreras:", error);
            }
        };
        fetchCarreras();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleSelect = (role) => {
        setActiveRole(role);
        setMessage({ type: '', text: '' });
        setFormData({
            nombre: '',
            correo: '',
            carnet: '',
            password: '',
            registro: '',
            carrera_id: '',
            avance_academico: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = { ...formData, rol: activeRole };
            const res = await api.post('admin/usuarios/', payload);
            setMessage({ type: 'success', text: `Usuario ${res.data.nombre} creado exitosamente.` });
            setFormData({
                nombre: '',
                correo: '',
                carnet: '',
                password: '',
                registro: '',
                carrera_id: '',
                avance_academico: ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al crear el usuario.' });
        } finally {
            setLoading(false);
        }
    };

    if (!activeRole) {
        return (
            <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 text-left max-w-4xl mx-auto animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                        <p className="text-gray-500 text-sm">Selecciona el tipo de usuario que deseas agregar al sistema.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                        onClick={() => handleRoleSelect('Administrador')}
                        className="flex flex-col items-center justify-center p-8 border-2 border-transparent bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <Shield className="h-12 w-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold text-gray-800 text-center">Agregar Administrador</h3>
                        <p className="text-sm text-gray-500 text-center mt-2">Control total del sistema.</p>
                    </button>

                    <button 
                        onClick={() => handleRoleSelect('Operador')}
                        className="flex flex-col items-center justify-center p-8 border-2 border-transparent bg-gray-50 rounded-xl hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all group"
                    >
                        <Database className="h-12 w-12 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-lg font-bold text-gray-800 text-center">Agregar Operador de Datos</h3>
                        <p className="text-sm text-gray-500 text-center mt-2">Gestión de planificación.</p>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 text-left max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveRole(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2 border border-gray-200"
                        title="Volver"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        {activeRole === 'Administrador' && <Shield className="h-6 w-6" />}
                        {activeRole === 'Operador' && <Database className="h-6 w-6" />}
                        {activeRole === 'Estudiante' && <GraduationCap className="h-6 w-6" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Crear {activeRole}</h2>
                        <p className="text-gray-500 text-sm">Completa el formulario para registrar el usuario en la base de datos.</p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                        <input type="email" name="correo" value={formData.correo} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Carnet de Identidad</label>
                        <input type="text" name="carnet" value={formData.carnet} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Inicial</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                    </div>
                </div>



                <div className="pt-6 border-t border-gray-100 flex justify-end mt-8">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-blue-200 disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : `Guardar ${activeRole}`}
                        <UserPlus className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UsuariosAdmin;
