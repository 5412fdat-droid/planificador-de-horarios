import React, { useState, useEffect } from 'react';
import { Newspaper, Search, X, Calendar } from 'lucide-react';
import api from '../services/api';

const NoticiasPage = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/noticias/');
        setNewsData(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          news.extracto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          news.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (filterDate) {
      const d = new Date(news.fecha_publicacion);
      const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      matchesDate = localDateStr === filterDate;
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm py-8 px-4 sm:px-8 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Avisos y Noticias</h1>
              <p className="text-slate-500 text-sm mt-1">Mantente informado con los últimos comunicados de la F.I.V.C.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar noticias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
            
            {/* Date Filter */}
            <div className="relative w-full sm:w-48">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-600"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((news) => (
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
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron noticias</h3>
            <p>Intenta con otra búsqueda o fecha distinta.</p>
            {(searchTerm || filterDate) && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterDate(''); }}
                className="mt-6 px-6 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </main>

      {/* News Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center flex-shrink-0">
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
                <span className={`px-4 py-1.5 bg-${selectedNews.color_categoria || 'blue'}-600 text-white text-sm font-bold rounded-full shadow-lg`}>
                  {selectedNews.categoria}
                </span>
              </div>
            </div>
            <div className="p-8 overflow-y-auto">
              <p className="text-sm text-slate-500 mb-3 font-medium">
                {new Date(selectedNews.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ de ([a-z])/g, (m, l) => ` de ${l.toUpperCase()}`)}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-tight">{selectedNews.titulo}</h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mb-6 flex-shrink-0" />
              <div className="text-slate-600 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {selectedNews.contenido}
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100">
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

export default NoticiasPage;
