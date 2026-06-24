import base64
import json
import os
import sys
import unittest
from unittest.mock import patch

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
if _THIS_DIR not in sys.path:
    sys.path.insert(0, _THIS_DIR)

from run import (
    _long_lived_service_account_token,
    _service_account_name_from_projected_token,
    _service_account_name_for_kubeconfig_secret,
    _resolve_kubeconfig_token,
)


def _make_sa_jwt(service_account_name: str = "workspace-builder") -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "none"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(
        json.dumps(
            {"kubernetes.io/serviceaccount/service-account.name": service_account_name}
        ).encode()
    ).decode().rstrip("=")
    return f"{header}.{payload}.signature"


class KubeconfigAuthTest(unittest.TestCase):
    @patch("run._projected_service_account_token", return_value=_make_sa_jwt())
    def test_service_account_name_from_projected_token(self, _mock_token):
        self.assertEqual(
            _service_account_name_from_projected_token(),
            "workspace-builder",
        )

    @patch.dict("os.environ", {"RW_KUBECONFIG_SERVICE_ACCOUNT": "custom-sa"}, clear=False)
    @patch(
        "run._service_account_name_from_projected_token",
        side_effect=AssertionError("should not decode JWT when env override is set"),
    )
    def test_service_account_name_env_override(self, _mock_decode):
        self.assertEqual(_service_account_name_for_kubeconfig_secret(), "custom-sa")

    @patch("run.subprocess.run")
    def test_long_lived_service_account_token_reads_sa_secret(self, mock_run):
        mock_run.return_value.returncode = 0
        mock_run.return_value.stdout = base64.b64encode(b"long-lived-token").decode()

        token = _long_lived_service_account_token("runwhen-local", "workspace-builder")

        self.assertEqual(token, "long-lived-token")
        mock_run.assert_called_once()
        cmd = mock_run.call_args.args[0]
        self.assertEqual(cmd[2:6], ["secret", "workspace-builder-token", "--namespace", "runwhen-local"])

    @patch("run._projected_service_account_token", return_value="projected-token")
    @patch("run._long_lived_service_account_token", return_value="long-lived-token")
    @patch(
        "run._service_account_name_for_kubeconfig_secret",
        return_value="workspace-builder",
    )
    def test_resolve_kubeconfig_token_uses_long_lived_for_secret(
        self, _mock_sa, _mock_long_lived, _mock_projected
    ):
        self.assertEqual(
            _resolve_kubeconfig_token("runwhen-local", True),
            "long-lived-token",
        )

    @patch("run._projected_service_account_token", return_value="projected-token")
    def test_resolve_kubeconfig_token_uses_projected_without_secret(self, _mock_projected):
        self.assertEqual(
            _resolve_kubeconfig_token("runwhen-local", False),
            "projected-token",
        )

    @patch("run._projected_service_account_token", return_value="projected-token")
    @patch(
        "run._long_lived_service_account_token",
        side_effect=RuntimeError("secret missing"),
    )
    @patch(
        "run._service_account_name_for_kubeconfig_secret",
        return_value="workspace-builder",
    )
    def test_resolve_kubeconfig_token_falls_back_when_sa_secret_missing(
        self, _mock_sa, _mock_long_lived, _mock_projected
    ):
        self.assertEqual(
            _resolve_kubeconfig_token("runwhen-local", True),
            "projected-token",
        )


if __name__ == "__main__":
    unittest.main()
