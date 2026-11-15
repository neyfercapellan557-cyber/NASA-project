import json
import unittest
from unittest.mock import patch

from app.main import get_model_status
from app.services.llm_service import generate_response


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class LlmServiceTests(unittest.TestCase):
    @patch("app.main.urlopen")
    @patch("app.main.LLM_PROVIDER", "openai-compatible")
    @patch("app.main.LLM_BASE_URL", "https://api.example.test/v1")
    @patch("app.main.LLM_API_KEY", "server-secret")
    @patch("app.main.MODEL", "test-model")
    def test_external_provider_status_checks_model_with_server_key(
        self, mock_urlopen
    ):
        mock_urlopen.return_value = FakeResponse({
            "data": [{"id": "test-model"}],
        })

        result = get_model_status()

        self.assertTrue(result["available"])
        self.assertEqual(result["provider"], "OpenAI-compatible")
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.example.test/v1/models")
        self.assertEqual(
            request.get_header("Authorization"),
            "Bearer server-secret",
        )

    @patch("app.services.llm_service.urlopen")
    @patch("app.services.llm_service.LLM_PROVIDER", "openai-compatible")
    @patch("app.services.llm_service.LLM_BASE_URL", "https://api.example.test/v1")
    @patch("app.services.llm_service.LLM_API_KEY", "server-secret")
    @patch("app.services.llm_service.MODEL", "test-model")
    def test_openai_compatible_provider_sends_server_key_and_returns_content(
        self, mock_urlopen
    ):
        mock_urlopen.return_value = FakeResponse({
            "choices": [{"message": {"content": "  A response.  "}}],
        })

        result = generate_response("Hello")

        self.assertEqual(result, "A response.")
        request = mock_urlopen.call_args.args[0]
        self.assertEqual(
            request.full_url,
            "https://api.example.test/v1/chat/completions",
        )
        self.assertEqual(
            request.get_header("Authorization"),
            "Bearer server-secret",
        )
        self.assertEqual(
            json.loads(request.data),
            {
                "model": "test-model",
                "messages": [{"role": "user", "content": "Hello"}],
                "stream": False,
            },
        )

    @patch("app.services.llm_service.LLM_PROVIDER", "openai-compatible")
    @patch("app.services.llm_service.LLM_BASE_URL", "https://api.example.test/v1")
    @patch("app.services.llm_service.LLM_API_KEY", "")
    def test_openai_compatible_provider_requires_a_server_key(self):
        with self.assertRaisesRegex(RuntimeError, "LLM_API_KEY"):
            generate_response("Hello")


if __name__ == "__main__":
    unittest.main()
