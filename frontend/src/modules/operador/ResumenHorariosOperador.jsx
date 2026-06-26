import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarDays, AlertCircle, Search, Clock, MapPin, UserCircle, Printer } from 'lucide-react';

const getMateriaColor = (materiaId) => {
    if (!materiaId) return '#3b82f6';
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    return colors[(materiaId * 3) % colors.length];
};

const ResumenHorariosOperador = () => {
    const [carreras, setCarreras] = useState([]);
    const [horariosPorSemestre, setHorariosPorSemestre] = useState({});
    const [semestresActivos, setSemestresActivos] = useState([]);
    const [filtroSemestre, setFiltroSemestre] = useState('');
    const [filtroAula, setFiltroAula] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1);

    const [selection, setSelection] = useState({
        carrera_id: '',
        gestion: '1-2026',
        grupo: ''
    });

    useEffect(() => {
        const fetchCarreras = async () => {
            try {
                const res = await api.get('admin/operador/carreras/');
                setCarreras(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCarreras();
    }, []);

    const handleSelectionChange = (e) => {
        setSelection({ ...selection, [e.target.name]: e.target.value });
    };

    const loadResumen = async () => {
        if (!selection.carrera_id || !selection.gestion || !selection.grupo) {
            setMessage('Selecciona Carrera, Gestión y Grupo.');
            return;
        }
        setMessage('');
        setLoading(true);
        setFiltroSemestre('');
        setFiltroAula('');
        try {
            const res = await api.get(`admin/operador/horarios/?carrera_id=${selection.carrera_id}&gestion=${selection.gestion}&grupo=${selection.grupo}`);
            
            if (res.data.length === 0) {
                setMessage('No existen horarios creados para esta carrera en la gestión y grupo seleccionados.');
                setLoading(false);
                return;
            }

            const agrupados = {};
            const isImpar = selection.gestion.startsWith('1');

            res.data.forEach(h => {
                const p = parseInt(h.periodo);
                if (!p) return;
                
                // Asegurar que solo mostramos los semestres que corresponden a la gestión
                if ((isImpar && p % 2 !== 0) || (!isImpar && p % 2 === 0)) {
                    if (!agrupados[p]) agrupados[p] = [];
                    agrupados[p].push(h);
                }
            });

            const semestres = Object.keys(agrupados).map(Number).sort((a,b) => a - b);
            
            if (semestres.length === 0) {
                setMessage('No hay horarios válidos para el tipo de periodo de la gestión.');
                setLoading(false);
                return;
            }

            setHorariosPorSemestre(agrupados);
            setSemestresActivos(semestres);
            setStep(2);
        } catch (error) {
            setMessage('Error al cargar los horarios.');
        } finally {
            setLoading(false);
        }
    };

    const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    const bloquesHora = [
        { id: 1, label: '07:45 - 08:30', inicio: '07:45:00', fin: '08:30:00' },
        { id: 2, label: '08:30 - 09:15', inicio: '08:30:00', fin: '09:15:00' },
        { id: 3, label: '09:15 - 10:00', inicio: '09:15:00', fin: '10:00:00' },
        { id: 4, label: '10:00 - 10:45', inicio: '10:00:00', fin: '10:45:00' },
        { id: 5, label: '10:45 - 11:30', inicio: '10:45:00', fin: '11:30:00' },
        { id: 6, label: '11:30 - 12:15', inicio: '11:30:00', fin: '12:15:00' },
        { id: 7, label: '13:00 - 13:45', inicio: '13:00:00', fin: '13:45:00' },
        { id: 8, label: '13:45 - 14:30', inicio: '13:45:00', fin: '14:30:00' },
        { id: 9, label: '14:30 - 15:15', inicio: '14:30:00', fin: '15:15:00' },
        { id: 10, label: '15:15 - 16:00', inicio: '15:15:00', fin: '16:00:00' },
        { id: 11, label: '16:00 - 16:45', inicio: '16:00:00', fin: '16:45:00' },
        { id: 12, label: '16:45 - 17:30', inicio: '16:45:00', fin: '17:30:00' },
        { id: 13, label: '18:15 - 19:00', inicio: '18:15:00', fin: '19:00:00' },
        { id: 14, label: '19:00 - 19:45', inicio: '19:00:00', fin: '19:45:00' },
        { id: 15, label: '19:45 - 20:30', inicio: '19:45:00', fin: '20:30:00' },
        { id: 16, label: '20:30 - 21:15', inicio: '20:30:00', fin: '21:15:00' },
        { id: 17, label: '21:15 - 22:00', inicio: '21:15:00', fin: '22:00:00' },
        { id: 18, label: '22:00 - 22:45', inicio: '22:00:00', fin: '22:45:00' },
    ];

    const getHorarioForBlock = (day, block, semHorarios) => {
        return semHorarios.find(h => h.dia_semana === day && block.inicio >= h.hora_inicio && block.fin <= h.hora_fin);
    };

    const formatAula = (nombre) => {
        if (!nombre) return 'S/A';
        return String(nombre).match(/^\d+$/) ? `Aula ${nombre}` : nombre;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left w-full h-full print:h-auto flex flex-col overflow-hidden print:border-none print:shadow-none print:p-0">
            {message && (
                <div className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 text-red-700 shrink-0">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{message}</p>
                </div>
            )}

            {step === 1 && (
                <div className="max-w-2xl bg-gray-50 p-8 rounded-xl border border-gray-100 mx-auto mt-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">OFERTA DE MATERIAS Y HORARIOS</h2>
                    <p className="text-gray-500 mb-6">Selecciona los parámetros para visualizar toda la oferta académica del periodo.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                            <select name="carrera_id" value={selection.carrera_id} onChange={handleSelectionChange} className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500">
                                <option value="">-- Selecciona --</option>
                                {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre_carrera}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gestión / Periodo</label>
                            <select name="gestion" value={selection.gestion} onChange={handleSelectionChange} className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500">
                                <option value="1-2026">1-2026</option>
                                <option value="2-2026">2-2026</option>
                                <option value="1-2027">1-2027</option>
                                <option value="2-2027">2-2027</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                            <select name="grupo" value={selection.grupo} onChange={handleSelectionChange} className="w-full border rounded-lg px-4 py-2 bg-white outline-none focus:border-blue-500">
                                <option value="">-- Selecciona --</option>
                                <option value="AV">AV (Mañana)</option>
                                <option value="VA">VA (Tarde/Noche)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button onClick={loadResumen} disabled={loading} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md shadow-blue-200 transition-colors flex justify-center items-center gap-2">
                        {loading ? 'Cargando Horarios...' : 'Generar Vista Global'} <Search className="h-5 w-5" />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in">
                    <div className="flex justify-between items-center mb-4 shrink-0 px-2">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 uppercase flex items-center gap-2 tracking-wide">
                                <CalendarDays className="h-7 w-7 text-blue-600" />
                                OFERTA DE MATERIAS Y HORARIOS
                            </h2>
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                Carrera: <span className="text-blue-600">{carreras.find(c => c.id == selection.carrera_id)?.nombre_carrera}</span> | 
                                Gestión: <span className="text-blue-600">{selection.gestion}</span> | 
                                Grupo: <span className="text-blue-600">{selection.grupo}</span>
                            </p>
                        </div>
                        
                        {/* Filtros y botón volver */}
                        <div className="flex flex-wrap items-center gap-3 print-hide">
                            <select value={filtroSemestre} onChange={e => setFiltroSemestre(e.target.value)} className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-medium bg-white outline-none focus:border-blue-500 text-gray-700 shadow-sm">
                                <option value="">Todos los Semestres</option>
                                {semestresActivos.map(s => <option key={s} value={s}>{s}° Semestre</option>)}
                            </select>
                            
                            <select value={filtroAula} onChange={(e) => setFiltroAula(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-auto">
                                <option value="">Todas las Aulas</option>
                                {Array.from(new Set(Object.values(horariosPorSemestre).flat().map(h => h.aula_nombre))).filter(Boolean).sort().map(a => (
                                    <option key={a} value={a}>{formatAula(a)}</option>
                                ))}
                            </select>

                            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors border border-blue-700 shadow-sm flex items-center gap-2">
                                <Printer className="h-4 w-4" /> Imprimir
                            </button>

                            <button onClick={() => setStep(1)} className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors border-2 border-gray-200 shadow-sm">
                                Volver
                            </button>
                        </div>
                    </div>
                    
                    {/* Contenedor escroleable verticalmente con todos los semestres */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-12 pr-2 pb-8">
                        {semestresActivos.map(semestre => {
                            if (filtroSemestre && semestre.toString() !== filtroSemestre) return null;

                            let semHorarios = horariosPorSemestre[semestre];
                            
                            if (filtroAula) {
                                semHorarios = semHorarios.filter(h => h.aula_nombre === filtroAula);
                            }
                            
                            if (semHorarios.length === 0) return null;
                            
                            // Extraer Aulas y agrupar materias para la Leyenda
                            const aulasSet = new Set();
                            const uniqueHorarios = [];
                            const map = new Map();
                            
                            semHorarios.forEach(item => {
                                if (item.aula_nombre) aulasSet.add(item.aula_nombre);
                                if (!map.has(item.grupo_materia)) {
                                    map.set(item.grupo_materia, true);
                                    uniqueHorarios.push({
                                        docente: item.docente_nombre,
                                        sigla: item.materia_sigla,
                                        materia: item.materia_nombre,
                                        materia_id: item.materia_id,
                                        aula: item.aula_nombre,
                                        color_hex: item.color_hex || getMateriaColor(item.materia_id)
                                    });
                                }
                            });

                            const tituloAulas = Array.from(aulasSet).join(' / ') || 'POR ASIGNAR';

                            // Determinar qué bloques de horas renderizar para este semestre (para no dibujar filas inútiles)
                            let minBloque = bloquesHora.length;
                            let maxBloque = 0;
                            semHorarios.forEach(h => {
                                const s = bloquesHora.findIndex(b => b.inicio === h.hora_inicio);
                                const e = bloquesHora.findIndex(b => b.fin === h.hora_fin);
                                if (s !== -1 && s < minBloque) minBloque = s;
                                if (e !== -1 && e > maxBloque) maxBloque = e;
                            });
                            
                            // Si no hay clases (improbable), mostramos un rango por defecto
                            if (minBloque > maxBloque) {
                                minBloque = 0;
                                maxBloque = 5;
                            }
                            
                            // Añadimos margen de 1 bloque arriba y abajo para que se vea bien
                            minBloque = Math.max(0, minBloque - 1);
                            maxBloque = Math.min(bloquesHora.length - 1, maxBloque + 1);
                            
                            const bloquesAMostrar = bloquesHora.slice(minBloque, maxBloque + 1);

                            return (
                                <div key={semestre} className="flex flex-col gap-2 relative">
                                    <h3 className="text-lg font-black text-black uppercase tracking-tight w-fit">
                                        {semestre}° SEMESTRE
                                    </h3>
                                    <h4 className="font-bold text-gray-800 text-sm uppercase">AULA: {tituloAulas}</h4>

                                    <div className="flex flex-col xl:flex-row gap-6 items-start mt-2">
                                        
                                        {/* GRILLA */}
                                        <div className="bg-white overflow-hidden max-w-[800px]">
                                            <table className="border-collapse text-[11px] font-sans text-gray-800">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-gray-800 bg-white p-2 text-center font-bold w-28 uppercase">HORARIO</th>
                                                        {dias.map(d => (
                                                            <th key={d} className="border border-gray-800 bg-white p-2 text-center font-bold uppercase w-28">
                                                                {d === 'Miercoles' ? 'Miércoles' : (d === 'Sabado' ? 'Sábado' : d)}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bloquesAMostrar.map((bloque, idx) => (
                                                        <tr key={bloque.id}>
                                                            <td className="border border-gray-800 p-1 text-center font-medium bg-white">
                                                                {bloque.label.replace(' - ', ' a ')}
                                                            </td>
                                                            {dias.map(dia => {
                                                                const h = getHorarioForBlock(dia, bloque, semHorarios);
                                                                if (h) {
                                                                    if (h.hora_inicio === bloque.inicio) {
                                                                        const numBlocks = bloquesHora.filter(b => b.inicio >= h.hora_inicio && b.fin <= h.hora_fin).length;
                                                                        return (
                                                                        <td key={`${dia}-${bloque.id}`} rowSpan={numBlocks} className="border border-gray-800 p-0 align-middle relative text-center" style={{ backgroundColor: h.color_hex || getMateriaColor(h.materia_id), WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                                                <div className="flex flex-col items-center justify-center h-full w-full font-bold text-white tracking-wide z-10 relative px-1 py-1 drop-shadow-md">
                                                                                    <span className="text-xs uppercase">{h.materia_sigla}</span>
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    }
                                                                    return null;
                                                                } else {
                                                                    return (
                                                                        <td key={`${dia}-${bloque.id}`} className="border border-gray-800 p-0 h-[24px]"></td>
                                                                    );
                                                                }
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* LEYENDA */}
                                        <div className="w-full xl:w-[600px] mt-6 xl:mt-0 overflow-x-auto">
                                            <table className="w-full border-collapse border-2 border-gray-800 text-center text-xs font-sans">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-gray-800 p-1.5 bg-white font-bold w-[35%] uppercase">DOCENTE</th>
                                                        <th className="border border-gray-800 p-1.5 bg-white font-bold w-[15%] uppercase">SIGLA</th>
                                                        <th className="border border-gray-800 p-1.5 bg-white font-bold w-[35%] uppercase">MATERIA</th>
                                                        <th className="border border-gray-800 p-1.5 bg-white font-bold w-[15%] uppercase">AULA</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {uniqueHorarios.map((h, i) => (
                                                        <tr key={i} style={{ backgroundColor: h.color_hex, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                            <td className="border border-gray-800 p-1.5 font-bold text-white drop-shadow-md whitespace-nowrap">{h.docente}</td>
                                                            <td className="border border-gray-800 p-1.5 font-bold text-white drop-shadow-md whitespace-nowrap">{h.sigla}</td>
                                                            <td className="border border-gray-800 p-1.5 font-bold text-white drop-shadow-md whitespace-nowrap">{h.materia}</td>
                                                            <td className="border border-gray-800 p-1.5 font-bold text-white drop-shadow-md whitespace-nowrap">{h.aula || 'S/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    {/* Un separador sutil al final de cada bloque, excepto el último si queremos */}
                                    <div className="w-full h-px bg-gray-200 my-4" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumenHorariosOperador;
