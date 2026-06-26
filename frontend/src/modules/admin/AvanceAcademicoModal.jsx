import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Printer, Plus, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

const AvanceAcademicoModal = ({ student, onClose }) => {
    const [historial, setHistorial] = useState([]);
    const [materiasCarrera, setMateriasCarrera] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedSemester, setSelectedSemester] = useState('');
    
    const [formData, setFormData] = useState({
        materia: '',
        gestion: '',
        nota: ''
    });

    useEffect(() => {
        if (student) {
            fetchHistorial();
            fetchMateriasCarrera();
        }
    }, [student]);

    const fetchHistorial = async () => {
        try {
            const res = await api.get(`admin/estudiantes/${student.id}/historial/`);
            setHistorial(res.data);
        } catch (error) {
            console.error("Error cargando historial", error);
        }
    };

    const fetchMateriasCarrera = async () => {
        try {
            const res = await api.get('admin/materias/');
            const materias = res.data.filter(m => m.carrera_id == student.carrera || m.carrera == student.carrera);
            setMateriasCarrera(materias);
        } catch (error) {
            console.error("Error cargando materias", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddNota = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        if (formData.nota < 0 || formData.nota > 100) {
            setMessage({ type: 'error', text: 'La nota debe estar entre 0 y 100.' });
            setLoading(false);
            return;
        }

        try {
            await api.post(`admin/estudiantes/${student.id}/historial/`, {
                materia: formData.materia,
                gestion: formData.gestion,
                nota: formData.nota
            });
            setMessage({ type: 'success', text: 'Nota registrada correctamente.' });
            setFormData({ ...formData, materia: '', nota: '' });
            fetchHistorial();
        } catch (error) {
            let errorMsg = 'Error al registrar nota.';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.materia) errorMsg = data.materia[0];
                else if (data.gestion) errorMsg = data.gestion[0];
                else if (data.nota) errorMsg = data.nota[0];
                else if (data.error) errorMsg = data.error;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHistorial = async (id) => {
        if (window.confirm('¿Eliminar esta materia del historial?')) {
            try {
                await api.delete(`admin/historial/${id}/`);
                setMessage({ type: 'success', text: 'Nota eliminada correctamente.' });
                fetchHistorial();
            } catch (error) {
                setMessage({ type: 'error', text: 'Error al eliminar la nota.' });
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const ppac = historial.length > 0 
        ? Math.round(historial.reduce((acc, curr) => acc + parseFloat(curr.nota), 0) / historial.length) 
        : 0;

    const semestres = [...new Set(materiasCarrera.map(m => m.periodo_materia || '1'))].sort((a, b) => parseInt(a) - parseInt(b));
    const materiasFiltradas = selectedSemester 
        ? materiasCarrera.filter(m => (m.periodo_materia || '1') === selectedSemester)
        : materiasCarrera;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:bg-white print:p-0">
            <style type="text/css" media="print">
                {`
                    body * {
                        visibility: hidden;
                    }
                    #avance-academico-modal, #avance-academico-modal * {
                        visibility: visible;
                    }
                    #avance-academico-modal {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        margin: 0;
                        padding: 0;
                    }
                `}
            </style>
            <div id="avance-academico-modal" className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 print:shadow-none print:rounded-none print:overflow-visible print:max-h-none print:h-auto print:bg-white">
                
                {/* Header del modal principal */}
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0 print:border-none print:px-0">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Avance Académico
                    </h2>
                    <div className="flex items-center gap-3 print:hidden">
                        <button onClick={handlePrint} className="bg-[#00a8b4] hover:bg-[#00929d] text-white px-4 py-2 rounded shadow flex items-center gap-2 font-medium transition-colors">
                            <Printer className="h-4 w-4" /> Imprimir
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar print:overflow-visible print:p-0 print:mt-4">
                    {/* Tarjeta de Info del Estudiante */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 border-b border-gray-200 pb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Estudiante :</p>
                            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{student.registro}</h1>
                            <p className="text-gray-700 font-medium uppercase mt-1">{student.nombre}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <h2 className="text-4xl font-bold text-[#3b82f6] tracking-tight">P.P.A.C. {ppac}</h2>
                            <p className="text-gray-600 font-medium uppercase mt-1 text-sm tracking-wide">({student.carrera_id || 'ID'}) {student.carrera_nombre}</p>
                        </div>
                    </div>

                    {/* Formulario rápido para añadir nota */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 shadow-sm print:hidden">
                        <h4 className="font-bold text-blue-800 mb-3 text-sm flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Registrar Materia (Admin)
                        </h4>
                        {message.text && (
                            <div className={`mb-3 px-3 py-2 text-sm rounded flex items-center gap-2 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                <p>{message.text}</p>
                            </div>
                        )}
                        <form onSubmit={handleAddNota} className="flex gap-4 items-end flex-wrap">
                            <div className="w-32">
                                <label className="block text-xs font-semibold text-blue-900 uppercase mb-1">Filtrar Semestre</label>
                                <select value={selectedSemester} onChange={(e) => { setSelectedSemester(e.target.value); setFormData({...formData, materia: ''}); }} className="w-full border border-blue-200 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white">
                                    <option value="">Todos</option>
                                    {semestres.map(sem => (
                                        <option key={sem} value={sem}>Semestre {sem}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-blue-900 uppercase mb-1">Materia</label>
                                <select name="materia" value={formData.materia} onChange={handleChange} required className="w-full border border-blue-200 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm bg-white">
                                    <option value="">Seleccione materia...</option>
                                    {materiasFiltradas.map(m => (
                                        <option key={m.id} value={m.id}>{m.sigla_materia} - {m.nombre_materia}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-28">
                                <label className="block text-xs font-semibold text-blue-900 uppercase mb-1">Periodo</label>
                                <input type="text" name="gestion" value={formData.gestion} onChange={handleChange} required placeholder="Ej: 1-2023" className="w-full border border-blue-200 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm" />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-semibold text-blue-900 uppercase mb-1">Nota</label>
                                <input type="number" name="nota" value={formData.nota} onChange={handleChange} required min="0" max="100" className="w-full border border-blue-200 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm font-bold" />
                            </div>
                            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded text-sm transition-colors shadow mb-0.5">
                                {loading ? '...' : 'Añadir'}
                            </button>
                        </form>
                    </div>

                    {/* Tabla de Historial (Diseño idéntico a la imagen) */}
                    <div className="border border-gray-200 rounded overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 w-24">Nivel</th>
                                    <th className="px-6 py-3">Materia</th>
                                    <th className="px-6 py-3 w-40">Periodo</th>
                                    <th className="px-6 py-3 w-24 text-center">Nota</th>
                                    <th className="px-6 py-3 w-16 text-center print:hidden"></th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800">
                                {historial.length > 0 ? (
                                    historial.map((h, index) => (
                                        <tr key={h.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                            <td className="px-6 py-3">{h.periodo_materia || '1'}</td>
                                            <td className="px-6 py-3 font-medium uppercase">{h.sigla_materia} - {h.nombre_materia}</td>
                                            <td className="px-6 py-3 text-gray-600">{h.gestion}</td>
                                            <td className="px-6 py-3 text-center bg-gray-200/50 font-semibold">{Math.round(h.nota)}</td>
                                            <td className="px-6 py-3 text-center print:hidden">
                                                <button onClick={() => handleDeleteHistorial(h.id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                            No hay materias registradas en el historial.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvanceAcademicoModal;
