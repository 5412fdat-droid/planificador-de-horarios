import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, AlertCircle, Printer, FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';

const VerMallasOperador = () => {
    const [carreras, setCarreras] = useState([]);
    const [selectedCarrera, setSelectedCarrera] = useState('');
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Filtro adicional por Semestre
    const [selectedSemestre, setSelectedSemestre] = useState('');

    // Highlight state para las filas (ver requisitos/dependientes)
    const [highlightMode, setHighlightMode] = useState(null); // 'requisitos' o 'dependientes'
    const [highlightMateria, setHighlightMateria] = useState(null);
    const [activeRowId, setActiveRowId] = useState(null);

    useEffect(() => {
        fetchCarreras();
    }, []);

    useEffect(() => {
        if (selectedCarrera) {
            fetchMaterias();
            setHighlightMode(null);
            setHighlightMateria(null);
            setActiveRowId(null);
            setSelectedSemestre('');
        } else {
            setMaterias([]);
        }
    }, [selectedCarrera]);

    const fetchCarreras = async () => {
        try {
            const res = await api.get('admin/carreras/');
            setCarreras(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMaterias = async () => {
        try {
            setLoading(true);
            const res = await api.get('admin/materias/');
            const filtradas = res.data.filter(m => m.carrera_id == selectedCarrera || m.carrera == selectedCarrera);
            setMaterias(filtradas);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al cargar las materias.' });
        } finally {
            setLoading(false);
        }
    };

    const handleHighlightClick = (materia, mode) => {
        if (highlightMateria?.id === materia.id && highlightMode === mode) {
            setHighlightMode(null);
            setHighlightMateria(null);
        } else {
            setHighlightMode(mode);
            setHighlightMateria(materia);
        }
    };

    const handleExportExcel = () => {
        if (!selectedCarrera) {
            setMessage({ type: 'error', text: 'Selecciona una carrera primero.' });
            return;
        }
        
        const carreraSeleccionada = carreras.find(c => c.id == selectedCarrera);
        const materiasEnMalla = materias.filter(m => m.periodo_materia && m.periodo_materia !== '');
        
        const dataToExport = materiasEnMalla.map(m => ({
            "Semestre": m.periodo_materia,
            "Sigla/Código": m.sigla_materia,
            "Asignatura": m.nombre_materia,
            "Créditos": m.credito_materia || 0,
            "HT": m.ht || 0,
            "HP": m.hp || 0,
            "Categoría": m.tipo_materia || 'Normal',
            "Requisitos": (m.requisitos || []).join('; ') || m.requisito_texto || ''
        }));
        
        exportToCSV(dataToExport, `Malla_${carreraSeleccionada?.sigla_carrera}`);
    };

    const textToSemesterMap = {
        "1er": "1", "primer": "1",
        "2do": "2", "segundo": "2",
        "3er": "3", "tercer": "3",
        "4to": "4", "cuarto": "4",
        "5to": "5", "quinto": "5",
        "6to": "6", "sexto": "6",
        "7mo": "7", "séptimo": "7", "septimo": "7",
        "8vo": "8", "octavo": "8",
        "9no": "9", "noveno": "9",
        "10mo": "10", "décimo": "10", "decimo": "10"
    };

    const isHighlightMatch = (materia) => {
        if (!highlightMateria) return false;
        
        if (highlightMode === 'requisitos') {
            if (highlightMateria.requisitos?.includes(materia.sigla_materia)) return true;
            const reqTexto = (highlightMateria.requisito_texto || '').toLowerCase().replace(/\|\[span:\d+\]\|/gi, '');
            if (reqTexto.includes('todas')) {
                for (const [word, num] of Object.entries(textToSemesterMap)) {
                    if (reqTexto.includes(word) && (materia.periodo_materia == num || materia.periodo_materia == word)) {
                        if (materia.tipo_materia === 'Electiva' || materia.es_electiva) return false;
                        return true;
                    }
                }
            }
        } else if (highlightMode === 'dependientes') {
            if (materia.requisitos?.includes(highlightMateria.sigla_materia)) return true;
            const reqTexto = (materia.requisito_texto || '').toLowerCase().replace(/\|\[span:\d+\]\|/gi, '');
            if (reqTexto.includes('todas')) {
                for (const [word, num] of Object.entries(textToSemesterMap)) {
                    if (reqTexto.includes(word) && (highlightMateria.periodo_materia == num || highlightMateria.periodo_materia == word)) {
                        if (highlightMateria.tipo_materia === 'Electiva' || highlightMateria.es_electiva) return false;
                        return true;
                    }
                }
            }
        }
        return false;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-gray-100 pb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="text-blue-600" />
                        Mallas Curriculares (Solo Lectura)
                    </h2>
                    <p className="text-gray-500 text-sm">Consulta la estructura oficial del plan de estudios.</p>
                </div>
                {selectedCarrera && (
                    <div className="flex flex-wrap gap-2 print-hide mt-4 sm:mt-0">
                        <button onClick={() => window.print()} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                            <Printer className="h-4 w-4" /> Imprimir Malla
                        </button>
                        <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                            <FileSpreadsheet className="h-4 w-4" /> Exportar a Excel
                        </button>
                    </div>
                )}
            </div>

            {message.text && (
                <div className="mb-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            <div className="mb-6 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm print-hide">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Selecciona la Carrera:</label>
                        <select 
                            value={selectedCarrera} 
                            onChange={(e) => setSelectedCarrera(e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                        >
                            <option value="">-- Elija una Carrera --</option>
                            {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre_carrera}</option>)}
                        </select>
                    </div>
                    
                    {selectedCarrera && (
                        <div className="flex-1 w-full animate-in fade-in zoom-in duration-300">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Semestre:</label>
                            <select 
                                value={selectedSemestre} 
                                onChange={(e) => setSelectedSemestre(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                            >
                                <option value="">-- Ver toda la Malla Curricular --</option>
                                {[...new Set(materias.filter(m => m.periodo_materia).map(m => m.periodo_materia.toString()))]
                                    .sort((a,b) => parseInt(a) - parseInt(b))
                                    .map(sem => (
                                        <option key={sem} value={sem}>Semestre {sem}</option>
                                    ))
                                }
                            </select>
                        </div>
                    )}
                </div>
                {selectedCarrera && (
                    <p className="text-xs text-gray-500 mt-4 italic">
                        Tip: Haz clic en una materia para ver qué materias la desbloquean (rojo) o qué materias desbloquea (verde).
                    </p>
                )}
            </div>

            {selectedCarrera && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-x-auto mt-6">
                    {loading ? (
                        <div className="text-center text-gray-500 py-8">Cargando malla...</div>
                    ) : (() => {
                        const carreraSeleccionada = carreras.find(c => c.id == selectedCarrera);
                        const materiasEnMalla = materias.filter(m => m.periodo_materia && m.periodo_materia !== '');
                        
                        if (materiasEnMalla.length === 0) {
                            return (
                                <div className="text-center text-gray-500 font-medium py-8">
                                    No hay materias insertadas en la malla para esta carrera aún.
                                </div>
                            );
                        }

                        const materiasPorPeriodo = {};
                        materiasEnMalla.forEach(m => {
                            const p = parseInt(m.periodo_materia) || m.periodo_materia;
                            if (!materiasPorPeriodo[p]) materiasPorPeriodo[p] = [];
                            materiasPorPeriodo[p].push(m);
                        });

                        const periodos = Object.keys(materiasPorPeriodo).sort((a,b) => parseInt(a) - parseInt(b));
                        
                        const periodosAMostrar = selectedSemestre 
                            ? periodos.filter(p => p === selectedSemestre)
                            : periodos;

                        const numeroALetras = (num) => {
                            const numInt = parseInt(num);
                            if (isNaN(numInt)) return String(num).toUpperCase();
                            const nombres = ["PRIMER", "SEGUNDO", "TERCER", "CUARTO", "QUINTO", "SEXTO", "SÉPTIMO", "OCTAVO", "NOVENO", "DÉCIMO", "UNDÉCIMO", "DUODÉCIMO", "DECIMOTERCER", "DECIMOCUARTA", "DECIMOQUINTO"];
                            return nombres[numInt - 1] || `${numInt}°`;
                        };

                        return (
                            <div>
                                <div className="text-center mb-6">
                                    <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">PLAN DE ESTUDIOS {carreraSeleccionada?.sigla_carrera}</h1>
                                    <h2 className="text-lg font-bold uppercase text-gray-900">{carreraSeleccionada?.nombre_carrera}</h2>
                                    <h3 className="text-md font-bold uppercase italic text-gray-800">FACULTAD INTEGRAL DE LOS VALLES</h3>
                                </div>

                                {periodosAMostrar.map(periodo => {
                                    const normales = materiasPorPeriodo[periodo].filter(m => (!m.tipo_materia || m.tipo_materia === 'Normal') && !m.es_electiva);
                                    const electivas = materiasPorPeriodo[periodo].filter(m => m.tipo_materia === 'Electiva' || m.es_electiva);
                                    const modalidadTecnico = materiasPorPeriodo[periodo].filter(m => m.tipo_materia === 'Modalidad Tecnico');
                                    const modalidadGrado = materiasPorPeriodo[periodo].filter(m => m.tipo_materia === 'Modalidad Grado');

                                    const renderTable = (lista, titulo = null) => {
                                        if (lista.length === 0) return null;
                                        
                                        const rowSpans = new Array(lista.length).fill(0);

                                        let i = 0;
                                        while (i < lista.length) {
                                            let rawText = lista[i].requisito_texto || '';
                                            let spanMatch = rawText.match(/\|\[SPAN:(\d+)\]\|/i);
                                            let span = 1;
                                            
                                            if (spanMatch) {
                                                span = parseInt(spanMatch[1], 10);
                                                if (i + span > lista.length) span = lista.length - i;
                                            } else {
                                                const hasCodes = lista[i].requisitos && lista[i].requisitos.length > 0;
                                                const currentClean = rawText.replace(/\|\[SPAN:\d+\]\|/gi, '').trim();
                                                
                                                if (!hasCodes && currentClean !== '') {
                                                    let autoSpan = 1;
                                                    while (i + autoSpan < lista.length) {
                                                        const nextHasCodes = lista[i+autoSpan].requisitos && lista[i+autoSpan].requisitos.length > 0;
                                                        let nextRawText = lista[i+autoSpan].requisito_texto || '';
                                                        let nextClean = nextRawText.replace(/\|\[SPAN:\d+\]\|/gi, '').trim();
                                                        
                                                        if (!nextHasCodes && nextClean === currentClean) {
                                                            autoSpan++;
                                                        } else {
                                                            break;
                                                        }
                                                    }
                                                    span = autoSpan;
                                                }
                                            }

                                            rowSpans[i] = span;
                                            for (let j = 1; j < span; j++) {
                                                rowSpans[i + j] = 0;
                                            }
                                            i += span;
                                        }

                                        return (
                                            <div className="mb-4">
                                                {titulo && <h4 className="font-bold uppercase text-gray-900 mb-1 ml-12">{titulo}</h4>}
                                                <table className="w-full border-collapse border-2 border-black text-sm relative group">
                                                    <thead>
                                                        {(!titulo || titulo === 'ELECTIVAS:') && (
                                                            <tr>
                                                                <th className="border-2 border-black p-1 w-24 bg-white text-gray-900">CODIGO</th>
                                                                <th className="border-2 border-black p-1 text-left bg-white text-gray-900">ASIGNATURA</th>
                                                                <th className="border-2 border-black p-1 w-12 text-center bg-white text-gray-900">CR</th>
                                                                <th className="border-2 border-black p-1 w-12 text-center bg-white text-gray-900">HT</th>
                                                                <th className="border-2 border-black p-1 w-12 text-center bg-white text-gray-900">HP</th>
                                                                <th className="border-2 border-black p-1 w-48 text-left bg-white text-gray-900">REQUISITOS</th>
                                                            </tr>
                                                        )}
                                                    </thead>
                                                    <tbody>
                                                        {lista.map((m, index) => {
                                                            let rowClass = "bg-white hover:bg-gray-50 transition-colors relative cursor-pointer";
                                                            
                                                            if (highlightMateria) {
                                                                if (highlightMateria.id === m.id) {
                                                                    rowClass = "bg-yellow-300 border-2 border-yellow-600 relative transition-colors cursor-pointer";
                                                                } else if (highlightMode === 'requisitos' && isHighlightMatch(m)) {
                                                                    rowClass = "bg-red-300 border-2 border-red-600 relative transition-colors cursor-pointer";
                                                                } else if (highlightMode === 'dependientes' && isHighlightMatch(m)) {
                                                                    rowClass = "bg-green-300 border-2 border-green-600 relative transition-colors cursor-pointer";
                                                                }
                                                            } else if (activeRowId === m.id) {
                                                                rowClass = "bg-blue-100 border-2 border-blue-400 relative transition-colors cursor-pointer";
                                                            }

                                                            const isMergedCell = rowSpans[index] > 1;
                                                            let displayReqText = (m.requisitos && m.requisitos.length > 0) ? m.requisitos.join('; ') : (m.requisito_texto ? m.requisito_texto.replace(/\|\[SPAN:\d+\]\|/gi, '').trim() : '');

                                                            return (
                                                                <tr key={m.id} className={rowClass} onClick={() => setActiveRowId(activeRowId === m.id ? null : m.id)}>
                                                                    <td className="border-2 border-black p-1 font-semibold text-gray-900 w-24">{m.sigla_materia}</td>
                                                                    <td className="border-2 border-black p-1 font-medium text-gray-900 relative">
                                                                        {m.nombre_materia}
                                                                        
                                                                        {/* Tooltip de navegación rápida de requisitos */}
                                                                        <div className={`absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-white p-1 rounded shadow border border-gray-200 transition-opacity ${activeRowId === m.id ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`} onClick={e => e.stopPropagation()}>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleHighlightClick(m, 'requisitos'); }} className={`px-2 py-1 rounded text-xs font-bold text-white transition-colors ${highlightMateria?.id === m.id && highlightMode === 'requisitos' ? 'bg-red-700' : 'bg-red-500 hover:bg-red-600'}`} title="Ver qué materias se necesitan para cursar esta">
                                                                                Ver Requisitos
                                                                            </button>
                                                                            <button onClick={(e) => { e.stopPropagation(); handleHighlightClick(m, 'dependientes'); }} className={`px-2 py-1 rounded text-xs font-bold text-white transition-colors ${highlightMateria?.id === m.id && highlightMode === 'dependientes' ? 'bg-green-700' : 'bg-green-500 hover:bg-green-600'}`} title="Ver qué materias se desbloquean al aprobar esta">
                                                                                Ver Desbloqueos
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                    <td className="border-2 border-black p-1 text-center font-semibold text-gray-900 w-12">{m.credito_materia}</td>
                                                                    <td className="border-2 border-black p-1 text-center font-semibold text-gray-900 w-12">{m.ht || 0}</td>
                                                                    <td className="border-2 border-black p-1 text-center font-semibold text-gray-900 w-12">{m.hp || 0}</td>
                                                                    
                                                                    {rowSpans[index] > 0 && (
                                                                        <td rowSpan={rowSpans[index]} className={`border-2 border-black p-1 text-xs text-gray-800 font-medium w-48 ${isMergedCell ? 'text-center align-middle bg-white/50 backdrop-blur-sm shadow-inner' : ''}`}>
                                                                            {displayReqText}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })}
                                                        <tr className="bg-white border-none">
                                                            <td colSpan="2" className="p-1 border-none"></td>
                                                            <td className="border-2 border-black p-1 text-center font-black text-gray-900">
                                                                {lista.reduce((acc, m) => acc + parseInt(m.credito_materia||0), 0)}
                                                            </td>
                                                            <td className="border-2 border-black p-1 text-center font-black text-gray-900">
                                                                {lista.reduce((acc, m) => acc + parseInt(m.ht||0), 0)}
                                                            </td>
                                                            <td className="border-2 border-black p-1 text-center font-black text-gray-900">
                                                                {lista.reduce((acc, m) => acc + parseInt(m.hp||0), 0)}
                                                            </td>
                                                            <td className="p-1 border-none"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    };

                                    return (
                                        <div key={periodo} className="mb-8">
                                            <h3 className="text-center font-bold uppercase mb-2 tracking-wide text-gray-900">{numeroALetras(periodo)} SEMESTRE</h3>
                                            {renderTable(normales)}
                                            {renderTable(electivas, 'ELECTIVAS:')}
                                            {renderTable(modalidadTecnico, 'MODALIDAD DE GRADUACIÓN PARA TÉCNICOS AGROPECUARIOS')}
                                            {renderTable(modalidadGrado, 'MODALIDAD DE GRADUACIÓN INGENIERÍA AGROPECUARIA')}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default VerMallasOperador;
