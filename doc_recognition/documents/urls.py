from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_document, name='upload_document'),
    path('stats/', views.document_stats, name='document_stats'),
    path('search/', views.search_documents, name='search_documents'),
]