from rest_framework import serializers
from .models import Carrera, Docente, Aula, Materia, Prerrequisito, GrupoMateria, Horario

class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = '__all__'

class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'

class AulaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aula
        fields = '__all__'

class MateriaSerializer(serializers.ModelSerializer):
    carrera_nombre = serializers.ReadOnlyField(source='carrera.nombre_carrera')
    requisitos = serializers.SerializerMethodField()
    requisitos_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = Materia
        fields = '__all__'

    def get_requisitos(self, obj):
        reqs = [p.materia_requerida.sigla_materia for p in obj.prerrequisitos.all()]
        if obj.requisito_texto:
            reqs.append(obj.requisito_texto)
        return reqs
    def create(self, validated_data):
        requisitos_ids = validated_data.pop('requisitos_ids', [])
        materia = super().create(validated_data)
        for req_id in requisitos_ids:
            Prerrequisito.objects.create(materia=materia, materia_requerida_id=req_id)
        return materia

    def update(self, instance, validated_data):
        requisitos_ids = validated_data.pop('requisitos_ids', None)
        materia = super().update(instance, validated_data)
        if requisitos_ids is not None:
            Prerrequisito.objects.filter(materia=materia).delete()
            for req_id in requisitos_ids:
                Prerrequisito.objects.create(materia=materia, materia_requerida_id=req_id)
        return materia

class PrerrequisitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prerrequisito
        fields = '__all__'

class GrupoMateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoMateria
        fields = '__all__'

class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'

class HorarioReadSerializer(serializers.ModelSerializer):
    materia_nombre = serializers.ReadOnlyField(source='grupo_materia.materia.nombre_materia')
    materia_sigla = serializers.ReadOnlyField(source='grupo_materia.materia.sigla_materia')
    materia_id = serializers.ReadOnlyField(source='grupo_materia.materia.id')
    docente_nombre = serializers.ReadOnlyField(source='grupo_materia.docente.nombre_docente')
    docente_id = serializers.ReadOnlyField(source='grupo_materia.docente.id')
    docente_codigo = serializers.ReadOnlyField(source='grupo_materia.docente.codigo_docente')
    grupo_nombre = serializers.ReadOnlyField(source='grupo_materia.nombre_grupo')
    cupo_limite = serializers.ReadOnlyField(source='grupo_materia.cupo_limite')
    aula_nombre = serializers.ReadOnlyField(source='aula.nombre_aula')
    carrera_id = serializers.ReadOnlyField(source='grupo_materia.materia.carrera.id')
    carrera_nombre = serializers.ReadOnlyField(source='grupo_materia.materia.carrera.nombre_carrera')
    periodo = serializers.ReadOnlyField(source='grupo_materia.materia.periodo_materia')
    color_hex = serializers.ReadOnlyField(source='grupo_materia.color_hex')
    requisitos = serializers.SerializerMethodField()

    class Meta:
        model = Horario
        fields = '__all__'

    def get_requisitos(self, obj):
        materia = obj.grupo_materia.materia
        reqs = [p.materia_requerida.sigla_materia for p in materia.prerrequisitos.all()]
        if materia.requisito_texto:
            # Parsear texto separado por comas (ej. "MAT-103, INF-120")
            text_reqs = [r.strip() for r in materia.requisito_texto.split(',')]
            # Filtrar los que no parecen siglas válidas (opcional, pero útil)
            reqs.extend([r for r in text_reqs if '-' in r])
        return reqs

from core.models import Usuario, Estudiante
from django.contrib.auth.hashers import make_password

class EstudianteSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='usuario.nombre', read_only=True)
    carnet = serializers.CharField(source='usuario.carnet', read_only=True)
    carrera_nombre = serializers.ReadOnlyField(source='carrera.nombre_carrera')

    class Meta:
        model = Estudiante
        fields = '__all__'

class EstudianteCreateSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=255)
    carnet = serializers.CharField(max_length=50)
    registro = serializers.CharField(max_length=50)
    carrera_id = serializers.IntegerField()

    def validate_registro(self, value):
        if not value.isdigit() or len(value) != 9:
            raise serializers.ValidationError("El número de registro debe contener exactamente 9 dígitos numéricos.")
        if Estudiante.objects.filter(registro=value).exists():
            raise serializers.ValidationError("Este número de registro ya pertenece a un estudiante.")
        return value

    def validate_carnet(self, value):
        if Usuario.objects.filter(carnet=value).exists():
            raise serializers.ValidationError("Este carnet ya está registrado en el sistema.")
        return value

    def create(self, validated_data):
        nombre = validated_data['nombre']
        carnet = validated_data['carnet']
        registro = validated_data['registro']
        carrera_id = validated_data['carrera_id']

        correo = f"{registro}@estudiantes.fivc.edu.bo"

        usuario = Usuario.objects.create(
            nombre=nombre,
            correo=correo,
            password=make_password(carnet),
            carnet=carnet,
            rol='Estudiante'
        )

        carrera = Carrera.objects.get(id=carrera_id)

        estudiante = Estudiante.objects.create(
            usuario=usuario,
            registro=registro,
            carrera=carrera,
            avance_academico='0%',
            malla_intuitiva=False
        )
        return estudiante

class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['nombre', 'correo', 'password', 'carnet', 'rol']
        
    def create(self, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

from core.models import HistorialAcademico, Inscripcion

class HistorialAcademicoSerializer(serializers.ModelSerializer):
    sigla_materia = serializers.CharField(source='materia.sigla_materia', read_only=True)
    nombre_materia = serializers.CharField(source='materia.nombre_materia', read_only=True)
    periodo_materia = serializers.CharField(source='materia.periodo_materia', read_only=True)
    
    class Meta:
        model = HistorialAcademico
        fields = '__all__'
        read_only_fields = ['estudiante', 'estado']

class InscripcionSerializer(serializers.ModelSerializer):
    sigla_materia = serializers.CharField(source='materia.sigla_materia', read_only=True)
    nombre_materia = serializers.CharField(source='materia.nombre_materia', read_only=True)
    periodo_materia = serializers.CharField(source='materia.periodo_materia', read_only=True)
    
    class Meta:
        model = Inscripcion
        fields = '__all__'
        read_only_fields = ['estudiante']
