import jwt
import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.db.models import Q
from .models import Usuario, Estudiante, Noticia
from .serializers import UsuarioSerializer, NoticiaSerializer

class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticia.objects.all().order_by('-fecha_publicacion')
    serializer_class = NoticiaSerializer

class LoginView(APIView):
    def post(self, request):
        registro = request.data.get('registro')
        password = request.data.get('password')

        if not registro or not password:
            return Response({'error': 'Registro y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = None
            try:
                # Buscamos primero si el registro coincide con el de un Estudiante
                estudiante = Estudiante.objects.get(registro=registro)
                usuario = estudiante.usuario
            except Estudiante.DoesNotExist:
                # Si no es estudiante, asumimos que puede ser correo o carnet de Admin/Operador
                usuario = Usuario.objects.get(Q(correo=registro) | Q(carnet=registro))
            
            from django.contrib.auth.hashers import check_password
            # Validación con hash seguro (check_password soporta el texto plano si el hasher aún no lo migró, 
            # pero dado que migraremos todo, check_password es la forma correcta)
            if not check_password(password, usuario.password) and usuario.password != password:
                # Fallback temporal por si alguien intenta loguear antes de correr fix_passwords
                return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
            
            if not getattr(usuario, 'is_active', True):
                return Response({'error': 'Cuenta inactiva. Contacte al administrador.'}, status=status.HTTP_403_FORBIDDEN)
            
            payload = {
                'usuario_id': usuario.id,
                'rol': usuario.rol,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
                'iat': datetime.datetime.utcnow()
            }
            # Generamos el JWT firmado con el SECRET_KEY de Django
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

            serializer = UsuarioSerializer(usuario)
            return Response({
                'token': token,
                'usuario': serializer.data
            }, status=status.HTTP_200_OK)

        except Usuario.DoesNotExist:
            return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

from .models import Simulacion, DetalleSimulacion
from administrador.models import GrupoMateria
from .serializers import SimulacionSerializer

class SimulacionAPIView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            usuario_id = payload['usuario_id']
            estudiante = Estudiante.objects.get(usuario_id=usuario_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, Estudiante.DoesNotExist):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        simulaciones = Simulacion.objects.filter(estudiante=estudiante).prefetch_related(
            'detallesimulacion_set__grupo_materia__materia__carrera',
            'detallesimulacion_set__grupo_materia__docente'
        )
        serializer = SimulacionSerializer(simulaciones, many=True)
        return Response(serializer.data)

    def post(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            usuario_id = payload['usuario_id']
            estudiante = Estudiante.objects.get(usuario_id=usuario_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, Estudiante.DoesNotExist):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        nombre_escenario = request.data.get('nombre_escenario')
        grupos = request.data.get('grupos', [])
        
        simulacion, created = Simulacion.objects.get_or_create(
            estudiante=estudiante,
            nombre_escenario=nombre_escenario
        )
        
        DetalleSimulacion.objects.filter(simulacion=simulacion).delete()
        
        # Validar choques en el backend (ISO 25010 - Adecuación Funcional)
        from administrador.models import Horario
        
        grupos_objetos = []
        for grupo_id in grupos:
            try:
                grupos_objetos.append(GrupoMateria.objects.get(id=grupo_id))
            except GrupoMateria.DoesNotExist:
                continue
                
        alertas = {g.id: 'Ninguna' for g in grupos_objetos}
        
        for i in range(len(grupos_objetos)):
            for j in range(i + 1, len(grupos_objetos)):
                grupo_a = grupos_objetos[i]
                grupo_b = grupos_objetos[j]
                
                horarios_a = Horario.objects.filter(grupo_materia=grupo_a)
                horarios_b = Horario.objects.filter(grupo_materia=grupo_b)
                
                choque = False
                for ha in horarios_a:
                    for hb in horarios_b:
                        if ha.dia_semana == hb.dia_semana:
                            # Traslape de tiempo: InicioA < FinB y FinA > InicioB
                            if ha.hora_inicio < hb.hora_fin and ha.hora_fin > hb.hora_inicio:
                                choque = True
                                break
                    if choque:
                        break
                        
                if choque:
                    alertas[grupo_a.id] = 'Roja'
                    alertas[grupo_b.id] = 'Roja'
        
        for grupo in grupos_objetos:
            DetalleSimulacion.objects.create(
                simulacion=simulacion,
                grupo_materia=grupo,
                alerta_color=alertas[grupo.id]
            )
                
        serializer = SimulacionSerializer(simulacion)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
        
        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            usuario_id = payload['usuario_id']
            estudiante = Estudiante.objects.get(usuario_id=usuario_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, Estudiante.DoesNotExist):
            return Response({'error': 'No autorizado'}, status=status.HTTP_401_UNAUTHORIZED)
            
        simulacion_id = request.data.get('simulacion_id') or request.query_params.get('simulacion_id')
        try:
            sim = Simulacion.objects.get(id=simulacion_id, estudiante=estudiante)
            sim.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Simulacion.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
