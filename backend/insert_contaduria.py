import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Contaduria').first()
aula, _ = Aula.objects.get_or_create(nombre_aula='Aula 09', defaults={'capacidad_maxima': 50})

# Helper para crear horario
def add_horario(grupo_nombre, dia, h_ini, h_fin, sigla, docente_codigo, color_hex):
    mat = Materia.objects.filter(sigla_materia=sigla, carrera=carrera, periodo_materia='1').first()
    if not mat:
        print(f"Error: No se encontro materia {sigla}")
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
    print(f"Added {dia} {h_ini}-{h_fin} {sigla} {docente_codigo}")

# Colores (aproximados a la imagen)
c_green = '#22c55e'
c_cyan = '#06b6d4'
c_red = '#ef4444'
c_lblue = '#3b82f6'
c_yellow = '#eab308'
c_pink = '#d946ef'
c_dblue = '#0f172a'

# Limpiar previos si existieran
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia='1').delete()

# GRUPO VA (TARDE)
# Lunes
add_horario('VA', 'Lunes', '13:45', '16:00', 'CPA-100', '5114', c_green)
add_horario('VA', 'Lunes', '16:00', '18:15', 'MAT-100', '7121', c_cyan)
# Martes
add_horario('VA', 'Martes', '13:45', '16:00', 'ADM-100', '5901', c_yellow)
add_horario('VA', 'Martes', '16:00', '18:15', 'CPA-100', '5114', c_green)
# Miercoles
add_horario('VA', 'Miercoles', '13:45', '16:00', 'ADM-100', '5901', c_yellow)
add_horario('VA', 'Miercoles', '16:00', '18:15', 'MAT-100', '7121', c_cyan)
# Jueves
add_horario('VA', 'Jueves', '13:45', '16:00', 'ECO-100', '5592', c_red)
add_horario('VA', 'Jueves', '16:00', '18:15', 'ECO-100', '5592', c_red)
# Viernes
add_horario('VA', 'Viernes', '13:45', '16:00', 'CPA-110', '8709', c_lblue)
add_horario('VA', 'Viernes', '16:00', '18:15', 'CPA-110', '8709', c_lblue)

# GRUPO AV (MAÑANA)
# Lunes
add_horario('AV', 'Lunes', '07:45', '10:00', 'ADM-100', '8547', c_dblue) # Ridel Contreras = 8547
add_horario('AV', 'Lunes', '10:00', '12:15', 'ADM-100', '8547', c_dblue)
# Martes
add_horario('AV', 'Martes', '07:45', '10:00', 'CPA-100', '5901', c_yellow) # Limberg Osinaga = 5901
add_horario('AV', 'Martes', '10:00', '12:15', 'MAT-100', '4360', c_green)  # Ramiro Limon = 4360
# Miercoles
add_horario('AV', 'Miercoles', '07:45', '10:00', 'CPA-100', '5901', c_yellow)
add_horario('AV', 'Miercoles', '10:00', '12:15', 'CPA-110', '5593', c_pink)  # Lorena Moron = 5593
# Jueves
add_horario('AV', 'Jueves', '07:45', '10:00', 'MAT-100', '4360', c_green)
add_horario('AV', 'Jueves', '10:00', '12:15', 'CPA-110', '5593', c_pink)
# Viernes
add_horario('AV', 'Viernes', '07:45', '10:00', 'ECO-100', '8709', c_lblue) # Iver Cabrera = 8709
add_horario('AV', 'Viernes', '10:00', '12:15', 'ECO-100', '8709', c_lblue)
