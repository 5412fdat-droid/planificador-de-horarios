import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Users, UserPlus, GraduationCap, BookOpen, Building2, UserCircle, LogOut, LayoutDashboard, Contact, Library, Menu, X } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Inicio', path: '/admin', icon: LayoutDashboard },
        { name: 'Crear Usuarios', path: '/admin/usuarios', icon: UserPlus },
        { name: 'Ver Usuarios', path: '/admin/usuarios/ver', icon: Users },
        { name: 'Docentes', path: '/admin/docentes', icon: UserCircle },
        { name: 'Estudiantes', path: '/admin/estudiantes', icon: Contact },
        { name: 'Carreras', path: '/admin/carreras', icon: GraduationCap },
        { name: 'Materias', path: '/admin/materias', icon: BookOpen },
        { name: 'Mallas Curriculares', path: '/admin/mallas', icon: Library },
        { name: 'Aulas', path: '/admin/aulas', icon: Building2 },
    ];

    return (
        <div className="flex h-screen bg-[#f4f7f6] font-sans text-left overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-admin-dark flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-admin-hover shrink-0">
                    <div className="flex items-center">
                        <img src="/logo.png" alt="Logo FIVC" className="w-8 h-auto mr-3" />
                        <span className="font-bold text-white tracking-wide text-sm">PLANIFICADOR FIVC</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white hover:text-gray-200">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-bold rounded-sm transition-colors shadow-sm ${
                                    isActive 
                                    ? 'bg-admin-hover text-admin-text border-l-4 border-admin-text' 
                                    : 'bg-admin-light text-admin-text hover:bg-admin-hover'
                                }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-admin-text' : 'text-admin-dark'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-admin-hover shrink-0">
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-3 text-sm font-bold text-red-700 bg-red-100 rounded-sm hover:bg-red-200 transition-colors shadow-sm"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-700" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col w-full min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-admin-dark border-b border-admin-hover flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
                    <div className="flex items-center">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden mr-4 text-white hover:text-gray-200 p-1 rounded-md"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl font-semibold text-white truncate">Panel de Administración</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{user?.nombre}</p>
                            <p className="text-xs text-admin-light">{user?.rol}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-admin-light flex items-center justify-center text-admin-dark font-bold shrink-0">
                            {user?.nombre?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-8 bg-[#f4f7f6]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
