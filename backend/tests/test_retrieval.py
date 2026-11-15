import unittest
from unittest.mock import patch

from app.services.retrieval import (
    has_relevant_evidence,
    is_low_quality_fragment,
    search_documents,
)


class FakeCollection:
    def __init__(self, documents):
        self.documents = documents

    def count(self):
        return len(self.documents)

    def query(self, query_texts, n_results, include, **options):
        self.last_query = query_texts
        self.last_n_results = n_results
        self.last_include = include
        self.last_options = options
        return {
            "documents": [[item[0] for item in self.documents]],
            "metadatas": [[item[1] for item in self.documents]],
            "distances": [[item[2] for item in self.documents]],
        }


class RetrievalTests(unittest.TestCase):
    def test_discards_cover_only_fragment(self):
        cover = (
            "National Aeronautics and Space Administration\n"
            "A Researcher's Guide to:\n"
            "Combustion Science"
        )

        self.assertTrue(is_low_quality_fragment(cover))

    def test_discards_thesis_cover_and_reference_pages(self):
        thesis_cover = (
            "University of South Carolina Scholar Commons Theses and "
            "Dissertations 2018 Combustion Behavior Of Sub-Millimeter "
            "Sized Oxygenated And N-Alkane Fuel Droplets "
            "Recommended Citation Alam, M. F."
        )
        references = "\n".join(
            f"[{index}] A. Author, Combustion Study, Journal, 201{index}."
            for index in range(1, 5)
        )

        self.assertTrue(is_low_quality_fragment(thesis_cover, page=2))
        self.assertTrue(is_low_quality_fragment(references, page=147))

    def test_discards_unheaded_bibliography_and_author_bio(self):
        references = (
            "S. C. Garrick. Particle coagulation in shear flows. "
            "Aerosol Science and Technology, 45, 2011.\n"
            "S. C. Garrick. Growth mechanisms in reacting flows. "
            "Journal of Nanotechnology, 2015.\n"
            "G. Mulholland and D. Urban. Pyrolysis smoke under low gravity. "
            "Aerosol Science and Technology, 2015.\n"
            "D. Urban et al. Detection of smoke from microgravity fires. "
            "SAE International, 2005."
        )
        author_bio = (
            "Contact: author@example.edu\nEducation\n"
            "University of South Carolina, Ph.D. in Mechanical Engineering\n"
            "Research Interests in combustion and particle diagnostics\n"
            "Professional Affiliation: The Combustion Institute"
        )

        self.assertTrue(is_low_quality_fragment(references, page=17))
        self.assertTrue(is_low_quality_fragment(author_bio, page=226))

    def test_discards_numbered_bibliography_fragment(self):
        bibliography = (
            "1. A. Author, Combustion Research, Journal, 2015, pp. 12-18.\n"
            "2. B. Author, Reduced Gravity Flames, NASA, 2017, vol. 2.\n"
            "3. C. Author, Flame Studies, 2019, https://example.test/paper\n"
            "4. D. Author, Microgravity Experiments, 2021, doi: 10.1234/test"
        )

        self.assertTrue(is_low_quality_fragment(bibliography))

    def test_preserves_scientific_evidence(self):
        evidence = (
            "Combustion research in reduced gravity helps investigators "
            "separate buoyancy effects from the chemical and transport "
            "processes that govern flame behavior. The observations support "
            "improved models of fire safety in spacecraft environments."
        )

        self.assertFalse(is_low_quality_fragment(evidence))

    def test_requires_most_query_terms_to_be_supported(self):
        evidence = [{
            "text": "Combustion research in reduced gravity changes flame behavior.",
        }]

        self.assertTrue(
            has_relevant_evidence(
                "combustion research in reduced gravity",
                evidence,
            )
        )
        self.assertFalse(
            has_relevant_evidence(
                "combustion research in reduced gravity chocolate cake "
                "recipe price ingredients",
                evidence,
            )
        )

    @patch("app.services.retrieval.get_collection")
    def test_ranks_matching_evidence_ahead_of_closer_vector_match(
        self, mock_get_collection
    ):
        collection = FakeCollection([
            (
                "Ground testing used a controlled ignition procedure to "
                "measure equipment response under several operating "
                "conditions before the flight campaign.",
                {"source": "test-report.pdf", "page": 2},
                0.2,
            ),
            (
                "Combustion research in reduced gravity reveals how flame "
                "behavior changes when buoyancy-driven flow is reduced. "
                "These observations inform spacecraft fire-safety models.",
                {"source": "test-report.pdf", "page": 10},
                0.8,
            ),
        ])
        mock_get_collection.return_value = collection

        results = search_documents(
            "What does the NASA guide report about combustion research "
            "in reduced gravity?"
        )

        self.assertEqual(results[0]["page"], 10)
        self.assertEqual(len(results), 2)
        self.assertEqual(
            collection.last_query,
            ["What does the NASA guide report about combustion research "
             "in reduced gravity?"],
        )
        self.assertEqual(collection.last_n_results, 2)
        self.assertEqual(
            collection.last_include,
            ["documents", "metadatas", "distances"],
        )

    @patch("app.services.retrieval.get_collection")
    def test_explicit_source_retrieval_merges_distinct_chunks_from_same_page(
        self, mock_get_collection
    ):
        collection = FakeCollection([
            (
                "Saffire-I uses one large sample approximately 0.4 meters "
                "wide and 0.94 meters tall to demonstrate low-gravity fire spread.",
                {"source": "SAFFIRE-I Operations.pdf", "page": 1},
                0.4,
            ),
            (
                "Saffire-I mission operations begin when Cygnus unberths from "
                "the International Space Station before experiment startup.",
                {"source": "SAFFIRE-I Operations.pdf", "page": 1},
                0.5,
            ),
        ])
        mock_get_collection.return_value = collection

        results = search_documents(
            "How wide and tall is the SAFFIRE-I sample?",
            source_filter="SAFFIRE-I Operations.pdf",
        )

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["page"], 1)
        self.assertIn("0.4 meters wide", results[0]["text"])
        self.assertIn("mission operations begin", results[0]["text"])
        self.assertEqual(
            collection.last_options,
            {"where": {"source": "SAFFIRE-I Operations.pdf"}},
        )


if __name__ == "__main__":
    unittest.main()
