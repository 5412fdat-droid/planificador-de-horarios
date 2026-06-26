import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [registro, setRegistro] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirigir automáticamente si el usuario ya está logueado
    React.useEffect(() => {
        if (user) {
            if (user.rol === 'Administrador') navigate('/admin');
            else if (user.rol === 'Operador') navigate('/operador');
            else navigate('/planificador');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(registro, password);
            if (user.rol === 'Administrador') {
                navigate('/admin');
            } else if (user.rol === 'Operador') {
                navigate('/operador');
            } else {
                navigate('/planificador');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Error de conexión con el servidor');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans p-4 relative">
            {/* Cabecera UAGRM / Logo */}
            <div className="flex flex-col items-center gap-6 mb-10 mt-8 sm:mt-0">
                <div className="text-center animate-in slide-in-from-top-4 duration-500">
                    <h2 className="text-3xl sm:text-4xl font-black text-red-700 tracking-widest uppercase drop-shadow-sm">
                        Bienvenidos
                    </h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-white/40 p-6 rounded-3xl shadow-sm border border-white/60 backdrop-blur-md animate-in fade-in zoom-in duration-700">
                    <img src="/logo.png" alt="Logo FIVC" className="w-24 sm:w-28 h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-500" />
                    <div className="flex flex-col text-center sm:text-left">
                        <span className="text-lg sm:text-xl text-slate-500 font-serif tracking-[0.4em] uppercase mb-2">
                            Universidad Autónoma
                        </span>
                        <span className="text-3xl sm:text-4xl text-slate-800 font-serif font-bold tracking-wide mb-3">
                            Gabriel René Moreno
                        </span>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent sm:from-slate-300 sm:via-slate-300 sm:to-transparent mb-3"></div>
                        <span className="text-sm sm:text-base font-bold text-blue-800 tracking-[0.2em] uppercase">
                            Facultad Integral de los Valles Cruceños
                        </span>
                    </div>
                </div>
            </div>

            {/* Caja principal de Login */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
                
                {/* Formulario */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold text-slate-800">
                            Iniciar Sesión
                        </h3>
                        <p className="text-slate-500 text-sm mt-2">
                            Ingresa con tus credenciales institucionales.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100 font-medium">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Número de Registro / Usuario
                            </label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Ej. 218000000"
                                value={registro}
                                onChange={(e) => setRegistro(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Contraseña
                            </label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3.5 rounded-xl font-bold text-white transition-all mt-2 shadow-lg hover:scale-[1.02] bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                        >
                            Ingresar
                        </button>
                    </form>
                    

                </div>
            </div>
        </div>
    );
};

export default Login;
