from django.db import models
from administrador.models import Carrera, GrupoMateria, Materia

class Usuario(models.Model):
    ROLES = [
        ('Administrador', 'Administrador'),
        ('Operador', 'Operador'),
        ('Estudiante', 'Estudiante'),
    ]
    nombre = models.CharField(max_length=255)
    correo = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    carnet = models.CharField(max_length=50, unique=True)
    rol = models.CharField(max_length=20, choices=ROLES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Estudiante(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE)
    registro = models.CharField(max_length=50, unique=True)
    carrera = models.ForeignKey(Carrera, on_delete=models.CASCADE)
    avance_academico = models.CharField(max_length=50) # Ej: 50%
    malla_intuitiva = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.registro} - {self.usuario.nombre}"

class Simulacion(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    nombre_escenario = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sim: {self.nombre_escenario} - {self.estudiante.registro}"

class DetalleSimulacion(models.Model):
    simulacion = models.ForeignKey(Simulacion, on_delete=models.CASCADE)
    grupo_materia = models.ForeignKey(GrupoMateria, on_delete=models.CASCADE)
    alerta_color = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.simulacion} -> {self.grupo_materia} ({self.alerta_color})"

class HistorialAcademico(models.Model):
    ESTADOS = [
        ('Aprobada', 'Aprobada'),
        ('Reprobada', 'Reprobada'),
    ]
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    gestion = models.CharField(max_length=20)
    nota = models.DecimalField(max_digits=5, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS)

    def __str__(self):
        return f"{self.estudiante.registro} - {self.materia.sigla_materia}: {self.nota}"

class Noticia(models.Model):
    titulo = models.CharField(max_length=255)
    extracto = models.CharField(max_length=500)
    contenido = models.TextField()
    categoria = models.CharField(max_length=100)
    color_categoria = models.CharField(max_length=50) # e.g. blue, red, amber
    imagen_url = models.CharField(max_length=500, blank=True, null=True)
    fecha_publicacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

class Inscripcion(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    grupo = models.CharField(max_length=50, default='VA')
    modalidad = models.CharField(max_length=100, default='PRESENCIAL')
    horario = models.CharField(max_length=255, default='Lu 07:00-09:15 | Mi 09:15-11:30')
    gestion = models.CharField(max_length=20, default='1-2026')

    def __str__(self):
        return f"{self.estudiante.registro} - {self.materia.sigla_materia} ({self.grupo})"
