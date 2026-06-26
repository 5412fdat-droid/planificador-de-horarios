import React, { useState, useEffect } from 'react';
import { Users, Building2, BookOpen, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center transition-all hover:shadow-md animate-in fade-in zoom-in duration-300">
        <div className={`p-4 rounded-lg mr-5 ${colorClass}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

const DashboardAdmin = () => {
    const [stats, setStats] = useState({
        totales: { estudiantes: 0, docentes: 0, aulas: 0, carreras: 0, materias: 0, usuarios: 0 },
        graficos: { estudiantes_por_carrera: [], materias_por_carrera: [] }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('admin/dashboard/stats/');
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Colores para los gráficos
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left w-full animate-in fade-in duration-500">
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Estudiantes Registrados" 
                    value={stats.totales.estudiantes} 
                    icon={Users} 
                    colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                    title="Docentes Activos" 
                    value={stats.totales.docentes} 
                    icon={Users} 
                    colorClass="bg-green-50 text-green-600" 
                />
                <StatCard 
                    title="Carreras" 
                    value={stats.totales.carreras} 
                    icon={GraduationCap} 
                    colorClass="bg-orange-50 text-orange-600" 
                />
                <StatCard 
                    title="Aulas Disponibles" 
                    value={stats.totales.aulas} 
                    icon={Building2} 
                    colorClass="bg-purple-50 text-purple-600" 
                />
            </div>

            {/* Sección de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Gráfico 1: Estudiantes por Carrera */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Users className="text-blue-500 h-5 w-5" />
                        Estudiantes por Carrera
                    </h3>
                    <div className="h-72 w-full">
                        {stats.graficos.estudiantes_por_carrera.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.graficos.estudiantes_por_carrera}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="carrera__nombre_carrera" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                                        tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" name="Total de Estudiantes" radius={[4, 4, 0, 0]}>
                                        {stats.graficos.estudiantes_por_carrera.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No hay datos de estudiantes</div>
                        )}
                    </div>
                </div>

                {/* Gráfico 2: Materias por Carrera */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <BookOpen className="text-green-500 h-5 w-5" />
                        Materias Registradas por Carrera
                    </h3>
                    <div className="h-72 w-full">
                        {stats.graficos.materias_por_carrera.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.graficos.materias_por_carrera}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="total"
                                        nameKey="carrera__nombre_carrera"
                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.graficos.materias_por_carrera.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No hay datos de materias</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Módulos de Acceso Rápido */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-100 bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="text-blue-500 h-5 w-5" />
                            <h4 className="font-medium text-gray-800">Total Materias Global</h4>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totales.materias}</p>
                    </div>
                    
                    <div className="border border-gray-100 bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-purple-500 h-5 w-5" />
                            <h4 className="font-medium text-gray-800">Total Usuarios (Admin/Operador)</h4>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totales.usuarios}</p>
                    </div>

                    <div className="border border-gray-100 bg-gray-50 rounded-lg p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="text-orange-500 h-5 w-5" />
                            <h4 className="font-medium text-gray-800">Total Aulas Físicas</h4>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totales.aulas}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
