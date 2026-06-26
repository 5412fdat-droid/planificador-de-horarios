import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Menu, X, LogOut, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
      logout();
      navigate('/');
  };

  return (
    <>
      <nav className="fixed w-full top-0 z-[100] bg-[#8B0000]/90 backdrop-blur-md border-b border-[#6A0000]/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Logo FIVC" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white leading-none tracking-tight">Planificador</h1>
                <p className="text-xs sm:text-sm text-[#FFD700] font-medium">F.I.V.C.</p>
              </div>
            </div>

            {/* Acciones Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate('/nosotros')}
                className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg font-medium transition-all"
              >
                Acerca de la Facultad
              </button>
              <button 
                onClick={() => navigate('/mallas')}
                className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg font-medium transition-all"
              >
                Mallas Curriculares
              </button>
              <button 
                onClick={() => navigate('/noticias')}
                className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg font-medium transition-all"
              >
                Noticias
              </button>
              <button 
                onClick={() => navigate('/planificador')}
                className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg font-medium transition-all"
              >
                Planificador
              </button>

              {user ? (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-white leading-tight">{user.nombre}</span>
                    <span className="text-xs text-[#FFD700] font-medium">{user.rol}</span>
                  </div>
                  {(user.rol === 'Administrador' || user.rol === 'Operador') && (
                    <button 
                      onClick={() => navigate(user.rol === 'Administrador' ? '/admin' : '/operador')}
                      className="text-white hover:text-[#FFD700] font-bold transition-colors"
                    >
                      Panel
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-white/80 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-[#8B0000] text-white px-6 py-2 rounded-md font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  Iniciar Sesión <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hamburger Button Mobile */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden absolute w-full bg-[#8B0000] border-t border-[#6A0000] shadow-2xl transition-all duration-300 ease-out transform origin-top ${
            isMenuOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible pointer-events-none'
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/nosotros'); }}
              className="block w-full text-left px-4 py-3 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Acerca de la Facultad
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/mallas'); }}
              className="block w-full text-left px-4 py-3 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Mallas Curriculares
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/noticias'); }}
              className="block w-full text-left px-4 py-3 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Noticias
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/planificador'); }}
              className="block w-full text-left px-4 py-3 text-gray-200 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              Planificador
            </button>

            {user ? (
              <div className="pt-2 border-t border-[#6A0000] mt-4">
                <div className="px-4 py-3 bg-white/10 rounded-xl mb-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.nombre}</p>
                    <p className="text-xs font-medium text-[#FFD700]">{user.rol}</p>
                  </div>
                </div>
                {(user.rol === 'Administrador' || user.rol === 'Operador') && (
                  <button 
                    onClick={() => { setIsMenuOpen(false); navigate(user.rol === 'Administrador' ? '/admin' : '/operador'); }}
                    className="block w-full text-left px-4 py-3 text-[#FFD700] hover:bg-white/10 rounded-xl font-bold transition-colors"
                  >
                    Ir al Panel
                  </button>
                )}
                <button 
                  onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-2 mt-2 bg-white/10 text-white hover:bg-red-600 px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button 
                  onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                  className="w-full bg-white hover:bg-gray-100 text-[#8B0000] px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Iniciar Sesión <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
