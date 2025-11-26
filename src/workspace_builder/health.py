"""
Health status tracking for workspace builder.
Provides liveness and readiness checks for monitoring.
"""

import json
import os
import threading
import time
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from enum import Enum


class HealthStatus(Enum):
    """Health status enumeration."""
    HEALTHY = "healthy"
    RUNNING = "running" 
    ERROR = "error"
    UNKNOWN = "unknown"


@dataclass
class RunInfo:
    """Information about a workspace builder run."""
    start_time: str
    end_time: Optional[str] = None
    status: str = HealthStatus.RUNNING.value
    error_message: Optional[str] = None
    stacktrace: Optional[str] = None
    warnings_count: int = 0
    components_run: list = None
    parsing_errors_count: int = 0
    current_stage: Optional[str] = None
    current_component: Optional[str] = None
    slx_count: Optional[int] = None
    duration_seconds: Optional[float] = None
    
    def __post_init__(self):
        if self.components_run is None:
            self.components_run = []


@dataclass 
class HealthInfo:
    """Complete health information for the service."""
    service_status: str = HealthStatus.HEALTHY.value
    service_start_time: str = ""
    last_run: Optional[RunInfo] = None
    uptime_seconds: float = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        result = asdict(self)
        if self.last_run:
            result['last_run'] = asdict(self.last_run)
        return result


class HealthTracker:
    """Simple health tracker without complex threading - uses file-based state."""
    
    def __init__(self):
        self._service_start_time = datetime.now(timezone.utc)
        self._health_file_path = "/tmp/health_status.json"
        self._lock = threading.Lock()  # Simple lock for file operations only
    
    def _read_state(self) -> dict:
        """Read health state from file."""
        with self._lock:
            try:
                if os.path.exists(self._health_file_path):
                    with open(self._health_file_path, 'r') as f:
                        return json.load(f)
            except Exception:
                pass
            return {}
    
    def _write_state(self, state: dict):
        """Write health state to file."""
        with self._lock:
            try:
                with open(self._health_file_path, 'w') as f:
                    json.dump(state, f, indent=2)
            except Exception as e:
                print(f"Warning: Could not save health state: {e}")
    
    def start_run(self, components: list) -> None:
        """Mark the start of a new run."""
        state = {
            'service_start_time': self._service_start_time.isoformat(),
            'service_status': HealthStatus.RUNNING.value,
            'current_run': {
                'start_time': datetime.now(timezone.utc).isoformat(),
                'end_time': None,
                'status': HealthStatus.RUNNING.value,
                'error_message': None,
                'stacktrace': None,
                'warnings_count': 0,
                'components_run': [comp.name for comp in components],
                'parsing_errors_count': 0,
                'current_stage': None,
                'current_component': None,
                'slx_count': None,
                'duration_seconds': None,
            }
        }
        self._write_state(state)
    
    def complete_run(self, warnings: list = None, error: Exception = None, 
                    stacktrace: str = None, parsing_errors_count: int = 0, slx_count: int = None) -> None:
        """Mark the completion of a run."""
        state = self._read_state()
        if state.get('current_run'):
            end_time = datetime.now(timezone.utc).isoformat()
            state['current_run']['end_time'] = end_time
            state['current_run']['warnings_count'] = len(warnings) if warnings else 0
            state['current_run']['parsing_errors_count'] = parsing_errors_count
            
            # Calculate duration
            try:
                start = datetime.fromisoformat(state['current_run']['start_time'].replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                state['current_run']['duration_seconds'] = (end - start).total_seconds()
            except Exception:
                state['current_run']['duration_seconds'] = None
            
            if slx_count is not None:
                state['current_run']['slx_count'] = slx_count
            
            if error:
                state['current_run']['status'] = HealthStatus.ERROR.value
                state['current_run']['error_message'] = str(error)
                if stacktrace:
                    state['current_run']['stacktrace'] = stacktrace
                state['service_status'] = HealthStatus.ERROR.value
            else:
                state['current_run']['status'] = 'completed'  # Use 'completed' instead of 'healthy' for finished runs
                state['service_status'] = HealthStatus.HEALTHY.value
            
            # Move to last_run
            state['last_run'] = state['current_run']
            state['current_run'] = None
            
            self._write_state(state)
    
    def fail_run(self, error: Exception, stacktrace: str = None) -> None:
        """Mark a run as failed."""
        self.complete_run(error=error, stacktrace=stacktrace)
    
    def add_parsing_errors(self, count: int) -> None:
        """Add parsing error count to current run."""
        state = self._read_state()
        if state.get('current_run'):
            state['current_run']['parsing_errors_count'] = state['current_run'].get('parsing_errors_count', 0) + count
            self._write_state(state)
    
    def update_stage(self, stage: str, component: str = None) -> None:
        """Update the current stage and component being processed."""
        state = self._read_state()
        if state.get('current_run'):
            state['current_run']['current_stage'] = stage
            state['current_run']['current_component'] = component
            self._write_state(state)
    
    def get_health_info(self) -> HealthInfo:
        """Get current health information."""
        state = self._read_state()
        uptime = (datetime.now(timezone.utc) - self._service_start_time).total_seconds()
        
        # Get current or last run
        run_data = state.get('current_run') or state.get('last_run')
        last_run = RunInfo(**run_data) if run_data else None
        
        return HealthInfo(
            service_status=state.get('service_status', HealthStatus.HEALTHY.value),
            service_start_time=self._service_start_time.isoformat(),
            last_run=last_run,
            uptime_seconds=uptime
        )
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy for liveness probe."""
        state = self._read_state()
        
        # Service is healthy if:
        # 1. No current error status
        # 2. If there's a current run, it's not stuck (< 30 minutes)
        
        if state.get('service_status') == HealthStatus.ERROR.value:
            return False
        
        current_run = state.get('current_run')
        if current_run and current_run.get('start_time'):
            # Check if run has been going for more than 30 minutes
            try:
                start_time = datetime.fromisoformat(current_run['start_time'].replace('Z', '+00:00'))
                elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
                if elapsed > 1800:  # 30 minutes
                    return False
            except Exception:
                pass
        
        return True
    
    def is_ready(self) -> bool:
        """Check if the service is ready for readiness probe."""
        state = self._read_state()
        # Service is ready if it's not currently running a job
        return state.get('current_run') is None


# Simple function to get health tracker - creates new instance each time
# State is maintained in file, so no need for singleton
def get_health_tracker():
    """Get a health tracker instance."""
    return HealthTracker()
