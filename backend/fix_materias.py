import sys
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Materia

replacements = {
    'Fsica': 'Física',
    'Programacin': 'Programación',
    'Tcnico': 'Técnico',
    'Tcnicas': 'Técnicas',
    'Estadstica': 'Estadística',
    'Mtodos': 'Métodos',
    'Numricos': 'Numéricos',
    'Organizacin': 'Organización',
    'Economa': 'Economía',
    'Informacin': 'Información',
    'Investigacin': 'Investigación',
    'Produccin': 'Producción',
    'Geogrfica': 'Geográfica',
    'Informtica': 'Informática',
    'Macroeconoma': 'Macroeconomía',
    'Tecnologa': 'Tecnología',
    'Teora': 'Teoría',
    'Matemtica': 'Matemática',
    'Matemticas': 'Matemáticas',
    'Administracin': 'Administración',
    'Anlisis': 'Análisis',
    'Ecolgica': 'Ecológica',
    'Qumica': 'Química',
    'Sistemtica': 'Sistemática',
    'Biologa': 'Biología',
    'Ecologa': 'Ecología',
    'Agroclimatologa': 'Agroclimatología',
    'Anatoma': 'Anatomía',
    'Fisiologa': 'Fisiología',
    'Agrcola': 'Agrícola',
    'Agrcolas': 'Agrícolas',
    'Edafologa': 'Edafología',
    'Farmacologa': 'Farmacología',
    'Microbiologa': 'Microbiología',
    'Gentica': 'Genética',
    'Gentico': 'Genético',
    'Transformacin': 'Transformación',
    'Conservacin': 'Conservación',
    'Lcteos': 'Lácteos',
    'Crnicos': 'Cárnicos',
    'Enologa': 'Enología',
    'Orgnica': 'Orgánica',
    'Hidrulica': 'Hidráulica',
    'Inspeccin': 'Inspección',
    'Diseos': 'Diseños',
    'Diseo': 'Diseño',
    'Clnico': 'Clínico',
    'Quirrgica': 'Quirúrgica',
    'Clculo': 'Cálculo',
    'Analtica': 'Analítica',
    'Fisicoqumica': 'Fisicoquímica',
    'Bioqumica': 'Bioquímica',
    'Gestin': 'Gestión',
    'Prctica': 'Práctica',
    'Auditora': 'Auditoría',
    'Nutricin': 'Nutrición',
    'Introduccin': 'Introducción',
    'Preparacin': 'Preparación',
    'Evaluacin': 'Evaluación',
    'Aplicacin': 'Aplicación',
    'Mecanizacin': 'Mecanización',
    'Extencin': 'Extensión',
    'Proteccin': 'Protección',
    'Energa': 'Energía'
}

fixed_count = 0
for materia in Materia.objects.all():
    original_name = materia.nombre_materia
    new_name = original_name
    for bad, good in replacements.items():
        new_name = new_name.replace(bad, good)
        new_name = new_name.replace(bad.upper(), good.upper())
    
    if new_name != original_name:
        materia.nombre_materia = new_name
        materia.save()
        fixed_count += 1
    
    if '' in new_name:
        print(f"Warning: Still has weird char -> {new_name}")

print(f"Successfully fixed {fixed_count} materias.")
