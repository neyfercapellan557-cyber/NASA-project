import unittest
from unittest.mock import patch

from app.services.rag_service import answer_question, is_research_question


class RagServiceTests(unittest.TestCase):
    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response", return_value="Hello!")
    def test_general_question_uses_chat_without_retrieval(
        self, mock_generate, mock_search
    ):
        result = answer_question("Hi, how are you?")

        self.assertEqual(result["response_mode"], "general")
        self.assertEqual(result["answer"], "Hello!")
        self.assertEqual(result["sources"], [])
        self.assertEqual(result["evidence"], [])
        mock_search.assert_not_called()
        self.assertIn("general knowledge", mock_generate.call_args.args[0])

    def test_general_knowledge_question_is_not_mistaken_for_research(self):
        self.assertFalse(is_research_question("What is photosynthesis?"))

    def test_document_library_question_is_research_scoped(self):
        self.assertTrue(is_research_question("What documents do you have?"))

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_document_identifier_limits_retrieval_to_that_source(
        self, mock_generate, mock_search
    ):
        question = "What does PSI-117 say about fuel droplets?"
        mock_search.return_value = [{
            "text": (
                "Fuel droplets exhibited measurable combustion behavior "
                "under the tested conditions."
            ),
            "source": (
                "PSI-117_Reports_Dissertation_Combustion Behavior Of "
                "Sub-Millimeter Sized Oxygenated And N-Alka.pdf"
            ),
            "page": 42,
            "distance": 0.3,
        }]

        result = answer_question(question)

        self.assertEqual(result["response_mode"], "research")
        self.assertFalse(result["insufficient_evidence"])
        self.assertEqual(
            mock_search.call_args.kwargs["source_filter"],
            (
                "PSI-117_Reports_Dissertation_Combustion Behavior Of "
                "Sub-Millimeter Sized Oxygenated And N-Alka.pdf"
            ),
        )
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_saffire_identifier_limits_retrieval_to_operations_pdf(
        self, mock_generate, mock_search
    ):
        question = "What does SAFFIRE-I say?"
        mock_search.return_value = [{
            "text": (
                "The Saffire-I experiment begins only after Cygnus is "
                "unberthed from the ISS."
            ),
            "source": "SAFFIRE-I Operations.pdf",
            "page": 1,
            "distance": 0.2,
        }]

        result = answer_question(question)

        self.assertFalse(result["insufficient_evidence"])
        self.assertEqual(
            mock_search.call_args.kwargs["source_filter"],
            "SAFFIRE-I Operations.pdf",
        )
        self.assertEqual(result["sources"][0]["source"], "SAFFIRE-I Operations.pdf")
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_saffire_i_dimension_answer_keeps_approximate_value_in_sentence(
        self, mock_generate, mock_search
    ):
        mock_search.return_value = [{
            "text": (
                "Nine smaller samples are burned on Saffire-II each having "
                "a dimension of 5 cm wide x 25 cm long. In Saffire-I and "
                "-III, the sample material is a single large sample "
                "(approx. 0.4 m wide by 0.94 m tall) to demonstrate the "
                "development and spread of a large-scale low-gravity fire."
            ),
            "source": "SAFFIRE-I Operations.pdf",
            "page": 1,
            "distance": 0.2,
        }]

        result = answer_question("How wide and tall is the SAFFIRE-I sample?")

        self.assertFalse(result["insufficient_evidence"])
        self.assertIn("0.4 m wide by 0.94 m tall", result["answer"])
        self.assertNotIn("5 cm wide x 25 cm long", result["answer"])
        self.assertEqual(
            mock_search.call_args.kwargs["source_filter"],
            "SAFFIRE-I Operations.pdf",
        )
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents", return_value=[])
    @patch("app.services.rag_service.generate_response")
    def test_research_question_without_evidence_abstains(
        self, mock_generate, mock_search
    ):
        result = answer_question(
            "¿Qué dice la investigación sobre combustión en microgravedad?"
        )

        self.assertEqual(result["response_mode"], "research")
        self.assertTrue(result["insufficient_evidence"])
        self.assertIn("No encontré evidencia suficiente", result["answer"])
        mock_search.assert_called_once()
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_research_answer_quotes_the_exact_supported_sentence(
        self, mock_generate, mock_search
    ):
        mock_search.return_value = [{
            "text": (
                "Combustion research in reduced\n"
                "gravity helps explain "
                "flame behavior under limited buoyancy."
            ),
            "source": "paper.pdf",
            "page": 12,
            "distance": 0.4,
        }]

        result = answer_question(
            "What does the research say about combustion in reduced gravity?"
        )

        self.assertEqual(result["response_mode"], "research")
        self.assertFalse(result["insufficient_evidence"])
        self.assertEqual(result["evidence"][0]["page"], 12)
        self.assertIn(
            '"Combustion research in reduced gravity helps explain flame '
            'behavior under limited buoyancy." [[1]]',
            result["answer"],
        )
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_research_quotes_cite_their_exact_source(
        self, mock_generate, mock_search
    ):
        mock_search.return_value = [
            {
                "text": (
                    "Microgravity and Earth gravity smoke are hypothesized "
                    "to be similar."
                ),
                "source": "paper.pdf",
                "page": 15,
                "distance": 0.4,
            },
            {
                "text": (
                    "The microgravity cases contain larger and darker wake "
                    "regions than the Earth gravity cases."
                ),
                "source": "paper.pdf",
                "page": 14,
                "distance": 0.5,
            },
        ]

        result = answer_question(
            "What does the report say about microgravity smoke and wake regions?"
        )

        self.assertFalse(result["insufficient_evidence"])
        self.assertIn(
            '"The microgravity cases contain larger and darker wake regions '
            'than the Earth gravity cases." [[2]]',
            result["answer"],
        )
        self.assertIn(
            '"Microgravity and Earth gravity smoke are hypothesized to be '
            'similar." [[1]]',
            result["answer"],
        )
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_research_abstains_without_a_complete_supporting_quote(
        self, mock_generate, mock_search
    ):
        mock_search.return_value = [{
            "text": "Combustion research in reduced gravity is discussed",
            "source": "paper.pdf",
            "page": 12,
            "distance": 0.4,
        }]

        result = answer_question(
            "What does the research say about combustion in reduced gravity?"
        )

        self.assertTrue(result["insufficient_evidence"])
        self.assertIn("enough evidence", result["answer"])
        self.assertEqual(result["sources"][0]["source"], "paper.pdf")
        self.assertEqual(result["evidence"][0]["page"], 12)
        mock_generate.assert_not_called()

    @patch("app.services.rag_service.search_documents")
    @patch("app.services.rag_service.generate_response")
    def test_research_abstains_when_quotes_do_not_support_the_requested_topic(
        self, mock_generate, mock_search
    ):
        mock_search.return_value = [{
            "text": (
                "Visual inspection also suggests the Earth gravity smoke to "
                "be more sensitive to small perturbations in flow speed than "
                "the microgravity smoke (in the configuration tested)."
            ),
            "source": "paper.pdf",
            "page": 14,
            "distance": 0.4,
        }]

        result = answer_question(
            "What does the report say about smoke generation in microgravity?"
        )

        self.assertTrue(result["insufficient_evidence"])
        self.assertIn("enough evidence", result["answer"])
        mock_generate.assert_not_called()


if __name__ == "__main__":
    unittest.main()
