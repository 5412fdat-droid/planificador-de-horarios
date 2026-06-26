import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Agropecuaria').first()
aula_01, _ = Aula.objects.get_or_create(nombre_aula='Aula 01', defaults={'capacidad_maxima': 50})

# Colores (aproximados a la imagen)
c_apl201 = '#fde047' # Yellow
c_bes202 = '#7e22ce' # Purple
c_apl203 = '#93c5fd' # Light Blue
c_bes204 = '#bbf7d0' # Pale Green
c_apl205 = '#4ade80' # Lime Green
c_bes206 = '#f97316' # Orange

def add_horario(semestre, grupo_nombre, dia, h_ini, h_fin, sigla, docente_codigo, color_hex, aula):
    mat = Materia.objects.filter(sigla_materia=sigla, carrera=carrera, periodo_materia=semestre).first()
    if not mat:
        print(f"Error: No se encontro materia {sigla} para semestre {semestre}")
        return
        
    doc = Docente.objects.filter(codigo_docente=docente_codigo).first()
    if not doc:
        print(f"Error: No se encontro docente {docente_codigo}")
        return
        
    grupo, _ = GrupoMateria.objects.get_or_create(
        materia=mat, docente=doc, gestion='1-2026', nombre_grupo=grupo_nombre,
        defaults={'cupo_limite': 50, 'color_hex': color_hex}
    )
    if grupo.color_hex != color_hex:
        grupo.color_hex = color_hex
        grupo.save()
        
    h_i = time(int(h_ini.split(':')[0]), int(h_ini.split(':')[1]))
    h_f = time(int(h_fin.split(':')[0]), int(h_fin.split(':')[1]))
    
    Horario.objects.create(
        grupo_materia=grupo, aula=aula, dia_semana=dia,
        hora_inicio=h_i, hora_fin=h_f
    )
    print(f"Added S{semestre} {grupo_nombre} {dia} {h_ini}-{h_fin} {sigla} {docente_codigo}")

# Limpiar previos
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia='3').delete()

# --- TERCER SEMESTRE "VA" ---
# Mañana
add_horario('3', 'VA', 'Lunes', '07:00', '09:15', 'BES-206', '7120', c_bes206, aula_01)

# Tarde/Noche
add_horario('3', 'VA', 'Lunes', '13:45', '16:00', 'BES-206', '7120', c_bes206, aula_01)
add_horario('3', 'VA', 'Lunes', '16:00', '18:15', 'APL-205', '1115', c_apl205, aula_01)
add_horario('3', 'VA', 'Lunes', '18:15', '20:30', 'BES-202', '6261', c_bes202, aula_01)

add_horario('3', 'VA', 'Martes', '13:45', '16:00', 'BES-204', '2376', c_bes204, aula_01)
add_horario('3', 'VA', 'Martes', '16:00', '19:45', 'APL-203', '2829', c_apl203, aula_01)

add_horario('3', 'VA', 'Miercoles', '13:45', '16:00', 'BES-202', '6261', c_bes202, aula_01)
add_horario('3', 'VA', 'Miercoles', '16:00', '18:15', 'APL-201', '974', c_apl201, aula_01)
add_horario('3', 'VA', 'Miercoles', '18:15', '19:45', 'BES-204', '2376', c_bes204, aula_01)

add_horario('3', 'VA', 'Jueves', '13:45', '16:00', 'BES-204', '2376', c_bes204, aula_01)
add_horario('3', 'VA', 'Jueves', '16:00', '18:15', 'APL-203', '2829', c_apl203, aula_01)

add_horario('3', 'VA', 'Viernes', '13:45', '16:00', 'APL-205', '1115', c_apl205, aula_01)
add_horario('3', 'VA', 'Viernes', '16:00', '18:15', 'APL-201', '974', c_apl201, aula_01)

print("Finalizado Semestre 3 Agropecuaria")
