import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Agropecuaria').first()
aula_01, _ = Aula.objects.get_or_create(nombre_aula='Aula 01', defaults={'capacidad_maxima': 50})

# Colores QUINTO SEMESTRE
c_apl301 = '#c9daf8' # Light Blue
c_apl302 = '#7030a0' # Purple
c_apl303 = '#c4d79b' # Pale Green
c_apl304 = '#1f497d' # Dark Blue
c_apl305 = '#ff0000' # Red
c_com306 = '#92d050' # Lime Green

# Colores SÉPTIMO SEMESTRE
c_apl401 = '#c9daf8' # Light Blue
c_apl402 = '#ffff00' # Yellow
c_apl403 = '#c9daf8' # Light Blue
c_bes404 = '#00b050' # Bright Green
c_apl405 = '#ff0000' # Red
c_com406 = '#ffc000' # Orange-Yellow

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
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia__in=['5', '7']).delete()

# --- QUINTO SEMESTRE "VA" ---
# Lunes
add_horario('5', 'VA', 'Lunes', '09:15', '11:30', 'APL-304', '7120', c_apl304, aula_01)
add_horario('5', 'VA', 'Lunes', '13:45', '16:00', 'APL-301', '2829', c_apl301, aula_01)
add_horario('5', 'VA', 'Lunes', '16:00', '18:15', 'APL-305', '1034', c_apl305, aula_01)
add_horario('5', 'VA', 'Lunes', '18:15', '20:30', 'APL-304', '7120', c_apl304, aula_01)
# Martes
add_horario('5', 'VA', 'Martes', '13:45', '16:00', 'COM-306', '1115', c_com306, aula_01)
add_horario('5', 'VA', 'Martes', '16:00', '18:15', 'APL-303', '2376', c_apl303, aula_01)
add_horario('5', 'VA', 'Martes', '18:15', '20:30', 'APL-302', '6261', c_apl302, aula_01)
# Miercoles
add_horario('5', 'VA', 'Miercoles', '13:45', '16:00', 'APL-305', '1034', c_apl305, aula_01)
add_horario('5', 'VA', 'Miercoles', '16:00', '18:15', 'APL-301', '2829', c_apl301, aula_01)
# Jueves
add_horario('5', 'VA', 'Jueves', '13:45', '16:00', 'APL-302', '6261', c_apl302, aula_01)
add_horario('5', 'VA', 'Jueves', '16:00', '18:15', 'APL-303', '2376', c_apl303, aula_01)
# Viernes
add_horario('5', 'VA', 'Viernes', '16:00', '18:15', 'COM-306', '1115', c_com306, aula_01)

# --- SEPTIMO SEMESTRE "VA" ---
# Lunes
add_horario('7', 'VA', 'Lunes', '13:45', '16:00', 'APL-405', '1034', c_apl405, aula_01)
add_horario('7', 'VA', 'Lunes', '16:00', '19:45', 'APL-401', '2829', c_apl401, aula_01)
# Martes
add_horario('7', 'VA', 'Martes', '13:45', '16:00', 'APL-403', '2829', c_apl403, aula_01)
add_horario('7', 'VA', 'Martes', '16:00', '18:15', 'APL-402', '974', c_apl402, aula_01)
# Miercoles
add_horario('7', 'VA', 'Miercoles', '13:45', '16:00', 'COM-406', '7119', c_com406, aula_01)
add_horario('7', 'VA', 'Miercoles', '16:00', '18:15', 'BES-404', '4360', c_bes404, aula_01)
add_horario('7', 'VA', 'Miercoles', '18:15', '20:30', 'APL-401', '2829', c_apl401, aula_01)
# Jueves
add_horario('7', 'VA', 'Jueves', '13:45', '16:00', 'APL-403', '2829', c_apl403, aula_01)
add_horario('7', 'VA', 'Jueves', '16:00', '18:15', 'APL-405', '1034', c_apl405, aula_01)
add_horario('7', 'VA', 'Jueves', '18:15', '20:30', 'APL-402', '974', c_apl402, aula_01)
# Viernes
add_horario('7', 'VA', 'Viernes', '13:45', '16:00', 'BES-404', '4360', c_bes404, aula_01)
add_horario('7', 'VA', 'Viernes', '16:00', '18:15', 'COM-406', '7119', c_com406, aula_01)

print("Finalizado Semestre 5 y 7 Agropecuaria")
