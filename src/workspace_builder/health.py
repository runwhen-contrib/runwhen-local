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
    warnings_count: int = 0
    components_run: list = None
    parsing_errors_count: int = 0
    current_stage: Optional[str] = None
    current_component: Optional[str] = None
    
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
    """Singleton class to track health status across the application."""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._service_start_time = datetime.now(timezone.utc)
            self._current_run: Optional[RunInfo] = None
            self._last_completed_run: Optional[RunInfo] = None
            self._service_status = HealthStatus.HEALTHY
            self._health_file_path = "/shared/health_status.json"
            self._initialized = True
            
            # Load previous health state if it exists
            self._load_health_state()
    
    def _load_health_state(self):
        """Load health state from persistent storage."""
        try:
            if os.path.exists(self._health_file_path):
                with open(self._health_file_path, 'r') as f:
                    data = json.load(f)
                    
                # Only restore last completed run, not in-progress runs
                if data.get('last_run') and data['last_run'].get('status') != HealthStatus.RUNNING.value:
                    self._last_completed_run = RunInfo(**data['last_run'])
                    
        except Exception as e:
            # If we can't load health state, just start fresh
            print(f"Warning: Could not load health state: {e}")
    
    def _save_health_state(self):
        """Save health state to persistent storage."""
        try:
            os.makedirs(os.path.dirname(self._health_file_path), exist_ok=True)
            
            health_info = self.get_health_info()
            with open(self._health_file_path, 'w') as f:
                json.dump(health_info.to_dict(), f, indent=2)
                
        except Exception as e:
            print(f"Warning: Could not save health state: {e}")
    
    def start_run(self, components: list) -> None:
        """Mark the start of a new run."""
        with self._lock:
            self._current_run = RunInfo(
                start_time=datetime.now(timezone.utc).isoformat(),
                components_run=[comp.name for comp in components],
                status=HealthStatus.RUNNING.value
            )
            self._service_status = HealthStatus.RUNNING
            self._save_health_state()
    
    def complete_run(self, warnings: list = None, error: Exception = None, 
                    parsing_errors_count: int = 0) -> None:
        """Mark the completion of a run."""
        with self._lock:
            if self._current_run:
                self._current_run.end_time = datetime.now(timezone.utc).isoformat()
                self._current_run.warnings_count = len(warnings) if warnings else 0
                self._current_run.parsing_errors_count = parsing_errors_count
                
                if error:
                    self._current_run.status = HealthStatus.ERROR.value
                    self._current_run.error_message = str(error)
                    self._service_status = HealthStatus.ERROR
                else:
                    self._current_run.status = HealthStatus.HEALTHY.value
                    self._service_status = HealthStatus.HEALTHY
                
                # Move current run to last completed run
                self._last_completed_run = self._current_run
                self._current_run = None
                
                self._save_health_state()
    
    def fail_run(self, error: Exception) -> None:
        """Mark a run as failed."""
        self.complete_run(error=error)
    
    def add_parsing_errors(self, count: int) -> None:
        """Add parsing error count to current run."""
        with self._lock:
            if self._current_run:
                self._current_run.parsing_errors_count += count
    
    def update_stage(self, stage: str, component: str = None) -> None:
        """Update the current stage and component being processed."""
        with self._lock:
            if self._current_run:
                self._current_run.current_stage = stage
                self._current_run.current_component = component
                self._save_health_state()
    
    def get_health_info(self) -> HealthInfo:
        """Get current health information."""
        with self._lock:
            uptime = (datetime.now(timezone.utc) - self._service_start_time).total_seconds()
            
            # Determine which run to report
            current_run = self._current_run or self._last_completed_run
            
            return HealthInfo(
                service_status=self._service_status.value,
                service_start_time=self._service_start_time.isoformat(),
                last_run=current_run,
                uptime_seconds=uptime
            )
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy for liveness probe."""
        with self._lock:
            # Service is healthy if:
            # 1. No current error status
            # 2. If there's a current run, it's not stuck (< 30 minutes)
            
            if self._service_status == HealthStatus.ERROR:
                return False
            
            if self._current_run:
                # Check if run has been going for more than 30 minutes
                start_time = datetime.fromisoformat(self._current_run.start_time.replace('Z', '+00:00'))
                elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
                if elapsed > 1800:  # 30 minutes
                    return False
            
            return True
    
    def is_ready(self) -> bool:
        """Check if the service is ready for readiness probe."""
        with self._lock:
            # Service is ready if it's not currently running a job
            return self._current_run is None


# Global health tracker instance
health_tracker = HealthTracker()
