import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from administrador.models import Docente, GrupoMateria

mapping = {
    'LIC.RAMIROLIM': '4360',
    'LIC.PEDROPRAD': '4359',
    'LIC.ALAINPATI': '6035',
    'LIC.HILDAVARG': '4358',
    'LIC.JAMMELBUR': '9295',
    'LIC.FEDERICOL': '8181',
    'LIC.GABRIELAQ': '8044',
    'LIC.RIDELCONT': '8547',
    'LIC.EDWINCALI': '6532'
}

for bad_code, good_code in mapping.items():
    try:
        bad_doc = Docente.objects.get(codigo_docente=bad_code)
        good_doc = Docente.objects.get(codigo_docente=good_code)
        
        # Remap GrupoMateria
        GrupoMateria.objects.filter(docente=bad_doc).update(docente=good_doc)
        
        # Delete bad doc
        bad_doc.delete()
        print(f"Reemplazado {bad_code} por {good_code}")
    except Exception as e:
        print(f"Error {bad_code}: {e}")

# Fix PORASIGNAR code
try:
    por = Docente.objects.get(codigo_docente='PORASIGNAR')
    por.codigo_docente = '0000'
    por.save()
    print("Codigo de Por Asignar actualizado a 0000")
except:
    pass

