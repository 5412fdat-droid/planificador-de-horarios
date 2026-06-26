import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Contaduria').first()

# Aulas
aula_10, _ = Aula.objects.get_or_create(nombre_aula='Aula 10', defaults={'capacidad_maxima': 50})
aula_11, _ = Aula.objects.get_or_create(nombre_aula='Aula 11', defaults={'capacidad_maxima': 50})

# Colores (aproximados a la imagen)
c_yellow = '#fde047'
c_magenta = '#d946ef'
c_cyan = '#06b6d4'
c_lblue = '#7dd3fc'
c_teal = '#5eead4'
c_green = '#22c55e'
c_lgray = '#e2e8f0'

def add_horario(semestre, grupo_nombre, dia, h_ini, h_fin, sigla, docente_codigo, color_hex, aula):
    mat = Materia.objects.filter(sigla_materia=sigla, carrera=carrera, periodo_materia=semestre).first()
    if not mat:
        print(f"Error: No se encontro materia {sigla} para semestre {semestre}")
        return
        
    doc = Docente.objects.filter(codigo_docente=docente_codigo).first()
    if not doc:
        # Fallback a buscar por nombre si no encuentra por codigo (e.g., 8645 vs 8709)
        if docente_codigo == '8645':
            doc = Docente.objects.filter(codigo_docente='8709').first()
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
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia__in=['7', '9']).delete()

# --- SÉPTIMO SEMESTRE ---
# Grupo VA, Aula 10
add_horario('7', 'VA', 'Lunes', '18:15', '20:30', 'SIF-400', '5901', c_yellow, aula_10)
add_horario('7', 'VA', 'Lunes', '20:30', '22:45', 'CPA-410', '5593', c_magenta, aula_10)
add_horario('7', 'VA', 'Martes', '18:15', '20:30', 'MAT-400', '7121', c_cyan, aula_10)
add_horario('7', 'VA', 'Martes', '20:30', '22:45', 'SIF-400', '5901', c_yellow, aula_10)
add_horario('7', 'VA', 'Miercoles', '18:15', '20:30', 'CPA-410', '5593', c_magenta, aula_10)
add_horario('7', 'VA', 'Miercoles', '20:30', '22:45', 'FIN-400', '8709', c_teal, aula_10)
add_horario('7', 'VA', 'Jueves', '18:15', '20:30', 'MAT-400', '7121', c_cyan, aula_10)
add_horario('7', 'VA', 'Jueves', '20:30', '22:45', 'FIN-400', '8709', c_teal, aula_10)
add_horario('7', 'VA', 'Viernes', '18:15', '20:30', 'CPA-400', '8645', c_lblue, aula_10) # 8645 mapped to 8709
add_horario('7', 'VA', 'Viernes', '20:30', '22:45', 'CPA-400', '8645', c_lblue, aula_10)

# --- NOVENO SEMESTRE ---
# Grupo VA, Aula 11
add_horario('9', 'VA', 'Lunes', '18:15', '20:30', 'CPA-520', '5114', c_green, aula_11)
add_horario('9', 'VA', 'Lunes', '20:30', '22:45', 'CPA-540', '7121', c_cyan, aula_11)
add_horario('9', 'VA', 'Martes', '18:15', '20:30', 'CPA-530', '5114', c_green, aula_11)
add_horario('9', 'VA', 'Martes', '20:30', '22:45', 'CPA-500', '5593', c_magenta, aula_11)
add_horario('9', 'VA', 'Miercoles', '18:15', '20:30', 'CPA-520', '5114', c_green, aula_11)
add_horario('9', 'VA', 'Miercoles', '20:30', '22:45', 'CPA-530', '5114', c_green, aula_11)
add_horario('9', 'VA', 'Jueves', '18:15', '20:30', 'CPA-500', '5593', c_magenta, aula_11)
add_horario('9', 'VA', 'Jueves', '20:30', '22:45', 'CPA-540', '7121', c_cyan, aula_11)
add_horario('9', 'VA', 'Viernes', '18:15', '20:30', 'CPA-510', '8044', c_lgray, aula_11)
add_horario('9', 'VA', 'Viernes', '20:30', '22:45', 'CPA-510', '8044', c_lgray, aula_11)

print("Finalizado Semestre 7 y 9")
