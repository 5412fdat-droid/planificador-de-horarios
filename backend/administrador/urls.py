from django.urls import path
from .views import (
    CarreraListCreateView, DocenteListCreateView, AulaListCreateView, MateriaListCreateView,
    CarreraDetailView, DocenteDetailView, AulaDetailView, MateriaDetailView,
    OperadorCarreraListView, OperadorGrupoListView, MateriaAutocompleteView, HorarioListCreateView,
    HorarioDetailView, EstudianteListCreateView, UsuarioListCreateView, UsuarioDetailView,
    GrupoMateriaUpdateView, EstudianteDetailView, HistorialAcademicoListCreateView, HistorialAcademicoDetailView,
    DashboardStatsView, InscripcionListCreateView, InscripcionDetailView
)

urlpatterns = [
    # ADMINISTRADOR
    path('dashboard/stats/', DashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('carreras/', CarreraListCreateView.as_view(), name='admin-carreras'),
    path('carreras/<int:pk>/', CarreraDetailView.as_view(), name='admin-carreras-detail'),
    path('docentes/', DocenteListCreateView.as_view(), name='admin-docentes'),
    path('docentes/<int:pk>/', DocenteDetailView.as_view(), name='admin-docentes-detail'),
    path('aulas/', AulaListCreateView.as_view(), name='admin-aulas'),
    path('aulas/<int:pk>/', AulaDetailView.as_view(), name='admin-aulas-detail'),
    path('materias/', MateriaListCreateView.as_view(), name='admin-materias'),
    path('materias/<int:pk>/', MateriaDetailView.as_view(), name='admin-materias-detail'),
    path('estudiantes/', EstudianteListCreateView.as_view(), name='admin-estudiantes'),
    path('estudiantes/<int:pk>/', EstudianteDetailView.as_view(), name='admin-estudiantes-detail'),
    path('estudiantes/<int:estudiante_id>/historial/', HistorialAcademicoListCreateView.as_view(), name='admin-estudiantes-historial'),
    path('historial/<int:pk>/', HistorialAcademicoDetailView.as_view(), name='admin-historial-detail'),
    path('estudiantes/<int:estudiante_id>/inscripciones/', InscripcionListCreateView.as_view(), name='admin-estudiantes-inscripciones'),
    path('inscripciones/<int:pk>/', InscripcionDetailView.as_view(), name='admin-inscripcion-detail'),
    path('usuarios/', UsuarioListCreateView.as_view(), name='admin-usuarios'),
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='admin-usuarios-detail'),

    # OPERADOR
    path('operador/carreras/', OperadorCarreraListView.as_view(), name='operador-carreras'),
    path('operador/grupos/', OperadorGrupoListView.as_view(), name='operador-grupos'),
    path('operador/materias/autocomplete/', MateriaAutocompleteView.as_view(), name='operador-materias-autocomplete'),
    path('operador/horarios/', HorarioListCreateView.as_view(), name='operador-horarios'),
    path('operador/horarios/<int:pk>/', HorarioDetailView.as_view(), name='operador-horarios-detail'),
    path('operador/grupo-materia/<int:pk>/', GrupoMateriaUpdateView.as_view(), name='operador-grupo-materia-update'),
]
