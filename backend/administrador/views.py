from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, IntegerField
from django.db.models.functions import Cast
from .models import Carrera, Docente, Aula, Materia, Prerrequisito, GrupoMateria, Horario
from .serializers import (
    CarreraSerializer, DocenteSerializer, AulaSerializer, 
    MateriaSerializer, PrerrequisitoSerializer, GrupoMateriaSerializer, HorarioSerializer,
    EstudianteSerializer, EstudianteCreateSerializer, UsuarioCreateSerializer,
    HorarioReadSerializer, HistorialAcademicoSerializer, InscripcionSerializer
)
from core.models import Estudiante, Usuario, HistorialAcademico, Inscripcion
from core.serializers import UsuarioSerializer

# ==========================================
# 2. LÓGICA EN SERVIDOR PARA EL ADMINISTRADOR
# ==========================================

class CarreraListCreateView(generics.ListCreateAPIView):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer

class DocenteListCreateView(generics.ListCreateAPIView):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer

class AulaListCreateView(generics.ListCreateAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer

class MateriaListCreateView(generics.ListCreateAPIView):
    queryset = Materia.objects.select_related('carrera').prefetch_related('prerrequisitos__materia_requerida').all()
    serializer_class = MateriaSerializer

class EstudianteListCreateView(generics.ListCreateAPIView):
    queryset = Estudiante.objects.select_related('usuario', 'carrera').all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EstudianteCreateSerializer
        return EstudianteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        estudiante = serializer.save()
        read_serializer = EstudianteSerializer(estudiante)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

class UsuarioListCreateView(generics.ListCreateAPIView):
    def get_queryset(self):
        return Usuario.objects.exclude(rol='Estudiante')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UsuarioCreateSerializer
        return UsuarioSerializer

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class CarreraDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer

class EstudianteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Estudiante.objects.select_related('usuario', 'carrera').all()
    serializer_class = EstudianteSerializer

    def update(self, request, *args, **kwargs):
        estudiante = self.get_object()
        data = request.data
        
        # Actualizar Estudiante
        if 'registro' in data:
            estudiante.registro = data['registro']
        if 'carrera_id' in data:
            estudiante.carrera_id = data['carrera_id']
        estudiante.save()
        
        # Actualizar Usuario vinculado
        usuario = estudiante.usuario
        if 'nombre' in data:
            usuario.nombre = data['nombre']
        if 'carnet' in data:
            usuario.carnet = data['carnet']
            # Opcional: si quieres actualizar el password cuando cambian el carnet
            # usuario.password = data['carnet']
        usuario.save()
        
        serializer = self.get_serializer(estudiante)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        estudiante = self.get_object()
        usuario = estudiante.usuario
        # Primero eliminamos al estudiante (la vista padre hace esto, pero lo hacemos manual para eliminar ambos)
        estudiante.delete()
        # Luego eliminamos el usuario asociado
        if usuario:
            usuario.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def recalcular_avance_estudiante(estudiante):
    total_materias = Materia.objects.filter(carrera=estudiante.carrera).count()
    materias_aprobadas = HistorialAcademico.objects.filter(estudiante=estudiante, estado='Aprobada').values('materia').distinct().count()
    porcentaje = int((materias_aprobadas / total_materias) * 100) if total_materias > 0 else 0
    estudiante.avance_academico = f"{porcentaje}%"
    estudiante.save()

class HistorialAcademicoListCreateView(generics.ListCreateAPIView):
    serializer_class = HistorialAcademicoSerializer

    def get_queryset(self):
        estudiante_id = self.kwargs['estudiante_id']
        return HistorialAcademico.objects.filter(estudiante_id=estudiante_id).annotate(
            periodo_int=Cast('materia__periodo_materia', IntegerField())
        ).order_by('periodo_int', 'materia__sigla_materia')

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        estudiante_id = self.kwargs['estudiante_id']
        estudiante = Estudiante.objects.get(id=estudiante_id)
        materia = serializer.validated_data.get('materia')

        if HistorialAcademico.objects.filter(estudiante=estudiante, materia=materia).exists():
            raise ValidationError({"error": "Esta materia ya está registrada en el historial del estudiante."})

        # Por defecto si se añade, se asume aprobada si nota >= 51
        nota = serializer.validated_data.get('nota')
        estado = 'Aprobada' if nota >= 51 else 'Reprobada'
        serializer.save(estudiante=estudiante, estado=estado)
        recalcular_avance_estudiante(estudiante)

class HistorialAcademicoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = HistorialAcademico.objects.all()
    serializer_class = HistorialAcademicoSerializer

    def perform_destroy(self, instance):
        estudiante = instance.estudiante
        instance.delete()
        recalcular_avance_estudiante(estudiante)

class InscripcionListCreateView(generics.ListCreateAPIView):
    serializer_class = InscripcionSerializer

    def get_queryset(self):
        estudiante_id = self.kwargs['estudiante_id']
        return Inscripcion.objects.filter(estudiante_id=estudiante_id).annotate(
            periodo_int=Cast('materia__periodo_materia', IntegerField())
        ).order_by('periodo_int', 'materia__sigla_materia')

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        estudiante_id = self.kwargs['estudiante_id']
        estudiante = Estudiante.objects.get(id=estudiante_id)
        materia = serializer.validated_data.get('materia')

        if Inscripcion.objects.filter(estudiante=estudiante, materia=materia).exists():
            raise ValidationError({"error": "Esta materia ya está inscrita en la boleta del estudiante."})

        serializer.save(estudiante=estudiante)

class InscripcionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer

class DocenteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        from administrador.models import GrupoMateria
        if GrupoMateria.objects.filter(docente=instance).exists():
            return Response(
                {"error": "No se puede eliminar este docente porque tiene materias u horarios asignados en alguna gestión académica."},
                status=status.HTTP_400_BAD_REQUEST
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class AulaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Aula.objects.all()
    serializer_class = AulaSerializer

class MateriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Materia.objects.select_related('carrera').prefetch_related('prerrequisitos__materia_requerida').all()
    serializer_class = MateriaSerializer

class DashboardStatsView(APIView):
    def get(self, request):
        from django.db.models import Count
        estudiantes_count = Estudiante.objects.count()
        docentes_count = Docente.objects.count()
        aulas_count = Aula.objects.count()
        carreras_count = Carrera.objects.count()
        materias_count = Materia.objects.count()
        usuarios_count = Usuario.objects.count()
        
        # Gráficos
        # 1. Estudiantes por carrera
        estudiantes_carrera = Estudiante.objects.values('carrera__nombre_carrera').annotate(total=Count('id'))
        # 2. Materias por carrera
        materias_carrera = Materia.objects.values('carrera__nombre_carrera').annotate(total=Count('id'))

        return Response({
            'totales': {
                'estudiantes': estudiantes_count,
                'docentes': docentes_count,
                'aulas': aulas_count,
                'carreras': carreras_count,
                'materias': materias_count,
                'usuarios': usuarios_count,
            },
            'graficos': {
                'estudiantes_por_carrera': list(estudiantes_carrera),
                'materias_por_carrera': list(materias_carrera),
            }
        }, status=status.HTTP_200_OK)

# ==========================================
# 3. LÓGICA EN SERVIDOR PARA EL OPERADOR
# ==========================================

class OperadorCarreraListView(generics.ListAPIView):
    queryset = Carrera.objects.all()
    serializer_class = CarreraSerializer

class OperadorGrupoListView(APIView):
    def get(self, request):
        grupos = GrupoMateria.objects.values_list('nombre_grupo', flat=True).distinct()
        return Response(list(grupos), status=status.HTTP_200_OK)

class MateriaAutocompleteView(APIView):
    def get(self, request):
        carrera_id = request.query_params.get('carrera_id')
        tipo_periodo = request.query_params.get('tipo_periodo') # 'Par' o 'Impar'

        if not carrera_id:
            return Response(
                {"error": "Falta parámetro 'carrera_id'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        materias = Materia.objects.filter(carrera_id=carrera_id)

        # Filtro de periodo basado en texto para Par e Impar
        if tipo_periodo:
            if tipo_periodo.lower() == 'impar':
                materias = materias.filter(
                    Q(periodo_materia__icontains='1') |
                    Q(periodo_materia__icontains='3') |
                    Q(periodo_materia__icontains='5') |
                    Q(periodo_materia__icontains='7') |
                    Q(periodo_materia__icontains='9') |
                    Q(periodo_materia__icontains='impar')
                )
            elif tipo_periodo.lower() == 'par':
                materias = materias.filter(
                    Q(periodo_materia__icontains='2') |
                    Q(periodo_materia__icontains='4') |
                    Q(periodo_materia__icontains='6') |
                    Q(periodo_materia__icontains='8') |
                    Q(periodo_materia__icontains='10') |
                    Q(periodo_materia__icontains='par')
                )

        resultado = materias.values('id', 'nombre_materia', 'sigla_materia', 'periodo_materia')
        return Response(list(resultado), status=status.HTTP_200_OK)

class HorarioListCreateView(APIView):
    def get(self, request):
        carrera_id = request.query_params.get('carrera_id')
        periodo = request.query_params.get('periodo')
        aula_id = request.query_params.get('aula_id')
        gestion = request.query_params.get('gestion')
        grupo = request.query_params.get('grupo')
        
        horarios = Horario.objects.all()
        if carrera_id:
            horarios = horarios.filter(grupo_materia__materia__carrera_id=carrera_id)
        if periodo:
            horarios = horarios.filter(grupo_materia__materia__periodo_materia__iexact=periodo)
        if aula_id:
            horarios = horarios.filter(aula_id=aula_id)
        if gestion:
            horarios = horarios.filter(grupo_materia__gestion=gestion)
        if grupo:
            horarios = horarios.filter(grupo_materia__nombre_grupo__iexact=grupo)
            
        serializer = HorarioReadSerializer(horarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        
        # Datos del grupo
        materia_id = data.get('materia_id')
        docente_id = data.get('docente_id')
        cupo_limite = int(data.get('cupo_limite', 0))
        nombre_grupo = data.get('nombre_grupo', 'A')
        gestion = data.get('gestion', '1/2026')
        
        # Datos del horario
        aula_id = data.get('aula_id')
        dia_semana = data.get('dia_semana')
        hora_inicio = data.get('hora_inicio')
        hora_fin = data.get('hora_fin')
        color_hex = data.get('color_hex', '#3b82f6')

        if not all([materia_id, docente_id, aula_id, dia_semana, hora_inicio, hora_fin]):
            return Response({"error": "Faltan datos obligatorios para crear el horario."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            materia = Materia.objects.get(id=materia_id)
            docente = Docente.objects.get(id=docente_id)
            aula = Aula.objects.get(id=aula_id)
        except (Materia.DoesNotExist, Docente.DoesNotExist, Aula.DoesNotExist):
            return Response({"error": "Materia, Docente o Aula no encontrados."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Validar que el cupo no exceda la capacidad del aula
        if cupo_limite > aula.capacidad_maxima:
            return Response(
                {"error": f"El cupo ingresado ({cupo_limite}) excede la capacidad del aula {aula.nombre_aula} ({aula.capacidad_maxima})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validar cruces de aula (misma aula, mismo dia, cruce de horas, misma gestión)
        cruces_aula = Horario.objects.filter(
            aula_id=aula_id,
            grupo_materia__gestion=gestion,
            dia_semana=dia_semana,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio
        )
        if cruces_aula.exists():
            cruce = cruces_aula.first()
            materia_cruce = cruce.grupo_materia.materia.nombre_materia
            carrera_cruce = cruce.grupo_materia.materia.carrera.nombre_carrera
            semestre_cruce = cruce.grupo_materia.materia.periodo_materia
            # Formatear la hora para quitar segundos si se desea, o mostrarla tal cual (ej. 07:45:00)
            h_ini = cruce.hora_inicio.strftime('%H:%M') if hasattr(cruce.hora_inicio, 'strftime') else cruce.hora_inicio
            h_fin = cruce.hora_fin.strftime('%H:%M') if hasattr(cruce.hora_fin, 'strftime') else cruce.hora_fin
            return Response(
                {"error": f"El aula {aula.nombre_aula} ya está ocupada por la carrera '{carrera_cruce}' (Materia: '{materia_cruce}', Semestre: {semestre_cruce}°) ({dia_semana} de {h_ini} a {h_fin})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Validar cruces del docente (en la misma gestión)
        grupos_docente_ids = GrupoMateria.objects.filter(docente=docente, gestion=gestion).values_list('id', flat=True)
        cruces_docente = Horario.objects.filter(
            grupo_materia_id__in=grupos_docente_ids,
            dia_semana=dia_semana,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio
        )
        if cruces_docente.exists():
            cruce = cruces_docente.first()
            materia_cruce = cruce.grupo_materia.materia.nombre_materia
            h_ini = cruce.hora_inicio.strftime('%H:%M') if hasattr(cruce.hora_inicio, 'strftime') else cruce.hora_inicio
            h_fin = cruce.hora_fin.strftime('%H:%M') if hasattr(cruce.hora_fin, 'strftime') else cruce.hora_fin
            return Response(
                {"error": f"El docente {docente.nombre_docente} ya tiene la clase '{materia_cruce}' ({dia_semana} de {h_ini} a {h_fin})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear o recuperar el grupo (Por si asignan varios horarios al mismo grupo)
        grupo, created = GrupoMateria.objects.get_or_create(
            materia=materia,
            docente=docente,
            nombre_grupo=nombre_grupo,
            gestion=gestion,
            defaults={'cupo_limite': cupo_limite, 'color_hex': color_hex}
        )
        # Actualizamos cupo por si cambia
        if not created:
            if grupo.cupo_limite != cupo_limite or grupo.color_hex != color_hex:
                grupo.cupo_limite = cupo_limite
                if 'color_hex' in data:
                    grupo.color_hex = color_hex
                grupo.save()

        # Crear el horario
        horario = Horario.objects.create(
            grupo_materia=grupo,
            aula=aula,
            dia_semana=dia_semana,
            hora_inicio=hora_inicio,
            hora_fin=hora_fin
        )
        
        serializer = HorarioReadSerializer(horario)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class HorarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Horario.objects.select_related('grupo_materia__materia__carrera', 'grupo_materia__docente', 'aula').all()
    serializer_class = HorarioSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data

        # Extraer los datos nuevos o mantener los existentes
        materia_id = data.get('materia_id', instance.grupo_materia.materia_id)
        docente_id = data.get('docente_id', instance.grupo_materia.docente_id)
        aula_id = data.get('aula_id', instance.aula_id)
        dia_semana = data.get('dia_semana', instance.dia_semana)
        hora_inicio = data.get('hora_inicio', instance.hora_inicio)
        hora_fin = data.get('hora_fin', instance.hora_fin)
        cupo_limite = int(data.get('cupo_limite', instance.grupo_materia.cupo_limite))
        nombre_grupo = data.get('nombre_grupo', instance.grupo_materia.nombre_grupo)
        gestion = data.get('gestion', instance.grupo_materia.gestion)
        color_hex = data.get('color_hex', instance.grupo_materia.color_hex)

        try:
            materia = Materia.objects.get(id=materia_id)
            docente = Docente.objects.get(id=docente_id)
            aula = Aula.objects.get(id=aula_id)
        except (Materia.DoesNotExist, Docente.DoesNotExist, Aula.DoesNotExist):
            return Response({"error": "Materia, Docente o Aula no encontrados."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Validar que el cupo no exceda la capacidad del aula
        if cupo_limite > aula.capacidad_maxima:
            return Response(
                {"error": f"El cupo ingresado ({cupo_limite}) excede la capacidad del aula {aula.nombre_aula} ({aula.capacidad_maxima})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Validar cruces de aula (excluyendo el horario actual)
        cruces_aula = Horario.objects.filter(
            aula_id=aula_id,
            grupo_materia__gestion=gestion,
            dia_semana=dia_semana,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio
        ).exclude(id=instance.id)
        
        if cruces_aula.exists():
            cruce = cruces_aula.first()
            materia_cruce = cruce.grupo_materia.materia.nombre_materia
            carrera_cruce = cruce.grupo_materia.materia.carrera.nombre_carrera
            semestre_cruce = cruce.grupo_materia.materia.periodo_materia
            h_ini = cruce.hora_inicio.strftime('%H:%M') if hasattr(cruce.hora_inicio, 'strftime') else cruce.hora_inicio
            h_fin = cruce.hora_fin.strftime('%H:%M') if hasattr(cruce.hora_fin, 'strftime') else cruce.hora_fin
            return Response(
                {"error": f"El aula {aula.nombre_aula} ya está ocupada por la carrera '{carrera_cruce}' (Materia: '{materia_cruce}', Semestre: {semestre_cruce}°) ({dia_semana} de {h_ini} a {h_fin})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Validar cruces del docente (excluyendo el horario actual)
        grupos_docente_ids = GrupoMateria.objects.filter(docente=docente, gestion=gestion).values_list('id', flat=True)
        cruces_docente = Horario.objects.filter(
            grupo_materia_id__in=grupos_docente_ids,
            dia_semana=dia_semana,
            hora_inicio__lt=hora_fin,
            hora_fin__gt=hora_inicio
        ).exclude(id=instance.id)
        
        if cruces_docente.exists():
            cruce = cruces_docente.first()
            materia_cruce = cruce.grupo_materia.materia.nombre_materia
            h_ini = cruce.hora_inicio.strftime('%H:%M') if hasattr(cruce.hora_inicio, 'strftime') else cruce.hora_inicio
            h_fin = cruce.hora_fin.strftime('%H:%M') if hasattr(cruce.hora_fin, 'strftime') else cruce.hora_fin
            return Response(
                {"error": f"El docente {docente.nombre_docente} ya tiene la clase '{materia_cruce}' ({dia_semana} de {h_ini} a {h_fin})."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Actualizar grupo o crear uno nuevo si es necesario
        grupo, created = GrupoMateria.objects.get_or_create(
            materia=materia,
            docente=docente,
            nombre_grupo=nombre_grupo,
            gestion=gestion,
            defaults={'cupo_limite': cupo_limite, 'color_hex': color_hex}
        )
        if not created:
            if grupo.cupo_limite != cupo_limite or ('color_hex' in data and grupo.color_hex != color_hex):
                grupo.cupo_limite = cupo_limite
                if 'color_hex' in data:
                    grupo.color_hex = color_hex
                grupo.save()

        # Actualizar la instancia
        instance.grupo_materia = grupo
        instance.aula = aula
        instance.dia_semana = dia_semana
        instance.hora_inicio = hora_inicio
        instance.hora_fin = hora_fin
        instance.save()

        serializer = HorarioReadSerializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GrupoMateriaUpdateView(APIView):
    def patch(self, request, pk):
        try:
            grupo = GrupoMateria.objects.get(id=pk)
            nuevo_grupo = request.data.get('nombre_grupo')
            if nuevo_grupo:
                grupo.nombre_grupo = nuevo_grupo
                grupo.save()
                return Response({"message": "Grupo actualizado exitosamente"}, status=status.HTTP_200_OK)
            return Response({"error": "No se proporcionó nombre_grupo"}, status=status.HTTP_400_BAD_REQUEST)
        except GrupoMateria.DoesNotExist:
            return Response({"error": "GrupoMateria no encontrado"}, status=status.HTTP_404_NOT_FOUND)
