import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from app.services.ingestion import ingest_documents


class FakeCollection:
    def __init__(self, sources=()):
        self.sources = set(sources)
        self.upserts = []

    def get(self, where, include):
        source = where["source"]
        return {
            "metadatas": [{"source": source}] if source in self.sources else []
        }

    def upsert(self, documents, metadatas, ids):
        self.upserts.append({
            "documents": documents,
            "metadatas": metadatas,
            "ids": ids,
        })
        self.sources.update(item["source"] for item in metadatas)

    def count(self):
        return sum(len(upsert["ids"]) for upsert in self.upserts)


class IngestionTests(unittest.TestCase):
    @patch("app.services.ingestion.get_collection")
    @patch("app.services.ingestion.process_pdf")
    def test_indexes_only_unindexed_source(self, mock_process_pdf, mock_get):
        collection = FakeCollection()
        mock_get.return_value = collection
        mock_process_pdf.return_value = [
            {"text": "First extractable passage.", "page": 1, "chunk": 0},
            {"text": "Second extractable passage.", "page": 2, "chunk": 0},
        ]

        with tempfile.TemporaryDirectory() as directory:
            documents_dir = Path(directory)
            source = documents_dir / "new-report.pdf"
            source.write_bytes(b"%PDF")
            with patch("app.services.ingestion.DOCUMENTS_DIR", documents_dir):
                result = ingest_documents([source])

        self.assertEqual(result["processed"], ["new-report.pdf"])
        self.assertEqual(result["chunks_added"], 2)
        self.assertEqual(collection.upserts[0]["ids"], [
            "new-report_p1_c0",
            "new-report_p2_c0",
        ])
        self.assertEqual(
            collection.upserts[0]["metadatas"][0]["source"],
            "new-report.pdf",
        )

    @patch("app.services.ingestion.get_collection")
    @patch("app.services.ingestion.process_pdf")
    def test_skips_existing_source_without_reprocessing(
        self, mock_process_pdf, mock_get
    ):
        collection = FakeCollection(["already-indexed.pdf"])
        mock_get.return_value = collection

        with tempfile.TemporaryDirectory() as directory:
            documents_dir = Path(directory)
            source = documents_dir / "already-indexed.pdf"
            source.write_bytes(b"%PDF")
            with patch("app.services.ingestion.DOCUMENTS_DIR", documents_dir):
                result = ingest_documents([source])

        self.assertEqual(result["skipped"], ["already-indexed.pdf"])
        self.assertEqual(result["chunks_added"], 0)
        mock_process_pdf.assert_not_called()


if __name__ == "__main__":
    unittest.main()
