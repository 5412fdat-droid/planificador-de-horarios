import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import PlanificadorPage from '../pages/PlanificadorPage';
import MallasPage from '../pages/MallasPage';
import AboutPage from '../pages/AboutPage';
import Navbar from '../components/layout/Navbar';
import Login from '../modules/auth/Login';
import AdminLayout from '../modules/admin/AdminLayout';
import DashboardAdmin from '../modules/admin/DashboardAdmin';
import UsuariosAdmin from '../modules/admin/UsuariosAdmin';
import VerUsuariosAdmin from '../modules/admin/VerUsuariosAdmin';
import DocentesAdmin from '../modules/admin/DocentesAdmin';
import CarrerasAdmin from '../modules/admin/CarrerasAdmin';
import MateriasAdmin from '../modules/admin/MateriasAdmin';
import AulasAdmin from '../modules/admin/AulasAdmin';
import EstudiantesAdmin from '../modules/admin/EstudiantesAdmin';
import MallaCurricularAdmin from '../modules/admin/MallaCurricularAdmin';
import DashboardOperador from '../modules/operador/DashboardOperador';
import GestorHorariosOperador from '../modules/operador/GestorHorariosOperador';
import ResumenHorariosOperador from '../modules/operador/ResumenHorariosOperador';
import OperadorLayout from '../modules/operador/OperadorLayout';
import GestionarNoticias from '../modules/operador/GestionarNoticias';
import VerNoticias from '../modules/operador/VerNoticias';
import VerDocentesOperador from '../modules/operador/VerDocentesOperador';
import VerMallasOperador from '../modules/operador/VerMallasOperador';
import { AuthContext } from '../context/AuthContext';
import NoticiasPage from '../pages/NoticiasPage';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    if (!user) return <Navigate to="/" />;
    if (role && user.rol !== role) return <Navigate to="/" />;
    
    return children;
};

// Componente temporal para las pantallas de los módulos
const PlaceholderModule = ({ title }) => (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-500">Este módulo será programado próximamente.</p>
    </div>
);

// Layout para páginas públicas con Navbar
const PublicLayout = () => {
    const location = useLocation();
    const hideFooter = location.pathname === '/planificador' || location.pathname === '/login';
    
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <div className="pt-20 flex-grow flex flex-col">
                <Outlet />
            </div>
            {!hideFooter && (
                <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800/60 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                        <div className="text-sm text-center flex flex-col gap-2">
                            <p className="text-slate-300 font-medium text-base tracking-wide">Contacto de Desarrolladores: 67854712 - 68841976 - 75016277</p>
                            <p className="text-slate-400 font-medium">© {new Date().getFullYear()} Facultad Integral de los Valles Cruceños</p>
                            <p className="text-slate-500 text-sm">Sistema de Gestión e Información Académica.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

const AppRouter = () => {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/planificador" element={<PlanificadorPage />} />
                <Route path="/mallas" element={<MallasPage />} />
                <Route path="/nosotros" element={<AboutPage />} />
                <Route path="/noticias" element={<NoticiasPage />} />
            </Route>
            
            {/* Rutas del Administrador con el Layout Integrado */}
            <Route path="/admin" element={
                <PrivateRoute role="Administrador">
                    <AdminLayout />
                </PrivateRoute>
            }>
                {/* index indica que esta es la vista principal que carga en /admin */}
                <Route index element={<DashboardAdmin />} />
                <Route path="usuarios" element={<UsuariosAdmin />} />
                <Route path="usuarios/ver" element={<VerUsuariosAdmin />} />
                <Route path="docentes" element={<DocentesAdmin />} />
                <Route path="carreras" element={<CarrerasAdmin />} />
                <Route path="materias" element={<MateriasAdmin />} />
                <Route path="aulas" element={<AulasAdmin />} />
                <Route path="mallas" element={<MallaCurricularAdmin />} />
                <Route path="estudiantes" element={<EstudiantesAdmin />} />
            </Route>
            
            <Route path="/operador" element={
                <PrivateRoute role="Operador">
                    <OperadorLayout />
                </PrivateRoute>
            }>
                <Route index element={<DashboardOperador />} />
                <Route path="horarios" element={<GestorHorariosOperador />} />
                <Route path="resumen" element={<ResumenHorariosOperador />} />
                <Route path="docentes" element={<VerDocentesOperador />} />
                <Route path="mallas" element={<VerMallasOperador />} />
                <Route path="noticias" element={<VerNoticias />} />
                <Route path="noticias/crear" element={<GestionarNoticias />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRouter;
