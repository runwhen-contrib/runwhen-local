from component import Component, Setting
from outputter import DirectoryItem
from typing import Optional
from dataclasses import dataclass


class InfoResult:
    """
    Model for the return data for the /info REST endpoint
    """
    version: str
    description: str
    indexers: list[Component]
    enrichers: list[Component]
    renderers: list[Component]
    settings: list[Setting]

    def __init__(self,
                 version: str,
                 description: str,
                 indexers: list[Component],
                 enrichers: list[Component],
                 renderers: list[Component],
                 settings: list[Setting]):
        self.version = version
        self.description = description
        self.indexers = indexers
        self.enrichers = enrichers
        self.renderers = renderers
        self.settings = settings


class CommonRunResult:
    """
    Common data for results from the /run endpoint.
    """
    message: str
    warnings: list[str]
    output_type: str

    def __init__(self, message: str, warnings: list[str], output_type: str):
        self.message = message
        self.warnings = warnings
        self.output_type = output_type


class ArchiveRunResult(CommonRunResult):
    """
    Model for the result variant for the /run endpoint that returns
    the output data as a single archive.
    """
    output: bytes

    def __init__(self, message: str, warnings: list[str], output: bytes):
        super().__init__(message, warnings, "archive")
        self.output = output


class FileItemRunResult(CommonRunResult):
    """
    Model for the result variant for the /run endpoint that returns
    the output data as a hierarchy of individual file items.
    """
    output: DirectoryItem

    def __init__(self, message: str, warnings: list[str], output: DirectoryItem):
        super().__init__(message, warnings, "file-items")
        self.output = output


@dataclass
class HealthResult:
    """
    Result from the /health endpoint.
    """
    status: str
    service_start_time: str
    uptime_seconds: float
    last_run_start: Optional[str] = None
    last_run_end: Optional[str] = None
    last_run_status: Optional[str] = None
    last_run_error: Optional[str] = None
    last_run_warnings_count: Optional[int] = None
    last_run_components: Optional[list] = None
    last_run_parsing_errors_count: Optional[int] = None
    current_stage: Optional[str] = None
    current_component: Optional[str] = None
    is_healthy: bool = True
    is_ready: bool = True


# Also, does it make sense to have a run result variant that corresponds
# to the outputter that writes the files to the file system? This would
# imply that the service is being run in a context/container that's
# configured with a shared volume that's accessible by the caller, which
# is certainly feasible in at least some deployment scenarios.
# But I'm not sure what this really buys us, except for maybe a little
# performance improvement from avoiding the serialization/transmission
# of the data between the service and the caller, which I don't think
# is really an issue, since this is currently a relatively infrequent
# operation. So to keep things simple I think we just don't support that.
