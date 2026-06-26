import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarDays, AlertCircle, CheckCircle2, ChevronRight, Clock } from 'lucide-react';

const CrearHorarioOperador = () => {
    const [step, setStep] = useState(1);
    const [carreras, setCarreras] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [gruposExistentes, setGruposExistentes] = useState([]);
    const [isCustomGrupo, setIsCustomGrupo] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [selection, setSelection] = useState({
        carrera_id: '',
        tipo_periodo: ''
    });

    const [formData, setFormData] = useState({
        materia_id: '',
        docente_id: '',
        aula_id: '',
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
        nombre_grupo: 'A',
        cupo_limite: 40,
        gestion: '1/2026'
    });

    const fetchInitialData = async () => {
        try {
            const [carrerasRes, docentesRes, aulasRes, gruposRes] = await Promise.all([
                api.get('admin/operador/carreras/'),
                api.get('admin/docentes/'),
                api.get('admin/aulas/'),
                api.get('admin/operador/grupos/')
            ]);
            setCarreras(carrerasRes.data);
            setDocentes(docentesRes.data);
            setAulas(aulasRes.data);
            setGruposExistentes(gruposRes.data);
        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleSelectionChange = (e) => {
        setSelection({ ...selection, [e.target.name]: e.target.value });
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

        if (!selection.carrera_id) {
            setMessage({ type: 'error', text: 'Debes seleccionar una carrera.' });
            return;
        }
        
        setMessage({ type: '', text: '' });
        setLoading(true);
        try {
            const res = await api.get(`admin/operador/materias/autocomplete/?carrera_id=${selection.carrera_id}`);
            setMaterias(res.data);
            if (res.data.length === 0) {
                setMessage({ type: 'error', text: 'No se encontraron materias para esta carrera.' });
            } else {
                setStep(2);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cargar materias.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('admin/operador/horarios/', formData);
            setMessage({ type: 'success', text: '¡Horario creado y asignado exitosamente sin choques!' });
            // Reset fields
            setFormData({
                ...formData,
                materia_id: '',
                docente_id: '',
                aula_id: '',
                dia_semana: '',
                hora_inicio: '',
                hora_fin: ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error de validación de choques o servidor.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-left w-full animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Creación de Horarios</h2>
                    <p className="text-gray-500 text-sm">Asigna materias a docentes y aulas sin cruces de horarios.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {step === 1 && (
                <div className="max-w-2xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Paso 1: Configuración Inicial</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona la Carrera</label>
                            <select name="carrera_id" value={selection.carrera_id} onChange={handleSelectionChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                <option value="">-- Carreras --</option>
                                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre_carrera}</option>)}
                            </select>
                        </div>

                        <button onClick={continueToForm} disabled={loading}
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors mt-4">
                            {loading ? 'Cargando materias...' : 'Continuar'} <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-4xl bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" /> Paso 2: Asignación de Grupo y Horario
                        </h3>
                        <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">
                            ← Volver
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Materia y Docente */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                                <select name="materia_id" value={formData.materia_id} onChange={handleFormChange} required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">-- Selecciona la Materia --</option>
                                    {materias.map(m => <option key={m.id} value={m.id}>{m.sigla_materia} - {m.nombre_materia}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Docente Asignado</label>
                                <select name="docente_id" value={formData.docente_id} onChange={handleFormChange} required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">-- Selecciona el Docente --</option>
                                    {docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_docente}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                                    {!isCustomGrupo ? (
                                        <select 
                                            name="nombre_grupo" 
                                            value={formData.nombre_grupo} 
                                            onChange={(e) => {
                                                if (e.target.value === 'OTRO') {
                                                    setIsCustomGrupo(true);
                                                    setFormData(prev => ({...prev, nombre_grupo: ''}));
                                                } else {
                                                    handleFormChange(e);
                                                }
                                            }} 
                                            className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500"
                                        >
                                            <option value="">-- Selecciona --</option>
                                            <option value="AV">AV (Mañana)</option>
                                            <option value="VA">VA (Tarde/Noche)</option>
                                            {gruposExistentes.filter(g => g !== 'AV' && g !== 'VA').map((g, i) => (
                                                <option key={`ce-${i}`} value={g}>{g}</option>
                                            ))}
                                            <option value="OTRO" className="font-bold text-blue-600">+ Agregar Nuevo Grupo</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                name="nombre_grupo" 
                                                value={formData.nombre_grupo} 
                                                onChange={handleFormChange} 
                                                placeholder="Ej: B, SA..." 
                                                className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500 uppercase" 
                                                autoFocus
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => { setIsCustomGrupo(false); setFormData(prev => ({...prev, nombre_grupo: ''})); }}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300"
                                                title="Cancelar y volver a la lista"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Límite</label>
                                    <input type="number" name="cupo_limite" value={formData.cupo_limite} onChange={handleFormChange} required min="1"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Tiempos y Aula */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Aula</label>
                                <select name="aula_id" value={formData.aula_id} onChange={handleFormChange} required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">-- Selecciona el Aula --</option>
                                    {aulas.map(a => <option key={a.id} value={a.id}>{a.nombre_aula}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana</label>
                                <select name="dia_semana" value={formData.dia_semana} onChange={handleFormChange} required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="">-- Día --</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miercoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sabado">Sábado</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                                    <input type="time" name="hora_inicio" value={formData.hora_inicio} onChange={handleFormChange} required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                                    <input type="time" name="hora_fin" value={formData.hora_fin} onChange={handleFormChange} required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button type="submit" disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md shadow-blue-200 disabled:opacity-50">
                                {loading ? 'Validando y Guardando...' : 'Guardar Horario (Validar Choques)'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CrearHorarioOperador;
