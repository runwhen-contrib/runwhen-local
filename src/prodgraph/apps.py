from django.apps import AppConfig
from component import init_components

class ProdgraphConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'prodgraph'

    def ready(self):
        init_components()
