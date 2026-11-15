import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app
from app.services.crossref import CrossrefUnavailableError


class FakeCollection:
    name = "flame_in_freefall"

    def count(self):
        return 2

    def get(self, include):
        self.include = include
        return {
            "metadatas": [
                {"source": "paper-a.pdf", "page": 1, "chunk": 0},
                {"source": "paper-b.pdf", "page": 2, "chunk": 0},
            ]
        }

    def query(self, query_texts, n_results, include):
        self.last_query = query_texts
        self.last_limit = n_results
        self.last_include = include
        return {
            "documents": [["Retrieved local evidence excerpt."]],
            "metadatas": [[{"source": "paper-a.pdf", "page": 1}]],
        }


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_vite_5175_origin_is_allowed(self):
        response = self.client.options(
            "/api/status",
            headers={
                "Origin": "http://localhost:5175",
                "Access-Control-Request-Method": "GET",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers.get("access-control-allow-origin"),
            "http://localhost:5175",
        )

    @patch("app.main.get_collection", return_value=FakeCollection())
    @patch("app.main.get_model_status", return_value={
        "status": "online",
        "available": True,
        "provider": "Ollama",
        "model": "llama3.2:3b",
        "error": None,
    })
    def test_status_uses_live_collection_counts(self, mock_model, mock_collection):
        response = self.client.get("/api/status")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["knowledge_base"]["documents"], 2)
        self.assertEqual(response.json()["knowledge_base"]["chunks"], 2)
        self.assertEqual(response.json()["ai"]["model"], "llama3.2:3b")
        mock_model.assert_called_once()
        mock_collection.assert_called_once()

    @patch("app.main.get_collection", return_value=FakeCollection())
    def test_local_content_search_returns_source_and_page(self, mock_collection):
        response = self.client.get("/api/documents/search?q=flame%20transport")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["results"][0]["source"], "paper-a.pdf")
        self.assertEqual(response.json()["results"][0]["page"], 1)
        self.assertIn("excerpt", response.json()["results"][0])
        self.assertEqual(mock_collection.return_value.last_query, ["flame transport"])

    @patch("app.main.search_crossref", return_value=[{
        "title": "A study",
        "authors": [],
        "year": None,
        "journal": None,
        "doi": "10.1234/example",
        "url": "https://doi.org/10.1234/example",
        "publisher": None,
        "source": "Crossref",
    }])
    def test_crossref_search_returns_external_records(self, mock_search):
        response = self.client.get("/api/research/crossref?q=flame%20safety")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["source"], "Crossref")
        self.assertEqual(response.json()["results"][0]["doi"], "10.1234/example")
        mock_search.assert_called_once_with("flame safety", rows=10)

    @patch(
        "app.main.search_crossref",
        side_effect=CrossrefUnavailableError("Crossref unavailable."),
    )
    def test_crossref_failure_is_a_gateway_error(self, mock_search):
        response = self.client.get("/api/research/crossref?q=flame%20safety")

        self.assertEqual(response.status_code, 502)
        self.assertIn("Crossref unavailable", response.json()["detail"])
        mock_search.assert_called_once()

    @patch("app.main.answer_question", return_value={
        "answer": "Grounded response.",
        "sources": [{"source": "paper-a.pdf", "page": 1}],
        "evidence": [{
            "source": "paper-a.pdf",
            "page": 1,
            "excerpt": "Evidence excerpt.",
        }],
        "insufficient_evidence": False,
        "response_mode": "research",
    })
    def test_chat_keeps_rag_answer_and_exposes_evidence(self, mock_answer):
        response = self.client.post(
            "/api/chat",
            json={"question": "What does this source report?"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["answer"], "Grounded response.")
        self.assertEqual(response.json()["evidence"][0]["page"], 1)
        mock_answer.assert_called_once_with("What does this source report?")


if __name__ == "__main__":
    unittest.main()
