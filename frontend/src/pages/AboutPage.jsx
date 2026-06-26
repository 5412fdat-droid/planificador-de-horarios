import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Eye, MapPin, Award } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-8 justify-between sticky top-20 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Acerca de la Facultad</h1>
          </div>
        </div>
      </header>

      {/* Hero Image Section */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/80 z-10" />
        <img 
          src="/fondo_info.png" 
          alt="Campus Universitario" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <span className="text-blue-300 font-bold tracking-widest uppercase text-sm mb-2">Universidad Autónoma Gabriel René Moreno</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">Facultad Integral de los Valles Cruceños</h1>
          <p className="text-slate-300 max-w-2xl text-lg">
            Formando líderes y profesionales que impulsan el desarrollo de nuestra región y del país.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Misión y Visión */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nuestra Misión</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Formar profesionales competentes, éticos y comprometidos con el desarrollo sostenible de la región de los valles cruceños y del país, promoviendo la investigación científica, la innovación tecnológica y la interacción social.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <Eye className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nuestra Visión</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Ser la facultad de referencia académica, científica y tecnológica en la región de los Valles Cruceños, reconocida por la excelencia de sus graduados y su contribución integral al progreso de la sociedad.
            </p>
          </div>
        </div>

        {/* Historia */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-16">
          <div className="md:flex">
            <div className="md:w-1/3 bg-slate-100 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200 text-center">
              <Award className="w-16 h-16 text-blue-600 mb-4" />
              <h2 className="text-3xl font-bold text-slate-900">Nuestra Historia</h2>
              <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full" />
            </div>
            <div className="md:w-2/3 p-8 sm:p-12">
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                La Facultad Integral de los Valles Cruceños (F.I.V.C.) tiene sus profundas raíces en el antiguo Tecnológico Universitario Vallegrande. Nació con el firme propósito de descentralizar la educación superior y llevar oportunidades académicas de excelencia a las provincias de los valles.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                Hoy en día, nuestra institución se ha consolidado como el principal motor de desarrollo intelectual y tecnológico de la región, ofertando programas de grado altamente demandados como Ingeniería en Sistemas, Contaduría Pública e Ingeniería Agropecuaria, adaptándose a las necesidades socio-productivas de nuestro entorno.
              </p>
            </div>
          </div>
        </div>

        {/* Localización */}
        <div className="text-center bg-blue-900 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
          <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-4 relative z-10" />
          <h2 className="text-3xl font-bold mb-4 relative z-10">Ubicación Estratégica</h2>
          <p className="text-blue-100 text-xl max-w-2xl mx-auto relative z-10">
            Nuestras instalaciones académicas, administrativas y laboratorios se encuentran ubicados estratégicamente sobre la <strong>Avenida Ejército</strong>, en la ciudad de <strong>Vallegrande, Santa Cruz, Bolivia</strong>.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
