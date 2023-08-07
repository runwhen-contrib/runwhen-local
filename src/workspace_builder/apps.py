from django.apps import AppConfig
from component import init_components

class WorkspaceBuilderConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'workspace_builder'

    def ready(self):
        init_components()
