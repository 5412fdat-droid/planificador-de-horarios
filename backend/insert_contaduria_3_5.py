import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Contaduria').first()

# Aulas
aula_09, _ = Aula.objects.get_or_create(nombre_aula='Aula 09', defaults={'capacidad_maxima': 50})
aula_10, _ = Aula.objects.get_or_create(nombre_aula='Aula 10', defaults={'capacidad_maxima': 50})

# Colores
c_cyan = '#06b6d4'
c_green = '#22c55e'
c_dblue = '#1e3a8a' # Dark Blue
c_orange = '#f97316'
c_teal = '#14b8a6' # or light blue
c_pink = '#d946ef'

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

# Limpiar previos si existieran para semestre 3 y 5
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia__in=['3', '5']).delete()

# --- TERCER SEMESTRE ---
# Grupo VA, Aula 10
add_horario('3', 'VA', 'Lunes', '13:45', '16:00', 'CSC-200', '9295', c_dblue, aula_10)
add_horario('3', 'VA', 'Lunes', '16:00', '18:15', 'CSC-200', '9295', c_dblue, aula_10)
add_horario('3', 'VA', 'Martes', '13:45', '16:00', 'CPA-200', '5114', c_green, aula_10)
add_horario('3', 'VA', 'Martes', '16:00', '18:15', 'MAT-200', '7121', c_cyan, aula_10)
add_horario('3', 'VA', 'Miercoles', '13:45', '16:00', 'MAT-200', '7121', c_cyan, aula_10)
add_horario('3', 'VA', 'Miercoles', '16:00', '18:15', 'CPA-200', '5114', c_green, aula_10)
add_horario('3', 'VA', 'Jueves', '13:45', '16:00', 'COM-200', '7121', c_cyan, aula_10)
add_horario('3', 'VA', 'Jueves', '16:00', '18:15', 'COM-200', '7121', c_cyan, aula_10)
add_horario('3', 'VA', 'Viernes', '13:45', '16:00', 'ECO-200', '5048', c_orange, aula_10)
add_horario('3', 'VA', 'Viernes', '16:00', '18:15', 'ECO-200', '5048', c_orange, aula_10)

# --- QUINTO SEMESTRE ---
# Grupo VA, Aula 09
add_horario('5', 'VA', 'Lunes', '18:15', '20:30', 'CPA-320', '5593', c_pink, aula_09)
add_horario('5', 'VA', 'Lunes', '20:30', '22:45', 'CPA-300', '5114', c_green, aula_09)
add_horario('5', 'VA', 'Martes', '18:15', '20:30', 'CPA-310', '5593', c_pink, aula_09)
add_horario('5', 'VA', 'Martes', '20:30', '22:45', 'CJS-300', '8709', c_teal, aula_09)
add_horario('5', 'VA', 'Miercoles', '18:15', '20:30', 'CJS-300', '8709', c_teal, aula_09)
add_horario('5', 'VA', 'Miercoles', '20:30', '22:45', 'CPA-310', '5593', c_pink, aula_09)
add_horario('5', 'VA', 'Jueves', '18:15', '20:30', 'CPA-300', '5114', c_green, aula_09)
add_horario('5', 'VA', 'Jueves', '20:30', '22:45', 'CPA-320', '5593', c_pink, aula_09)
add_horario('5', 'VA', 'Viernes', '18:15', '20:30', 'MAT-300', '5048', c_orange, aula_09)
add_horario('5', 'VA', 'Viernes', '20:30', '22:45', 'MAT-300', '5048', c_orange, aula_09)

print("Finalizado Semestre 3 y 5")
