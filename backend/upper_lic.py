import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Docente

count = 0
for d in Docente.objects.all():
    if d.nombre_docente.startswith('Lic. '):
        d.nombre_docente = d.nombre_docente.replace('Lic. ', 'LIC. ', 1)
        d.save()
        count += 1
    elif d.nombre_docente.startswith('Ing. '):
        d.nombre_docente = d.nombre_docente.replace('Ing. ', 'ING. ', 1)
        d.save()

print(f'Actualizados a mayusculas: {count}')
