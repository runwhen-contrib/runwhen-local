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


def _encode_jwt(claims: dict) -> str:
    header = base64.urlsafe_b64encode(json.dumps({"alg": "none"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip("=")
    return f"{header}.{payload}.signature"


def _make_sa_jwt(service_account_name: str = "workspace-builder") -> str:
    """Legacy non-expiring token: flat service-account.name claim."""
    return _encode_jwt(
        {"kubernetes.io/serviceaccount/service-account.name": service_account_name}
    )


def _make_bound_sa_jwt(
    service_account_name: str = "workspace-builder",
    namespace: str = "runwhen-local",
) -> str:
    """Modern bound/projected token: nested kubernetes.io claim + sub."""
    return _encode_jwt(
        {
            "sub": f"system:serviceaccount:{namespace}:{service_account_name}",
            "kubernetes.io": {
                "namespace": namespace,
                "serviceaccount": {"name": service_account_name, "uid": "abc-123"},
                "pod": {"name": "wb-0", "uid": "def-456"},
            },
        }
    )


def _make_subject_only_jwt(
    service_account_name: str = "workspace-builder",
    namespace: str = "runwhen-local",
) -> str:
    """Token carrying only the standard subject claim."""
    return _encode_jwt({"sub": f"system:serviceaccount:{namespace}:{service_account_name}"})


class KubeconfigAuthTest(unittest.TestCase):
    @patch("run._projected_service_account_token", return_value=_make_sa_jwt())
    def test_service_account_name_from_projected_token(self, _mock_token):
        self.assertEqual(
            _service_account_name_from_projected_token(),
            "workspace-builder",
        )

    @patch("run._projected_service_account_token", return_value=_make_bound_sa_jwt())
    def test_service_account_name_from_bound_projected_token(self, _mock_token):
        self.assertEqual(
            _service_account_name_from_projected_token(),
            "workspace-builder",
        )

    @patch("run._projected_service_account_token", return_value=_make_subject_only_jwt())
    def test_service_account_name_from_subject_claim(self, _mock_token):
        self.assertEqual(
            _service_account_name_from_projected_token(),
            "workspace-builder",
        )

    @patch("run._projected_service_account_token", return_value=_encode_jwt({"aud": ["x"]}))
    def test_service_account_name_missing_raises(self, _mock_token):
        with self.assertRaises(ValueError):
            _service_account_name_from_projected_token()

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

    @patch("run._projected_service_account_token", return_value="projected-token")
    @patch(
        "run._service_account_name_for_kubeconfig_secret",
        side_effect=ValueError("projected service account token is missing service-account.name claim"),
    )
    def test_resolve_kubeconfig_token_falls_back_when_sa_name_unresolvable(
        self, _mock_sa, _mock_projected
    ):
        # Regression: a failure to determine the SA name must not crash
        # discovery -- it must fall back to the projected pod token.
        self.assertEqual(
            _resolve_kubeconfig_token("runwhen-local", True),
            "projected-token",
        )


if __name__ == "__main__":
    unittest.main()
