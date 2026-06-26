import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Docente, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Agropecuaria').first()

# Aulas
aula_01, _ = Aula.objects.get_or_create(nombre_aula='Aula 01', defaults={'capacidad_maxima': 50})

# Colores (aproximados a la imagen)
c_bin101 = '#b2d8b2'
c_bin102 = '#000000'
c_com103 = '#8ea9db'
c_bin104 = '#ff0000'
c_bin105 = '#ffff00'
c_com106 = '#92d050'

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
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia='1').delete()

# --- PRIMER SEMESTRE "VA" ---
add_horario('1', 'VA', 'Lunes', '13:45', '16:00', 'COM-106', '1115', c_com106, aula_01)
add_horario('1', 'VA', 'Lunes', '16:00', '18:15', 'BIN-101', '2376', c_bin101, aula_01)
add_horario('1', 'VA', 'Lunes', '18:15', '19:45', 'BIN-101', '2376', c_bin101, aula_01)

add_horario('1', 'VA', 'Martes', '13:45', '16:00', 'BIN-105', '974', c_bin105, aula_01)
add_horario('1', 'VA', 'Martes', '16:00', '18:15', 'BIN-104', '1034', c_bin104, aula_01)
add_horario('1', 'VA', 'Martes', '18:15', '19:45', 'COM-103', '7120', c_com103, aula_01)

add_horario('1', 'VA', 'Miercoles', '13:45', '16:00', 'COM-106', '1115', c_com106, aula_01)
add_horario('1', 'VA', 'Miercoles', '16:00', '20:30', 'BIN-102', '6269', c_bin102, aula_01)

add_horario('1', 'VA', 'Jueves', '13:45', '16:00', 'COM-103', '7120', c_com103, aula_01)
add_horario('1', 'VA', 'Jueves', '16:00', '18:15', 'BIN-105', '974', c_bin105, aula_01)
add_horario('1', 'VA', 'Jueves', '18:15', '19:45', 'BIN-102', '6269', c_bin102, aula_01)

add_horario('1', 'VA', 'Viernes', '13:45', '16:00', 'BIN-101', '2376', c_bin101, aula_01)
add_horario('1', 'VA', 'Viernes', '16:00', '19:45', 'BIN-104', '1034', c_bin104, aula_01)

# --- PRIMER SEMESTRE "AV" ---
add_horario('1', 'AV', 'Miercoles', '07:45', '10:45', 'BIN-102', '6269', c_bin102, aula_01)
add_horario('1', 'AV', 'Jueves', '07:45', '09:15', 'BIN-102', '6269', c_bin102, aula_01)

add_horario('1', 'AV', 'Lunes', '13:45', '16:00', 'BIN-105', '974', c_bin105, aula_01)

add_horario('1', 'AV', 'Martes', '13:45', '16:00', 'COM-103', '7120', c_com103, aula_01)
add_horario('1', 'AV', 'Martes', '16:00', '18:15', 'COM-106', '1115', c_com106, aula_01)
add_horario('1', 'AV', 'Martes', '18:15', '19:45', 'BIN-101', '2376', c_bin101, aula_01)

add_horario('1', 'AV', 'Miercoles', '13:45', '16:00', 'BIN-101', '2376', c_bin101, aula_01)
add_horario('1', 'AV', 'Miercoles', '16:00', '19:45', 'BIN-104', '1034', c_bin104, aula_01)

add_horario('1', 'AV', 'Jueves', '13:45', '16:00', 'BIN-105', '974', c_bin105, aula_01)
add_horario('1', 'AV', 'Jueves', '16:00', '18:15', 'COM-103', '7120', c_com103, aula_01)

add_horario('1', 'AV', 'Viernes', '13:45', '16:00', 'BIN-104', '1034', c_bin104, aula_01)
add_horario('1', 'AV', 'Viernes', '16:00', '18:15', 'BIN-101', '2376', c_bin101, aula_01)
add_horario('1', 'AV', 'Viernes', '18:15', '19:45', 'COM-106', '1115', c_com106, aula_01)

print("Finalizado Semestre 1 Agropecuaria")
