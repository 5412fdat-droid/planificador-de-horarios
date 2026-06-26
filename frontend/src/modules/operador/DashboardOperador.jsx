import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CalendarDays, BookOpen, Clock, Presentation } from 'lucide-react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const DashboardOperador = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ horarios: 0, materias: 0, aulas: 0 });
    const [horariosPorDia, setHorariosPorDia] = useState([]);
    const [horariosPorAula, setHorariosPorAula] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Obtenemos todos los horarios creados
                const res = await api.get('admin/operador/horarios/');
                const data = res.data;
                
                // Contar métricas únicas
                const uniqueMaterias = new Set(data.map(h => h.materia_id));
                const uniqueAulas = new Set(data.map(h => h.aula_nombre));
                
                setStats({
                    horarios: data.length,
                    materias: uniqueMaterias.size,
                    aulas: uniqueAulas.size
                });

                // Agrupar por día
                const diasMap = { 'Lunes': 0, 'Martes': 0, 'Miercoles': 0, 'Jueves': 0, 'Viernes': 0, 'Sabado': 0 };
                data.forEach(h => {
                    if (diasMap[h.dia_semana] !== undefined) {
                        diasMap[h.dia_semana]++;
                    }
                });
                const chartDataDias = Object.keys(diasMap).map(dia => ({ name: dia, Clases: diasMap[dia] }));
                setHorariosPorDia(chartDataDias);

                // Agrupar por Aula
                const formatAula = (nombre) => String(nombre).match(/^\d+$/) ? `Aula ${nombre}` : nombre;
                const aulasMap = {};
                data.forEach(h => {
                    const aula = formatAula(h.aula_nombre) || 'Sin Aula';
                    aulasMap[aula] = (aulasMap[aula] || 0) + 1;
                });
                const chartDataAulas = Object.keys(aulasMap).map(a => ({ name: a, value: aulasMap[a] })).sort((a,b) => b.value - a.value).slice(0, 7); // Top 7 aulas
                setHorariosPorAula(chartDataAulas);

            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="w-full animate-in fade-in duration-500 text-left">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">Resumen Operativo</h1>
                <p className="text-gray-500">Métricas de planificación general, <span className="font-semibold text-blue-600">{user?.nombre}</span>.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <CalendarDays className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Clases Programadas</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.horarios}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Materias Asignadas</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.materias}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                        <Presentation className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Aulas en Uso</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.aulas}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Gráfico 1 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <CalendarDays className="text-blue-500" /> Distribución por Día
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={horariosPorDia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="Clases" radius={[4, 4, 0, 0]}>
                                    {horariosPorDia.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico 2 */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Presentation className="text-orange-500" /> Top Aulas Más Usadas
                    </h2>
                    <div className="h-64 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={horariosPorAula}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {horariosPorAula.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`${value} Bloques`, 'Uso']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardOperador;
