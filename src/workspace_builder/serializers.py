from base64 import b64encode

from rest_framework import serializers
from outputter import OutputItem, FileItem, DirectoryItem


class OmitEmptyFieldsSerializer(serializers.Serializer):
    """
    Serializer that omits empty fields (either None or empty lists or
    dictionaries) from the serialization.
    FIXME: I think this will currently prune all scalar values that
    evaluate to False, e.g. also boolean and numerical values, which
    may not always be desirable. It's not an issue in the current
    context, because there are no values like that, but could be
    an issue if this is copied/reused in other contexts. Could
    potentially accept some arguments in __init__ that allow
    more fine-grained control over which fields are pruned.
    """
    def to_representation(self, instance):
        result = super().to_representation(instance)
        return {k: v for (k, v) in result.items() if v}


class ComponentSerializer(OmitEmptyFieldsSerializer):
    name = serializers.CharField()
    documentation = serializers.CharField()


class SettingSerializer(OmitEmptyFieldsSerializer):
    name = serializers.CharField()
    type = serializers.CharField()
    defaultValue = serializers.CharField(source="default_value")
    documentation = serializers.CharField()


class InfoResultSerializer(serializers.Serializer):
    version = serializers.CharField()
    description = serializers.CharField()
    indexers = ComponentSerializer(many=True)
    enrichers = ComponentSerializer(many=True)
    renderers = ComponentSerializer(many=True)
    settings = SettingSerializer(many=True)


class BytesField(serializers.Serializer):
    """
    Serializer that converts binary data to its base64 representation,
    so we can return it as a string value in the JSON response.
    """
    def to_representation(self, value: bytes) -> str:
        return b64encode(value).decode('utf-8')


class DirectoryChildrenField(serializers.Serializer):
    @staticmethod
    def serialize_child(value: [FileItem, DirectoryItem]):
        if value.type == OutputItem.Type.FILE:
            serializer = FileItemSerializer
        elif value.type == OutputItem.Type.DIRECTORY:
            serializer = DirectoryItemSerializer
        else:
            raise Exception(f"Invalid result type: {value.type}")
        return serializer(value).data

    def to_representation(self, children: dict[str, [FileItem, DirectoryItem]]):
        converted_children = {k: self.serialize_child(v) for (k, v) in children.items()}
        return converted_children


class CommonItemSerializer(OmitEmptyFieldsSerializer):
    type = serializers.CharField()
    hexsha = serializers.CharField()


class FileItemSerializer(CommonItemSerializer):
    data = BytesField()


class DirectoryItemSerializer(CommonItemSerializer):
    children = DirectoryChildrenField()


class CommonRunResultSerializer(serializers.Serializer):
    message = serializers.CharField()
    warnings = serializers.ListField(child=serializers.CharField())
    outputType = serializers.CharField(source="output_type")


class ArchiveRunResultSerializer(CommonRunResultSerializer):
    output = BytesField()


class FileItemsRunResultSerializer(CommonRunResultSerializer):
    output = DirectoryItemSerializer()


class HealthResultSerializer(serializers.Serializer):
    status = serializers.CharField()
    service_start_time = serializers.CharField()
    uptime_seconds = serializers.FloatField()
    last_run_start = serializers.CharField(required=False, allow_null=True)
    last_run_end = serializers.CharField(required=False, allow_null=True)
    last_run_status = serializers.CharField(required=False, allow_null=True)
    last_run_error = serializers.CharField(required=False, allow_null=True)
    last_run_warnings_count = serializers.IntegerField(required=False, allow_null=True)
    last_run_components = serializers.ListField(child=serializers.CharField(), required=False, allow_null=True)
    last_run_parsing_errors_count = serializers.IntegerField(required=False, allow_null=True)
    current_stage = serializers.CharField(required=False, allow_null=True)
    current_component = serializers.CharField(required=False, allow_null=True)
    is_healthy = serializers.BooleanField()
    is_ready = serializers.BooleanField()
