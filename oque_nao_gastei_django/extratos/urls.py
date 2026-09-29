from django.urls import path
from . import views

app_name = 'extratos'

urlpatterns = [
    path('upload/', views.UploadExtratoView, name='upload_csv'),
    path('pdf/', views.export_pdf, name='pdf'),
    # api
    path('api/upload/', views.upload_csv_api, name='upload_csv_api'),
    path('api/gerar-graficos/', views.gerar_graficos_api, name='gerar_graficos'),
]
