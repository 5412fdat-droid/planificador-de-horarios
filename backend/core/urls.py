from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, NoticiaViewSet, SimulacionAPIView

router = DefaultRouter()
router.register(r'noticias', NoticiaViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('simulaciones/', SimulacionAPIView.as_view(), name='simulaciones'),
    path('', include(router.urls)),
]
