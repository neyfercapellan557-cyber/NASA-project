import json
import unittest
from unittest.mock import patch
from urllib.error import URLError

from app.services.crossref import CrossrefUnavailableError, search_crossref


class FakeResponse:
    def __init__(self, payload: dict):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        return not any(exc_info)

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class CrossrefSearchTests(unittest.TestCase):
    @patch("app.services.crossref.urlopen")
    def test_normalizes_crossref_bibliographic_fields(self, mock_urlopen):
        mock_urlopen.return_value = FakeResponse({
            "message": {
                "items": [{
                    "DOI": "10.1234/ignis.example",
                    "title": ["Combustion in reduced gravity"],
                    "author": [{"given": "S. A.", "family": "Gokoglu"}],
                    "published": {"date-parts": [[2015, 6, 1]]},
                    "container-title": ["NASA Technical Reports Server"],
                    "URL": "https://doi.org/10.1234/ignis.example",
                }]
            }
        })

        result = search_crossref("combustion in reduced gravity", rows=3)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "Combustion in reduced gravity")
        self.assertEqual(result[0]["authors"], ["S. A. Gokoglu"])
        self.assertEqual(result[0]["year"], 2015)
        self.assertEqual(result[0]["journal"], "NASA Technical Reports Server")
        self.assertEqual(result[0]["doi"], "10.1234/ignis.example")
        self.assertEqual(result[0]["source"], "Crossref")
        self.assertIn("query.bibliographic=", mock_urlopen.call_args.args[0].full_url)

    @patch("app.services.crossref.urlopen", side_effect=URLError("offline"))
    def test_network_failure_is_explicit(self, mock_urlopen):
        with self.assertRaisesRegex(
            CrossrefUnavailableError,
            "La biblioteca local sigue disponible",
        ):
            search_crossref("flame safety")
        mock_urlopen.assert_called_once()


if __name__ == "__main__":
    unittest.main()
