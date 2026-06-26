import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShieldCheck, Layers, Search, ArrowRight, BookOpen, GraduationCap, Utensils, Home, Newspaper, Monitor, Calculator, Leaf, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/noticias/');
        // Las noticias ya vienen ordenadas descendentemente por fecha desde el backend
        setNewsData(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Hero Section */}
      <div 
        className="relative pt-12 pb-20 sm:pt-20 sm:pb-24 bg-cover bg-center bg-no-repeat flex items-center justify-center min-h-[80vh]" 
        style={{ backgroundImage: "url('/fondo_principal.png')" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 sm:px-12 sm:py-16 text-center bg-black/40 backdrop-blur-sm rounded-[3rem] shadow-2xl mx-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-100 font-bold text-sm mb-8 backdrop-blur-md border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            Sistema ERP de Gestión Académica
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight drop-shadow-lg">
            Planifica tus materias <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 drop-shadow-md">
              sin conflictos de horario
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-100 mb-10 leading-relaxed font-medium drop-shadow-md">
            Un planificador interactivo diseñado para estudiantes de Ingeniería en Sistemas, Contaduría Pública y Agropecuaria de la U.A.G.R.M.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/planificador')}
              className="w-full sm:w-auto px-8 py-4 bg-uagrm-dark hover:bg-blue-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 border border-white/10"
            >
              <Calendar className="w-5 h-5" /> Planificar mi Horario
            </button>
            {!user && (
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-bold text-lg transition-all shadow-sm backdrop-blur-sm"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Una herramienta diseñada para tu éxito</h2>
            <p className="mt-4 text-lg text-slate-600">Olvídate de las sorpresas en la inscripción oficial.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Detección de Colisiones</h3>
              <p className="text-slate-600 leading-relaxed">
                El algoritmo evalúa en tiempo real tus selecciones y te alerta inmediatamente si dos materias chocan en horario o aula.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Múltiples Escenarios</h3>
              <p className="text-slate-600 leading-relaxed">
                Crea un Plan A, Plan B y Plan C. Experimenta con diferentes materias y horarios antes del periodo oficial de inscripciones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Exportación PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Una vez que tengas tu horario ideal, guárdalo y expórtalo en formato PDF para tenerlo siempre a mano en tu celular.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Institucional / Carreras */}
      <div className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Facultad Integral de los Valles Cruceños</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Planificador de horarios disponible para las 4 carreras</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">
              Nuestro sistema ERP está optimizado para generar, gestionar y simular colisiones de horarios específicamente para los planes de estudio de las siguientes carreras.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Ingeniería de Sistemas</h4>
                <p className="text-sm text-slate-500 mt-1">Desarrollo de software y gestión tecnológica.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Contaduría Pública</h4>
                <p className="text-sm text-slate-500 mt-1">Gestión financiera, auditoría y tributación.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Leaf className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Ingeniería Agropecuaria</h4>
                <p className="text-sm text-slate-500 mt-1">Producción agrícola y desarrollo rural sostenible.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Industrialización de Alimentos</h4>
                <p className="text-sm text-slate-500 mt-1">Procesamiento y control de calidad alimentaria.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Noticias */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Newspaper className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Avisos y Noticias</h2>
            </div>
            <button onClick={() => navigate('/noticias')} className="hidden sm:flex text-blue-600 font-medium hover:text-blue-700 items-center gap-1">
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {loadingNews ? (
              <div className="col-span-3 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : newsData.length > 0 ? (
              newsData.map((news) => (
                <div key={news.id} className="group cursor-pointer bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden" onClick={() => setSelectedNews(news)}>
                  <div className="h-52 bg-slate-200 relative flex items-center justify-center overflow-hidden">
                    {news.imagen_url ? (
                      <img 
                        src={news.imagen_url} 
                        alt={news.categoria} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Newspaper className="w-16 h-16 text-slate-400 group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <span className={`uppercase text-${news.color_categoria || 'blue'}-700 font-bold text-sm tracking-wide mb-3`}>
                      {news.categoria}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-3 leading-snug line-clamp-3">
                      {news.titulo}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-2 flex-1">
                      {news.extracto}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 mt-auto">
                    <p className="text-sm text-slate-500">
                      {new Date(news.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ de ([a-z])/g, (m, l) => ` de ${l.toUpperCase()}`)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-12 text-center text-slate-500">
                <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No hay avisos o noticias en este momento.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <button onClick={() => navigate('/noticias')} className="text-blue-600 font-medium hover:text-blue-700 items-center gap-1 inline-flex">
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>


      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center">
              {selectedNews.imagen_url ? (
                <img src={selectedNews.imagen_url} alt={selectedNews.titulo} className="w-full h-full object-cover" />
              ) : (
                <Newspaper className="w-20 h-20 text-slate-300" />
              )}
              <button 
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-6">
                <span className={`px-4 py-1.5 bg-${selectedNews.color_categoria}-600 text-white text-sm font-bold rounded-full shadow-lg`}>
                  {selectedNews.categoria}
                </span>
              </div>
            </div>
            <div className="p-8">
              <p className="text-sm text-slate-500 mb-3 font-medium">
                {new Date(selectedNews.fecha_publicacion).toLocaleDateString()}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{selectedNews.titulo}</h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-6" />
              <div className="text-slate-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {selectedNews.contenido}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
