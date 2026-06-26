import os
import django
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Docente

count = 0
for d in Docente.objects.all():
    name = d.nombre_docente.strip()
    if name.upper() == 'POR ASIGNAR':
        continue
    
    if re.match(r'^(Lic|LIC|lic)\.?\s*', name):
        name = re.sub(r'^(Lic|LIC|lic)\.?\s*', 'Lic. ', name)
    elif re.match(r'^(Ing|ING|ing)\.?\s*', name):
        name = re.sub(r'^(Ing|ING|ing)\.?\s*', 'Ing. ', name) # In case there's an Ing
    else:
        name = 'Lic. ' + name
        
    if d.nombre_docente != name:
        d.nombre_docente = name
        d.save()
        count += 1

print(f'Docentes actualizados: {count}')
