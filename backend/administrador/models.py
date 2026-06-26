from django.db import models

class Carrera(models.Model):
    nombre_carrera = models.CharField(max_length=255)
    sigla_carrera = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'core_carrera' # Mapeo a la BD original

    def __str__(self):
        return self.nombre_carrera

class Docente(models.Model):
    codigo_docente = models.CharField(max_length=50, unique=True)
    nombre_docente = models.CharField(max_length=255)

    class Meta:
        db_table = 'core_docente'

    def __str__(self):
        return self.nombre_docente

class Aula(models.Model):
    nombre_aula = models.CharField(max_length=100)
    capacidad_maxima = models.IntegerField()

    class Meta:
        db_table = 'core_aula'

    def __str__(self):
        return self.nombre_aula

class Materia(models.Model):
    carrera = models.ForeignKey(Carrera, on_delete=models.CASCADE)
    nombre_materia = models.CharField(max_length=255)
    sigla_materia = models.CharField(max_length=20)
    credito_materia = models.IntegerField(default=0) # Ahora opcional inicialmente
    periodo_materia = models.CharField(max_length=50, null=True, blank=True) # Ej: 1
    ht = models.IntegerField(default=0)
    hp = models.IntegerField(default=0)
    es_electiva = models.BooleanField(default=False)
    tipo_materia = models.CharField(max_length=50, default='Normal')
    requisito_texto = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'core_materia'
        unique_together = ('sigla_materia', 'carrera')

    def __str__(self):
        return f"{self.sigla_materia} - {self.nombre_materia}"

class Prerrequisito(models.Model):
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name='prerrequisitos')
    materia_requerida = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name='es_prerrequisito_de')

    class Meta:
        db_table = 'core_prerrequisito'

    def __str__(self):
        return f"{self.materia.sigla_materia} requiere {self.materia_requerida.sigla_materia}"

class GrupoMateria(models.Model):
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE)
    docente = models.ForeignKey(Docente, on_delete=models.SET_NULL, null=True)
    nombre_grupo = models.CharField(max_length=50)
    gestion = models.CharField(max_length=20)
    cupo_limite = models.IntegerField()
    color_hex = models.CharField(max_length=7, default='#3b82f6')

    class Meta:
        db_table = 'core_grupomateria'

    def __str__(self):
        return f"{self.materia.sigla_materia} - Grupo {self.nombre_grupo}"

class Horario(models.Model):
    grupo_materia = models.ForeignKey(GrupoMateria, on_delete=models.CASCADE)
    aula = models.ForeignKey(Aula, on_delete=models.SET_NULL, null=True)
    dia_semana = models.CharField(max_length=20)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        db_table = 'core_horario'

    def __str__(self):
        return f"{self.dia_semana} {self.hora_inicio} - {self.hora_fin}"
