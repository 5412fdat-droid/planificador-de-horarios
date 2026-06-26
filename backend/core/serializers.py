from rest_framework import serializers
from .models import Usuario, Noticia

class UsuarioSerializer(serializers.ModelSerializer):
    registro = serializers.SerializerMethodField()
    estudiante_id = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'correo', 'carnet', 'rol', 'registro', 'estudiante_id', 'is_active']

    def get_registro(self, obj):
        if hasattr(obj, 'estudiante'):
            return obj.estudiante.registro
        return None

    def get_estudiante_id(self, obj):
        if hasattr(obj, 'estudiante'):
            return obj.estudiante.id
        return None

class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticia
        fields = '__all__'

from .models import Simulacion, DetalleSimulacion

class DetalleSimulacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleSimulacion
        fields = ['id', 'grupo_materia', 'alerta_color']

class SimulacionSerializer(serializers.ModelSerializer):
    detalles = DetalleSimulacionSerializer(source='detallesimulacion_set', many=True, read_only=True)

    class Meta:
        model = Simulacion
        fields = ['id', 'estudiante', 'nombre_escenario', 'fecha_creacion', 'detalles']
