import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CalendarDays, AlertCircle, CheckCircle2, ChevronRight, X, Plus, Pencil } from 'lucide-react';

const PREDEFINED_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#9ca3af', '#57534e', '#0f172a',
    '#fca5a5', '#fdba74', '#fcd34d', '#fde047', '#bef264',
    '#86efac', '#6ee7b7', '#5eead4', '#67e8f9', '#7dd3fc'
];

// Generar bloques de 45 mins desde las 07:45 hasta las 22:45
const generateTimeBlocks = () => {
    const blocks = [];
    let startHour = 7;
    let startMin = 45;
    for(let i=1; i<=20; i++) {
        let endHour = startHour;
        let endMin = startMin + 45;
        if (endMin >= 60) {
            endHour += 1;
            endMin -= 60;
        }
        
        const format = (n) => n.toString().padStart(2, '0');
        const startStr = `${format(startHour)}:${format(startMin)}`;
        const endStr = `${format(endHour)}:${format(endMin)}`;
        
        blocks.push({
            id: i,
            label: `${startStr} a ${endStr}`,
            inicio: `${startStr}:00`,
            fin: `${endStr}:00`
        });
        
        startHour = endHour;
        startMin = endMin;
    }
    return blocks;
};

const timeBlocks = generateTimeBlocks();
const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

// Función determinística para asignar un color a una materia (solo de respaldo)
const getMateriaColor = (materiaId) => {
    if (!materiaId) return '#3b82f6';
    const colors = [
        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
        '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
    ];
    return colors[(materiaId * 3) % colors.length];
};

const GestorHorariosOperador = () => {
    const [carreras, setCarreras] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [gruposExistentes, setGruposExistentes] = useState([]);
    const [isCustomGrupo, setIsCustomGrupo] = useState(false);
    const [horarios, setHorarios] = useState([]);
    const [periodosDisponibles, setPeriodosDisponibles] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDocenteLocked, setIsDocenteLocked] = useState(false);

    const [selection, setSelection] = useState({
        carrera_id: '',
        gestion: '1-2026',
        periodo: '',
        grupo: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editHorarioId, setEditHorarioId] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null); // { day, block }
    const [formData, setFormData] = useState({
        materia_id: '',
        docente_id: '',
        aula_id: '',
        cupo_limite: 40,
        duracion_bloques: 1,
        color: '#3b82f6'
    });

    const fetchInitialData = async () => {
        try {
            const [carrerasRes, aulasRes, docentesRes, gruposRes] = await Promise.all([
                api.get('admin/operador/carreras/'),
                api.get('admin/aulas/'),
                api.get('admin/docentes/'),
                api.get('admin/operador/grupos/')
            ]);
            setCarreras(carrerasRes.data);
            setAulas(aulasRes.data);
            setDocentes(docentesRes.data);
            setGruposExistentes(gruposRes.data);
        } catch (error) {
            console.error("Error cargando datos iniciales:", error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleSelectionChange = (e) => {
        const { name, value } = e.target;
        setSelection(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'tipo_periodo' || name === 'carrera_id') next.periodo = '';
            return next;
        });
    };

    // Auto-fetch periodos disponibles cuando cambia la carrera
    useEffect(() => {
        if (selection.carrera_id) {
            api.get(`admin/operador/materias/autocomplete/?carrera_id=${selection.carrera_id}`)
                .then(res => {
                    const periods = new Set();
                    res.data.forEach(m => {
                        if (m.periodo_materia) periods.add(parseInt(m.periodo_materia));
                    });
                    const sortedPeriods = Array.from(periods).filter(p => !isNaN(p)).sort((a, b) => a - b).map(String);
                    setPeriodosDisponibles(sortedPeriods);
                })
                .catch(err => console.error(err));
        } else {
            setPeriodosDisponibles([]);
            setSelection(prev => ({ ...prev, periodo: '' }));
        }
    }, [selection.carrera_id]);

    // Auto-bloquear Docente si la Materia ya tiene un docente asignado en este semestre
    useEffect(() => {
        if (formData.materia_id && horarios.length > 0) {
            const existing = horarios.find(h => 
                h.carrera_id == selection.carrera_id && 
                h.periodo == selection.periodo && 
                h.materia_id == formData.materia_id
            );
            if (existing && existing.docente_id) {
                setFormData(prev => ({ ...prev, docente_id: existing.docente_id }));
                setIsDocenteLocked(true);
            } else {
                setIsDocenteLocked(false);
            }
        } else {
            setIsDocenteLocked(false);
        }
    }, [formData.materia_id, horarios, selection.carrera_id, selection.periodo]);

    const loadGrid = async () => {
        if (!selection.carrera_id || !selection.periodo || !selection.gestion || !selection.grupo) {
            return;
        }
        
        setLoading(true);
        try {
            await fetchInitialData();
            const matRes = await api.get(`admin/operador/materias/autocomplete/?carrera_id=${selection.carrera_id}`);
            const materiasSemestre = matRes.data.filter(m => m.periodo_materia === selection.periodo);
            setMaterias(materiasSemestre);
            await fetchHorarios();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cargar los datos del horario.' });
        } finally {
            setLoading(false);
        }
    };

    // Auto-cargar la grilla cuando todos los filtros estén seleccionados
    useEffect(() => {
        if (selection.carrera_id && selection.gestion && selection.periodo && selection.grupo) {
            loadGrid();
        } else {
            setHorarios([]);
        }
    }, [selection.carrera_id, selection.gestion, selection.periodo, selection.grupo]);

    const fetchHorarios = async () => {
        try {
            const res = await api.get(`admin/operador/horarios/?carrera_id=${selection.carrera_id}&periodo=${selection.periodo}&gestion=${selection.gestion}&grupo=${selection.grupo}`);
            setHorarios(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const openCellModal = (day, block) => {
        setEditHorarioId(null);
        setSelectedCell({ day, block });
        setFormData({
            materia_id: '',
            docente_id: '',
            aula_id: '',
            cupo_limite: 40,
            duracion_bloques: 1,
            color: '#3b82f6'
        });
        setIsModalOpen(true);
    };

    const openEditModal = (horario, block) => {
        setEditHorarioId(horario.id);
        setSelectedCell({ day: horario.dia_semana, block });
        
        const startIdx = timeBlocks.findIndex(b => b.inicio === horario.hora_inicio);
        const endIdx = timeBlocks.findIndex(b => b.fin === horario.hora_fin);
        const numBlocks = (startIdx !== -1 && endIdx !== -1) ? (endIdx - startIdx + 1) : 1;

        setFormData({
            materia_id: horario.materia_id,
            docente_id: horario.docente_id,
            aula_id: horario.aula_id,
            cupo_limite: horario.cupo_limite || 40,
            duracion_bloques: numBlocks,
            color: getMateriaColor(horario.materia_id)
        });
        setIsModalOpen(true);
    };

    const handleDragStart = (e, horario, action = 'move') => {
        if (action === 'resize') {
            e.stopPropagation();
        }
        e.dataTransfer.setData('horarioId', horario.id);
        e.dataTransfer.setData('action', action);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, day, targetBlock) => {
        e.preventDefault();
        const horarioId = e.dataTransfer.getData('horarioId');
        const action = e.dataTransfer.getData('action');
        if (!horarioId) return;

        const horario = horarios.find(h => h.id == horarioId);
        if (!horario) return;

        if (action === 'resize') {
            if (horario.dia_semana !== day) {
                alert('Solo puedes estirar en el mismo día.');
                return;
            }
            if (targetBlock.fin <= horario.hora_fin) {
                alert('Solo puedes estirar hacia abajo para hacer el horario más largo.');
                return;
            }
            
            setLoading(true);
            try {
                await api.patch(`admin/operador/horarios/${horarioId}/`, {
                    hora_fin: targetBlock.fin
                });
                await fetchHorarios();
            } catch (error) {
                alert(error.response?.data?.error || 'Error al estirar el horario.');
            } finally {
                setLoading(false);
            }
            return;
        }

        const startIdx = timeBlocks.findIndex(b => b.inicio === horario.hora_inicio);
        const endIdx = timeBlocks.findIndex(b => b.fin === horario.hora_fin);
        const numBlocks = (endIdx - startIdx) + 1;

        const targetIdx = timeBlocks.findIndex(b => b.inicio === targetBlock.inicio);
        if (targetIdx + numBlocks > timeBlocks.length) {
            alert('El bloque no entra en el horario restante del día.');
            return;
        }

        const newEndBlock = timeBlocks[targetIdx + numBlocks - 1];

        setLoading(true);
        try {
            await api.patch(`admin/operador/horarios/${horarioId}/`, {
                dia_semana: day,
                hora_inicio: targetBlock.inicio,
                hora_fin: newEndBlock.fin
            });
            await fetchHorarios();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al mover el horario.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            if (name === 'materia_id' && value) {
                next.color = getMateriaColor(value);
            }
            return next;
        });
    };

    const saveHorario = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const blockIndex = timeBlocks.findIndex(b => b.id === selectedCell.block.id);
        const endIndex = blockIndex + parseInt(formData.duracion_bloques) - 1;
        
        if (endIndex >= timeBlocks.length) {
            setMessage({ type: 'error', text: 'La duración excede el horario límite (22:45).' });
            setLoading(false);
            return;
        }

        const payload = {
            carrera_id: selection.carrera_id,
            materia_id: formData.materia_id,
            docente_id: formData.docente_id,
            nombre_grupo: selection.grupo,
            aula_id: formData.aula_id,
            gestion: selection.gestion,
            cupo_limite: formData.cupo_limite,
            dia_semana: selectedCell.day,
            hora_inicio: selectedCell.block.inicio,
            hora_fin: timeBlocks[endIndex].fin
        };

        try {
            if (editHorarioId) {
                await api.patch(`admin/operador/horarios/${editHorarioId}/`, payload);
                setMessage({ type: 'success', text: 'Horario actualizado exitosamente.' });
            } else {
                await api.post('admin/operador/horarios/', payload);
                setMessage({ type: 'success', text: 'Horario creado exitosamente.' });
            }
            
            
            await fetchHorarios();
            setTimeout(() => setIsModalOpen(false), 1000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al guardar.' });
        } finally {
            setLoading(false);
        }
    };

    const deleteHorario = async (id) => {
        if (!window.confirm('¿Eliminar este horario?')) return;
        try {
            await api.delete(`admin/operador/horarios/${id}/`);
            await fetchHorarios();
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al eliminar.' });
        }
    };

    const isBlockOccupied = (day, block) => {
        return horarios.find(h => h.dia_semana === day && block.inicio >= h.hora_inicio && block.fin <= h.hora_fin);
    };

    const formatAula = (nombre) => {
        if (!nombre) return 'S/A';
        return String(nombre).match(/^\d+$/) ? `Aula ${nombre}` : nombre;
    };

    const uniqueHorarios = [];
    const map = new Map();
    for (const item of horarios) {
        if (item.carrera_id == selection.carrera_id && item.periodo == selection.periodo) {
            if (!map.has(item.grupo_materia)) {
                map.set(item.grupo_materia, true);
                uniqueHorarios.push({
                    docente: item.docente_nombre,
                    codigo: item.docente_codigo,
                    sigla: item.materia_sigla,
                    materia: item.materia_nombre,
                    materia_id: item.materia_id,
                    grupo_materia_id: item.grupo_materia,
                    color_hex: item.color_hex || getMateriaColor(item.materia_id)
                });
            }
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left w-full h-full flex flex-col overflow-auto">
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 shrink-0">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Carrera</label>
                        <select name="carrera_id" value={selection.carrera_id} onChange={handleSelectionChange} className="w-full border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-blue-500 text-sm">
                            <option value="">-- Selecciona --</option>
                            {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre_carrera}</option>)}
                        </select>
                    </div>
                    <div className="w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gestión</label>
                        <select name="gestion" value={selection.gestion} onChange={handleSelectionChange} className="w-full border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-blue-500 text-sm">
                            <option value="1-2026">1-2026</option>
                            <option value="2-2026">2-2026</option>
                            <option value="1-2027">1-2027</option>
                        </select>
                    </div>
                    <div className="w-[120px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Semestre</label>
                        <select name="periodo" value={selection.periodo} onChange={handleSelectionChange} disabled={!selection.carrera_id} className="w-full border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed">
                            <option value="">-- Nivel --</option>
                            {periodosDisponibles.map(p => <option key={p} value={p}>{p}°</option>)}
                        </select>
                    </div>
                    <div className="w-[150px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Grupo</label>
                        {!isCustomGrupo ? (
                            <select 
                                name="grupo" 
                                value={selection.grupo} 
                                onChange={(e) => {
                                    if (e.target.value === 'OTRO') {
                                        setIsCustomGrupo(true);
                                        setSelection(prev => ({...prev, grupo: ''}));
                                    } else {
                                        handleSelectionChange(e);
                                    }
                                }} 
                                className="w-full border rounded-lg px-3 py-1.5 bg-white outline-none focus:border-blue-500 text-sm"
                            >
                                <option value="">-- Grupo --</option>
                                <option value="AV">AV</option>
                                <option value="VA">VA</option>
                                {gruposExistentes.filter(g => g !== 'AV' && g !== 'VA').map((g, i) => (
                                    <option key={`ge-${i}`} value={g}>{g}</option>
                                ))}
                                <option value="OTRO" className="font-bold text-blue-600">+ Nuevo...</option>
                            </select>
                        ) : (
                            <div className="flex gap-1">
                                <input 
                                    type="text" 
                                    name="grupo" 
                                    value={selection.grupo} 
                                    onChange={handleSelectionChange} 
                                    placeholder="..." 
                                    className="w-full border rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-500 uppercase text-sm" 
                                    autoFocus
                                />
                                <button 
                                    type="button" 
                                    onClick={() => { setIsCustomGrupo(false); setSelection(prev => ({...prev, grupo: ''})); }}
                                    className="px-2 py-1.5 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 text-xs"
                                    title="Cancelar"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 overflow-auto bg-gray-50/50 p-2 rounded-xl border border-gray-200">
                {selection.carrera_id && selection.gestion && selection.periodo && selection.grupo ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 uppercase underline underline-offset-4 decoration-2">
                                    OFERTA DE MATERIAS Y HORARIOS
                                </h2>
                                <div className="flex items-center gap-4 mt-2">
                                    <div>
                                        <span className="block text-xs text-gray-400">Semestre y Grupo</span>
                                        <span className="font-bold text-lg text-blue-900">{selection.periodo}° Semestre - Grupo {selection.grupo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex xl:flex-row flex-col gap-6 items-start">
                            {/* Tabla de Excel Principal */}
                            <div className="overflow-auto border-2 border-gray-900 bg-white flex-1">
                                <table className="border-collapse text-center table-fixed min-w-[700px] w-full">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-800 p-2 w-[120px] bg-white font-bold text-sm">HORARIO</th>
                                            {days.map(d => (
                                                <th key={d} className="border border-gray-800 p-2 w-[120px] bg-white font-bold text-sm uppercase">{d}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeBlocks.map((block) => (
                                            <tr key={block.id}>
                                                <td className="border border-gray-800 p-1 text-sm bg-white font-medium">{block.label.replace(' a ', ' a ')}</td>
                                                {days.map(day => {
                                                    const horario = isBlockOccupied(day, block);
                                                    if (horario) {
                                                        // Si es el primer bloque del horario ocupado, renderizamos el contenido
                                                        if (horario.hora_inicio === block.inicio) {
                                                            const numBlocks = timeBlocks.filter(b => b.inicio >= horario.hora_inicio && b.fin <= horario.hora_fin).length;
                                                            
                                                            const isCurrent = horario.carrera_id == selection.carrera_id && horario.periodo == selection.periodo;
                                                            const bgColor = isCurrent ? (horario.color_hex || getMateriaColor(horario.materia_id)) : '#9ca3af'; // Gris si es de otro semestre
                                                            
                                                            return (
                                                                <td key={`${day}-${block.id}`} rowSpan={numBlocks} className={`border border-gray-800 p-0 align-middle relative transition-all ${isCurrent ? 'group' : ''}`} style={{ backgroundColor: bgColor }}>
                                                                    {isCurrent ? (
                                                                        <div 
                                                                            draggable
                                                                            onDragStart={(e) => handleDragStart(e, horario, 'move')}
                                                                            className="w-full h-full relative cursor-move group/drag"
                                                                        >
                                                                            <div className="flex flex-col items-center justify-center h-full w-full font-bold text-white tracking-wide z-10 relative px-1 drop-shadow-md">
                                                                                <span>{horario.materia_sigla}</span>
                                                                                <span className="font-bold text-[10px] bg-black/20 px-1.5 py-0.5 rounded mt-1">{formatAula(horario.aula_nombre)}</span>
                                                                            </div>
                                                                            
                                                                            {/* Dropdown flotante (Leyenda detallada al hacer hover en cada celda) */}
                                                                            <div className="absolute top-0 left-full ml-1 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 text-left text-gray-800">
                                                                                <p className="font-bold text-sm text-blue-800 border-b pb-1 mb-2">{horario.materia_nombre}</p>
                                                                                <div className="space-y-1 text-xs">
                                                                                    <p><span className="font-bold">Docente:</span> {horario.docente_nombre}</p>
                                                                                    <p><span className="font-bold">Aula:</span> {formatAula(horario.aula_nombre)}</p>
                                                                                    <p><span className="font-bold">Cupo:</span> {horario.cupo_limite} Est.</p>
                                                                                    <p><span className="font-bold">Horario:</span> {block.label.split(' a ')[0]} - {timeBlocks.find(b => b.fin === horario.hora_fin)?.label.split(' a ')[1]}</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 z-20 transition-opacity">
                                                                                <button 
                                                                                    onClick={() => openEditModal(horario, block)}
                                                                                    className="text-white bg-blue-600/80 hover:bg-blue-800 rounded p-1 shadow-sm"
                                                                                    title="Editar Horario"
                                                                                >
                                                                                    <Pencil className="h-3 w-3" />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => deleteHorario(horario.id)}
                                                                                    className="text-white bg-red-600/80 hover:bg-red-800 rounded p-1 shadow-sm"
                                                                                    title="Eliminar Horario"
                                                                                >
                                                                                    <X className="h-3 w-3" />
                                                                                </button>
                                                                            </div>

                                                                            {/* Resize Handle */}
                                                                            <div 
                                                                                draggable
                                                                                onDragStart={(e) => handleDragStart(e, horario, 'resize')}
                                                                                className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-black/20 z-30 flex items-center justify-center opacity-0 group-hover/drag:opacity-100 transition-opacity"
                                                                                title="Arrastrar hacia abajo para estirar"
                                                                            >
                                                                                <div className="w-8 h-1 bg-white/60 rounded-full"></div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center h-full w-full font-bold text-white z-10 relative px-1 opacity-80" title={`Ocupado por: ${horario.materia_sigla} (Otro Semestre)`}>
                                                                            <span className="text-[10px] uppercase">Ocupado</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        }
                                                        // Si no es el inicio, pero esta ocupado, no renderizamos celda (se lo traga el rowSpan)
                                                        return null;
                                                    } else {
                                                        // Celda vacía
                                                        return (
                                                            <td 
                                                                key={`${day}-${block.id}`} 
                                                                className="border border-gray-800 p-0 relative group h-[30px] hover:bg-gray-50 transition-colors"
                                                                onDragOver={handleDragOver}
                                                                onDrop={(e) => handleDrop(e, day, block)}
                                                            >
                                                                <button 
                                                                    onClick={() => openCellModal(day, block)}
                                                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                                    title="Asignar Materia"
                                                                >
                                                                    <Plus className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                                                                </button>
                                                            </td>
                                                        );
                                                    }
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        {/* Leyenda de Docentes y Colores */}
                        <div className="w-full xl:w-[500px]">
                            {uniqueHorarios.length > 0 ? (
                                <table className="w-full border-collapse border-2 border-gray-900 text-center shadow-sm">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-800 p-2 bg-white font-bold text-sm w-[15%]">CÓDIGO</th>
                                            <th className="border border-gray-800 p-2 bg-white font-bold text-sm w-[35%]">DOCENTE</th>
                                            <th className="border border-gray-800 p-2 bg-white font-bold text-sm w-[15%]">SIGLA</th>
                                            <th className="border border-gray-800 p-2 bg-white font-bold text-sm w-[35%]">MATERIA</th>
                                            <th className="border border-gray-800 p-2 bg-white font-bold text-sm w-[15%]">ACCIÓN</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {uniqueHorarios.map((h, i) => (
                                            <tr key={i} style={{ backgroundColor: h.color_hex }}>
                                                <td className="border border-gray-800 p-2 font-bold text-white drop-shadow-md text-sm">{h.codigo}</td>
                                                <td className="border border-gray-800 p-2 font-bold text-white drop-shadow-md text-sm">{h.docente}</td>
                                                <td className="border border-gray-800 p-2 font-bold text-white drop-shadow-md text-sm">{h.sigla}</td>
                                                <td className="border border-gray-800 p-2 font-bold text-white drop-shadow-md text-sm">{h.materia}</td>
                                                <td className="border border-gray-800 p-2">
                                                    <button 
                                                        onClick={async () => {
                                                            const targetGrupo = selection.grupo === 'AV' ? 'VA' : 'AV';
                                                            if(window.confirm(`¿Mover esta materia al grupo ${targetGrupo}?`)) {
                                                                setLoading(true);
                                                                try {
                                                                    await api.patch(`admin/operador/grupo-materia/${h.grupo_materia_id}/`, { nombre_grupo: targetGrupo });
                                                                    await fetchHorarios();
                                                                } catch (err) {
                                                                    alert('Error al mover el grupo');
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }
                                                        }}
                                                        className="bg-white/20 hover:bg-white/40 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                                                        title={`Mover al grupo ${selection.grupo === 'AV' ? 'VA' : 'AV'}`}
                                                    >
                                                        Mover a {selection.grupo === 'AV' ? 'VA' : 'AV'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
                                    Aún no hay materias asignadas en este semestre para mostrar la leyenda.
                                </div>
                            )}
                        </div>
                    </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 mt-20">
                        <CalendarDays className="h-16 w-16 opacity-50" />
                        <p className="text-lg">Selecciona todos los filtros arriba para cargar la grilla automáticamente.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                        <div className="bg-gray-100 px-5 py-3 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
                            <h3 className="font-bold text-gray-800">Asignar Horario</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800"><X className="h-5 w-5" /></button>
                        </div>
                        {message.text && message.type === 'error' && (
                            <div className="px-5 pt-4">
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 border border-red-200">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p className="font-medium">{message.text}</p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={saveHorario} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Materia</label>
                                <select name="materia_id" value={formData.materia_id} onChange={handleFormChange} required className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm">
                                    <option value="">-- Materia --</option>
                                    {materias.map(m => <option key={m.id} value={m.id}>{m.sigla_materia} - {m.nombre_materia}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Docente {isDocenteLocked && <span className="text-xs text-blue-600 font-bold ml-2">(Fijado)</span>}</label>
                                <select name="docente_id" value={formData.docente_id} onChange={handleFormChange} disabled={isDocenteLocked} required className={`w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm ${isDocenteLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
                                    <option value="">-- Docente --</option>
                                    {docentes.map(d => <option key={d.id} value={d.id}>[{d.codigo_docente}] - {d.nombre_docente}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Aula</label>
                                <select name="aula_id" value={formData.aula_id} onChange={handleFormChange} required className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm">
                                    <option value="">-- Selecciona el Aula --</option>
                                    {aulas.map(a => <option key={a.id} value={a.id}>{formatAula(a.nombre_aula)}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Duración</label>
                                    <select name="duracion_bloques" value={formData.duracion_bloques} onChange={handleFormChange} required className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none bg-white text-sm">
                                        <option value="1">1 Bloque (45 min)</option>
                                        <option value="2">2 Bloques (90 min)</option>
                                        <option value="3">3 Bloques (135 min)</option>
                                        <option value="4">4 Bloques (180 min)</option>
                                        <option value="5">5 Bloques (225 min)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Cupo</label>
                                    <input type="number" name="cupo_limite" value={formData.cupo_limite} onChange={handleFormChange} required min="1" className="w-full border border-gray-300 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Color de la Materia</label>
                                    <div className="grid grid-cols-10 gap-1.5 p-2 border border-gray-200 rounded-lg bg-gray-50">
                                        {PREDEFINED_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === color ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent shadow-sm'}`}
                                                style={{ backgroundColor: color }}
                                                title="Seleccionar color"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition-colors disabled:opacity-50">
                                    {loading ? 'Guardando...' : 'Fijar Horario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestorHorariosOperador;
