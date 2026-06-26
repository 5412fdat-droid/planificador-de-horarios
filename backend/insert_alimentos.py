import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Carrera, Materia, Aula, GrupoMateria, Horario
from datetime import time

carrera = Carrera.objects.filter(nombre_carrera__icontains='Alimentos').first()

# Aulas
aula_12, _ = Aula.objects.get_or_create(nombre_aula='Aula 12', defaults={'capacidad_maxima': 50})

# Colores SEMESTRE 1
c_ida100 = '#fde047' # Yellow
c_mat100 = '#22c55e' # Green
c_bio100 = '#f97316' # Orange
c_fis100 = '#f472b6' # Pink
c_qmc100 = '#fed7aa' # Peach

# Colores SEMESTRE 3
c_ida210 = '#38bdf8' # Light Blue
c_est200 = '#fdba74' # Peach
c_ida200 = '#4ade80' # Green
c_fis200 = '#fbbf24' # Orange-Yellow
c_qmc200 = '#d946ef' # Magenta
c_adm200 = '#fef08a' # Light Yellow

def add_horario(semestre, grupo_nombre, dia, h_ini, h_fin, sigla, color_hex, aula):
    mat = Materia.objects.filter(sigla_materia=sigla, carrera=carrera).first()
    if not mat:
        # Retry with stripping spaces for IDA 100
        mat = Materia.objects.filter(sigla_materia__icontains=sigla.replace(" ", ""), carrera=carrera).first()
    if not mat:
        print(f"Error: No se encontro materia {sigla}")
        return
        
    grupo, _ = GrupoMateria.objects.get_or_create(
        materia=mat, docente=None, gestion='1-2026', nombre_grupo=grupo_nombre,
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
    print(f"Added S{semestre} {grupo_nombre} {dia} {h_ini}-{h_fin} {sigla}")

# Limpiar previos
Horario.objects.filter(grupo_materia__materia__carrera=carrera, grupo_materia__gestion='1-2026', grupo_materia__materia__periodo_materia__in=['1', '3']).delete()

# --- PRIMER SEMESTRE "VA" ---
add_horario('1', 'VA', 'Lunes', '13:45', '18:15', 'IDA 100', c_ida100, aula_12)
add_horario('1', 'VA', 'Martes', '13:45', '18:15', 'MAT100', c_mat100, aula_12)
add_horario('1', 'VA', 'Miercoles', '13:45', '18:15', 'BIO100', c_bio100, aula_12)
add_horario('1', 'VA', 'Jueves', '13:45', '18:15', 'FIS100', c_fis100, aula_12)
add_horario('1', 'VA', 'Viernes', '13:45', '18:15', 'QMC100', c_qmc100, aula_12)

# --- TERCER SEMESTRE "VA" ---
add_horario('3', 'VA', 'Lunes', '18:15', '22:45', 'IDA210', c_ida210, aula_12)
add_horario('3', 'VA', 'Martes', '18:15', '22:45', 'EST200', c_est200, aula_12)
add_horario('3', 'VA', 'Miercoles', '18:15', '22:45', 'IDA200', c_ida200, aula_12)
add_horario('3', 'VA', 'Jueves', '18:15', '22:45', 'FIS200', c_fis200, aula_12)
add_horario('3', 'VA', 'Viernes', '18:15', '22:45', 'QMC200', c_qmc200, aula_12)
add_horario('3', 'VA', 'Sabado', '18:15', '22:45', 'ADM200', c_adm200, aula_12)

print("Finalizado Semestre 1 y 3 Alimentos")
