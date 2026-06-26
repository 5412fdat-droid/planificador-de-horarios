import sys
import os
import django
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Materia

replacements = [
    (r'T[^a-z]cnicas', 'Técnicas'),
    (r'Redacci[^a-z]n', 'Redacción'),
    (r'Cl[^a-z]nico', 'Clínico'),
    (r'Quir[^a-z]rgica', 'Quirúrgica'),
    (r'Quir[^a-z]rgicas', 'Quirúrgicas'),
]

fixed_count = 0
for materia in Materia.objects.all():
    original_name = materia.nombre_materia
    new_name = original_name
    for pattern, good in replacements:
        new_name = re.sub(pattern, good, new_name, flags=re.IGNORECASE)
    
    if new_name != original_name:
        materia.nombre_materia = new_name
        materia.save()
        fixed_count += 1
    
    for c in new_name:
        if ord(c) > 127 and c not in 'áéíóúÁÉÍÓÚñÑ':
            print(f"Still bad char in: {new_name}")
            break

print(f"Successfully fixed {fixed_count} MORE materias.")
