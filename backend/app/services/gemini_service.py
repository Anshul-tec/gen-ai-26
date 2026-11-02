import json
import logging
import re
import time
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.sample_data import get_fallback_questions, get_fallback_evaluation

logger = logging.getLogger("ai_interview.gemini")

def clean_json_text(text: Optional[str]) -> str:
    """
    Extract clean JSON text, stripping markdown code blocks, preamble/epilogue text,
    and surrounding whitespace while ensuring matching brace/bracket boundaries.
    """
    if not text:
        return ""
    text = text.strip()
    
    # Strip markdown code blocks
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Find outermost JSON boundaries without mixing bracket types
    first_brace = text.find('{')
    first_bracket = text.find('[')

    if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
        # Starts with an object: search for matching last '}'
        last_brace = text.rfind('}')
        if last_brace != -1 and last_brace > first_brace:
            text = text[first_brace:last_brace + 1]
    elif first_bracket != -1:
        # Starts with an array: search for matching last ']'
        last_bracket = text.rfind(']')
        if last_bracket != -1 and last_bracket > first_bracket:
            text = text[first_bracket:last_bracket + 1]

    return text.strip()


def to_clean_str(val: Any, default: str = "") -> str:
    """Ensure value is a clean string, safely converting lists or None."""
    if val is None:
        return default
    if isinstance(val, list):
        return "\n".join(str(item).strip() for item in val if item)
    return str(val).strip()


def to_clean_list(val: Any, default: Optional[List[str]] = None) -> List[str]:
    """Ensure value is a list of strings, safely converting strings or None."""
    if default is None:
        default = []
    if val is None:
        return default
    if isinstance(val, list):
        return [str(item).strip() for item in val if str(item).strip()]
    if isinstance(val, str):
        items = [s.strip().lstrip("-*•0123456789. ") for s in val.split("\n") if s.strip()]
        return items if items else [val.strip()]
    return default


class GeminiService:
    def __init__(self):
        self._client = None
        self._last_key_used = None
        self._verification_status = {
            "verified": False,
            "last_checked": 0,
            "error_message": "Not initialized yet"
        }

    def _get_api_key(self) -> str:
        """Retrieve sanitized API key from config/environment."""
        if not settings.has_api_key:
            return ""
        return settings.GEMINI_API_KEY.strip()

    def _get_model_name(self) -> str:
        """Retrieve configured Gemini model strictly from settings (defaults to gemini-3.8-flash)."""
        return settings.GEMINI_MODEL.strip() if settings.GEMINI_MODEL else "gemini-3.8-flash"

    def _get_or_create_client(self):
        """Initialize or retrieve the official google-genai client."""
        current_key = self._get_api_key()
        if not current_key:
            self._client = None
            self._last_key_used = None
            return None

        # Re-create client if key changed or not yet initialized
        if self._client is None or self._last_key_used != current_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=current_key)
                self._last_key_used = current_key
                logger.info(f"Initialized official Google Gen AI Client with configured model: {self._get_model_name()}")
            except Exception as e:
                logger.error(f"Failed to initialize google.genai Client: {e}")
                self._client = None
                self._last_key_used = None
        
        return self._client

    # Cache durations (seconds)
    _CACHE_SUCCESS_TTL = 300   # 5 minutes after a successful verification
    _CACHE_FAILURE_TTL = 120   # 2 minutes after a failed verification (avoids hammering a 503 API)

    def verify_connection(self, force: bool = False) -> Dict[str, Any]:
        """
        Verify live Gemini connection using the configured model.
        Caches success for 5 min and failure for 2 min to avoid exhausting
        quota and hammering a temporarily-unavailable API.
        Never silently switches to Demo Mode if a key is configured.
        """
        settings.refresh_from_env()
        now = time.time()
        current_key = self._get_api_key()
        model_name = self._get_model_name()

        # If no valid key configured, report Demo Mode accurately
        if not current_key:
            self._verification_status = {
                "verified": False,
                "last_checked": now,
                "error_message": "No valid GEMINI_API_KEY configured in backend/.env"
            }
            return {
                "configured": False,
                "verified": False,
                "is_demo_mode": True,
                "message": "Demo Mode: No valid GEMINI_API_KEY provided in backend/.env",
                "model": model_name
            }

        # Return cached result unless forced
        if not force:
            elapsed = now - self._verification_status["last_checked"]
            if self._verification_status["verified"] and elapsed < self._CACHE_SUCCESS_TTL:
                return {
                    "configured": True,
                    "verified": True,
                    "is_demo_mode": False,
                    "message": f"Google Gemini AI connection verified and active ({model_name}).",
                    "model": model_name
                }
            if not self._verification_status["verified"] and elapsed < self._CACHE_FAILURE_TTL:
                return {
                    "configured": True,
                    "verified": False,
                    "is_demo_mode": False,
                    "message": f"Gemini temporarily unavailable ({model_name}): {self._verification_status.get('error_message', 'unknown')}",
                    "model": model_name
                }

        client = self._get_or_create_client()
        if not client:
            self._verification_status = {
                "verified": False,
                "last_checked": now,
                "error_message": "Failed to initialize Gemini GenAI client."
            }
            return {
                "configured": True,
                "verified": False,
                "is_demo_mode": False,
                "message": "Failed to initialize Gemini GenAI client.",
                "model": model_name
            }

        # Perform live ping test using the configured model
        try:
            test_resp = client.models.generate_content(
                model=model_name,
                contents="Reply with OK",
                config={
                    "max_output_tokens": 50,
                    "temperature": 0.1,
                    "thinking_config": {"thinking_budget": 0}
                }
            )
            resp_text = (test_resp.text or "").strip()
            if test_resp and resp_text:
                self._verification_status = {
                    "verified": True,
                    "last_checked": now,
                    "error_message": None
                }
                logger.info(f"Gemini live verification successful with {model_name}")
                return {
                    "configured": True,
                    "verified": True,
                    "is_demo_mode": False,
                    "message": f"Google Gemini AI successfully connected and verified ({model_name}).",
                    "model": model_name
                }
            else:
                raise ValueError(f"Empty response received from Gemini ping on model {model_name}.")
        except Exception as ping_err:
            err_str = str(ping_err)
            if current_key and current_key in err_str:
                err_str = err_str.replace(current_key, "[REDACTED_API_KEY]")
            logger.warning(f"Gemini live verification failed on {model_name}: {err_str}")
            self._verification_status = {
                "verified": False,
                "last_checked": now,
                "error_message": err_str
            }
            return {
                "configured": True,
                "verified": False,
                "is_demo_mode": False,
                "message": f"Gemini connection failed on model {model_name}: {err_str}",
                "model": model_name
            }

    def is_live(self) -> bool:
        """Returns True only if an API key is set and verified."""
        status = self.verify_connection(force=False)
        return status.get("verified", False)

    # Maximum retries for transient Gemini errors (503, 429)
    _MAX_RETRIES = 3
    _BASE_DELAY = 2  # seconds; actual delays: 2s, 4s, 8s

    @staticmethod
    def _is_retryable_error(error: Exception) -> bool:
        """Return True for transient HTTP errors (503 UNAVAILABLE, 429 RESOURCE_EXHAUSTED)."""
        err_str = str(error).lower()
        retryable_signals = ["503", "unavailable", "429", "resource_exhausted", "resource exhausted", "overloaded"]
        return any(signal in err_str for signal in retryable_signals)

    def _call_gemini_json(self, prompt: str, system_instruction: str = "") -> str:
        """
        Execute a structured JSON prompt using the official Google Gen AI SDK
        with the configured model. Retries up to 3 times with exponential backoff
        on transient 503/429 errors. Does NOT silently fall back to demo mode.
        """
        client = self._get_or_create_client()
        if not client:
            raise RuntimeError("Gemini Client is not initialized. Please configure a valid GEMINI_API_KEY in backend/.env.")

        model_name = self._get_model_name()
        last_error = None

        for attempt in range(1, self._MAX_RETRIES + 1):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "temperature": 0.2,
                        "response_mime_type": "application/json",
                        "thinking_config": {"thinking_budget": 0}
                    }
                )
                if response and response.text:
                    # On success, mark verification as healthy so health endpoint reflects reality
                    self._verification_status["verified"] = True
                    self._verification_status["last_checked"] = time.time()
                    self._verification_status["error_message"] = None
                    return response.text
                else:
                    raise ValueError(f"Empty content received from Gemini model {model_name}.")
            except Exception as e:
                last_error = e
                err_msg = str(e)
                current_key = self._get_api_key()
                if current_key and current_key in err_msg:
                    err_msg = err_msg.replace(current_key, "[REDACTED_API_KEY]")

                if self._is_retryable_error(e) and attempt < self._MAX_RETRIES:
                    delay = self._BASE_DELAY * (2 ** (attempt - 1))  # 2s, 4s
                    logger.warning(
                        f"Gemini API transient error on {model_name} (attempt {attempt}/{self._MAX_RETRIES}): "
                        f"{err_msg} — retrying in {delay}s"
                    )
                    time.sleep(delay)
                    continue

                # Non-retryable or final attempt: raise
                logger.error(f"Gemini API call failed on {model_name} (attempt {attempt}/{self._MAX_RETRIES}): {err_msg}")
                self._verification_status["verified"] = False
                self._verification_status["error_message"] = err_msg
                raise RuntimeError(f"Google Gemini API error on model {model_name}: {err_msg}")

        # Should not reach here, but safety net
        raise RuntimeError(f"Google Gemini API failed after {self._MAX_RETRIES} retries on model {model_name}.")

    # ==========================================
    # 1. REAL AI QUESTION GENERATOR
    # ==========================================
    def generate_interview_questions(
        self,
        topic: str,
        difficulty: str,
        num_questions: int,
        interview_type: str
    ) -> Dict[str, Any]:
        """Generate structured technical interview questions using Google Gemini AI with configured model."""
        model_name = self._get_model_name()
        if not self._get_api_key():
            logger.info("Demo Mode: Generating curated fallback questions (no API key configured).")
            return {
                "questions": get_fallback_questions(topic, difficulty, num_questions),
                "is_demo_mode": True,
                "message": "Demo Mode: No Gemini API Key configured in backend/.env. Using curated practice questions."
            }

        system_instruction = (
            "You are a senior technical interviewer and educator for college students and entry-level software engineers.\n"
            "Generate unique, highly relevant, real-world technical interview questions based strictly on the specified topic, "
            "difficulty, and interview style. Prioritize fundamental concepts, conceptual clarity, practical understanding, and commonly tested technical topics.\n"
            "Avoid repetitive questions. Always respond with pure valid JSON."
        )

        prompt = f"""
Generate {num_questions} technical interview questions for an entry-level candidate.
Technical Topic: {topic}
Difficulty Level: {difficulty}
Interview Style: {interview_type}

Ensure each question is clear, technically sound, and tests genuine comprehension.
Return a JSON array of objects with the exact schema:
[
  {{
    "question_number": 1,
    "question_text": "...",
    "topic": "{topic}",
    "difficulty": "{difficulty}",
    "category": "Short 2-3 word topic category (e.g. Memory Management, OOP, Architecture)"
  }}
]
Do not wrap in markdown quotes if possible, return valid JSON only.
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned = clean_json_text(response_text)
            questions_data = json.loads(cleaned)
            
            # Robust extraction if model wrapped the list inside an outer dictionary
            if isinstance(questions_data, dict):
                found_list = None
                for key, val in questions_data.items():
                    if isinstance(val, list):
                        found_list = val
                        break
                if found_list is not None:
                    questions_data = found_list
                else:
                    questions_data = [questions_data]

            if not isinstance(questions_data, list):
                raise ValueError(f"Expected a JSON array of question objects from Gemini ({model_name}).")

            sanitized = []
            for idx, q in enumerate(questions_data):
                if not isinstance(q, dict):
                    continue
                sanitized.append({
                    "question_number": idx + 1,
                    "question_text": to_clean_str(q.get("question_text"), f"Question {idx+1} about {topic}"),
                    "topic": topic,
                    "difficulty": difficulty,
                    "category": to_clean_str(q.get("category"), "Core Concepts")
                })

            if not sanitized:
                raise ValueError(f"Could not extract any valid questions from Gemini ({model_name}) response.")

            if len(sanitized) >= num_questions:
                sanitized = sanitized[:num_questions]

            return {
                "questions": sanitized,
                "is_demo_mode": False,
                "message": f"Successfully generated {len(sanitized)} questions via Google Gemini AI ({model_name})."
            }
        except Exception as e:
            logger.error(f"Live Gemini question generation failed on {model_name}: {e}")
            raise RuntimeError(f"Gemini API Question Generation failed on model {model_name}: {str(e)}")

    # ==========================================
    # 2. REAL AI ANSWER EVALUATION
    # ==========================================
    def evaluate_answer(
        self,
        question_text: str,
        user_answer: str,
        topic: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """
        Evaluate candidate answer using Google Gemini AI with configured model on:
        1. Technical Accuracy (0-10)
        2. Conceptual Understanding (0-10)
        3. Completeness (0-10)
        4. Clarity and Explanation (0-10)
        Follows educational, supportive rules.
        """
        model_name = self._get_model_name()
        clean_ans = user_answer.strip()

        # If no key set, return Demo Mode fallback evaluation
        if not self._get_api_key():
            return get_fallback_evaluation(question_text, clean_ans, topic, difficulty)

        system_instruction = (
            "You are a friendly, encouraging, and knowledgeable technical interview coach evaluating a university student's practice answer.\n\n"
            "EVALUATION CRITERIA (Score each from 0.0 to 10.0):\n"
            "1. Technical Accuracy: Are the technical assertions, definitions, and code mechanics correct?\n"
            "2. Conceptual Understanding: Does the candidate grasp underlying principles, architecture, and logic?\n"
            "3. Completeness: Did they cover the main facets, edge cases, and nuances asked in the question?\n"
            "4. Clarity: Is the response well-structured, coherent, and straightforward to follow?\n\n"
            "IMPORTANT EVALUATION RULES:\n"
            "- Do not punish users for minor grammar, spelling, or phrasing mistakes when the technical meaning is sound.\n"
            "- Accept technically equivalent explanations; do not demand exact textbook wording.\n"
            "- Recognize partially correct answers: acknowledge valid points before explaining gaps.\n"
            "- Explain technical mistakes in simple, approachable language.\n"
            "- Do not invent facts or give high scores to incorrect answers.\n"
            "- If the answer is completely empty, off-topic, or irrelevant, assign low scores (0.0 to 2.0) and explain what was expected.\n"
            "- Never claim that the score predicts actual interview success or guarantees job selection.\n"
            "- Always return valid JSON only."
        )

        prompt = f"""
Evaluate the following interview answer:
Topic: {topic}
Difficulty: {difficulty}
Interview Question: {question_text}
Candidate's Typed Answer: \"\"\"{clean_ans}\"\"\"

Generate your evaluation as a JSON object with this exact structure:
{{
  "overall_score": 8.5,
  "technical_accuracy_score": 8.0,
  "conceptual_understanding_score": 9.0,
  "completeness_score": 8.0,
  "clarity_score": 9.0,
  "what_went_well": "Constructive praise for specific correct concepts or clear explanation...",
  "areas_to_improve": "Clear, kind guidance on what to elaborate or refine...",
  "missing_concepts": "Key terms, mechanisms, or edge cases that would complete the answer...",
  "corrected_explanation": "Simple, clear correction explaining any technical mistakes or clarifying the core mechanics...",
  "improved_sample_answer": "An ideal, well-structured model answer that teaches the concept clearly...",
  "personalized_recommendation": "1-2 actionable study tips or topics to revise...",
  "follow_up_question": "One relevant follow-up question based on the question and candidate's response to probe deeper"
}}
All scores must be floats between 0.0 and 10.0. Calculate overall_score as the balanced average of the 4 criteria.
"""
        try:
            response_text = self._call_gemini_json(prompt, system_instruction)
            cleaned = clean_json_text(response_text)
            eval_data = json.loads(cleaned)

            if isinstance(eval_data, list) and eval_data:
                eval_data = eval_data[0]
            if not isinstance(eval_data, dict):
                raise ValueError(f"Expected a JSON evaluation object from Gemini ({model_name}).")

            def safe_score(val, default=7.0):
                try:
                    f = float(val)
                    return max(0.0, min(10.0, round(f, 1)))
                except Exception:
                    return default

            overall = safe_score(eval_data.get("overall_score"))
            tech = safe_score(eval_data.get("technical_accuracy_score"), overall)
            concept = safe_score(eval_data.get("conceptual_understanding_score"), overall)
            comp = safe_score(eval_data.get("completeness_score"), overall)
            clarity = safe_score(eval_data.get("clarity_score"), overall)

            return {
                "overall_score": overall,
                "technical_accuracy_score": tech,
                "conceptual_understanding_score": concept,
                "completeness_score": comp,
                "clarity_score": clarity,
                "what_went_well": to_clean_str(eval_data.get("what_went_well"), "Good effort attempting the problem."),
                "areas_to_improve": to_clean_str(eval_data.get("areas_to_improve"), "Provide more specific details or examples."),
                "missing_concepts": to_clean_str(eval_data.get("missing_concepts"), "Deeper exploration of edge cases or trade-offs."),
                "corrected_explanation": to_clean_str(eval_data.get("corrected_explanation"), "Ensure foundational definitions are precise."),
                "improved_sample_answer": to_clean_str(eval_data.get("improved_sample_answer"), "A strong answer clearly defines the concept and gives an example."),
                "personalized_recommendation": to_clean_str(eval_data.get("personalized_recommendation"), f"Revise key fundamentals of {topic}."),
                "follow_up_question": to_clean_str(eval_data.get("follow_up_question"), f"How does this concept apply in practical {topic} development?"),
                "is_demo_mode": False
            }
        except Exception as e:
            logger.error(f"Live Gemini answer evaluation failed on {model_name}: {e}")
            raise RuntimeError(f"Gemini API Answer Evaluation failed on model {model_name}: {str(e)}")

    # ==========================================
    # 3. AI FOLLOW-UP QUESTION GENERATOR
    # ==========================================
    def generate_follow_up(
        self,
        question_text: str,
        user_answer: str,
        topic: str,
        difficulty: str
    ) -> Dict[str, Any]:
        """Generate a contextual follow-up question using Google Gemini AI with configured model."""
        model_name = self._get_model_name()
        if not self._get_api_key():
            return {
                "follow_up_question": f"Can you give a practical real-world scenario where you would apply your answer in {topic}?",
                "rationale": "Demonstration follow-up question.",
                "is_demo_mode": True
            }

        prompt = f"""
Given this interview question and student's answer:
Topic: {topic}
Difficulty: {difficulty}
Question: {question_text}
Student's Answer: {user_answer}

Generate one sharp, thoughtful follow-up interview question that checks either an edge case, performance trade-off, or architectural implication of what they said.
The follow-up question should test deeper understanding without unnecessarily repeating the original question.
Return JSON:
{{
  "follow_up_question": "...",
  "rationale": "Short explanation of why this follow-up is relevant"
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, "You are an expert technical interviewer. Return JSON only.")
            cleaned = clean_json_text(response_text)
            data = json.loads(cleaned)
            if isinstance(data, list) and data:
                data = data[0]
            if not isinstance(data, dict):
                data = {}

            return {
                "follow_up_question": to_clean_str(data.get("follow_up_question"), f"How would you optimize this approach in {topic}?"),
                "rationale": to_clean_str(data.get("rationale"), "Probes depth of understanding."),
                "is_demo_mode": False
            }
        except Exception as e:
            logger.error(f"Live Gemini follow-up failed on {model_name}: {e}")
            raise RuntimeError(f"Gemini API Follow-up generation failed on model {model_name}: {str(e)}")

    # ==========================================
    # 4. AI SESSION SUMMARY GENERATOR
    # ==========================================
    def generate_session_summary(
        self,
        topic: str,
        questions_evaluated: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate comprehensive final review and learning recommendations using Google Gemini AI with configured model."""
        model_name = self._get_model_name()
        if not questions_evaluated:
            return {
                "summary_text": "Practice session ended without any completed question evaluations.",
                "strongest_areas": ["Preparation"],
                "weakest_areas": ["Attempt completion"],
                "revision_concepts": [f"Fundamental concepts of {topic}"],
                "recommendations": ["Try answering at least 3-5 questions to obtain personalized AI insights."],
                "is_demo_mode": not bool(self._get_api_key())
            }

        if not self._get_api_key():
            avg_score = round(sum(q.get("overall_score", 0.0) for q in questions_evaluated) / len(questions_evaluated), 1)
            return {
                "summary_text": f"Great effort completing your {topic} practice session! You demonstrated a good foundational grasp across the attempted topics with an average score of {avg_score}/10.",
                "strongest_areas": ["Foundational knowledge", "Clarity in direct explanations"],
                "weakest_areas": ["Edge case analysis", "Production architecture trade-offs"],
                "revision_concepts": [f"Core {topic} design patterns", "Time and space complexity nuances"],
                "recommendations": [
                    f"Use the 'Definition -> Mechanics -> Real-world Example' structure in future {topic} interviews.",
                    "Review official documentation and practice writing out answers within 2 minutes."
                ],
                "is_demo_mode": True
            }

        attempts_summary = []
        for q in questions_evaluated:
            attempts_summary.append({
                "question": q.get("question_text", ""),
                "score": q.get("overall_score", 0),
                "strengths": q.get("what_went_well", ""),
                "areas_to_improve": q.get("areas_to_improve", "")
            })

        prompt = f"""
The candidate has completed an interview practice session on {topic}.
Here is a summary of their performance across questions:
{json.dumps(attempts_summary, indent=2)}

Generate a personalized educational summary containing:
- Summary text (2-3 motivating paragraphs summarizing overall technical readiness and encouraging final feedback)
- Strongest areas (list of 2-3 specific technical strengths observed)
- Weakest areas (list of 2-3 areas needing improvement)
- Revision concepts (list of 2-4 important concepts to revise)
- Actionable study recommendations (list of 2-3 practical tips)

Return pure JSON:
{{
  "summary_text": "...",
  "strongest_areas": ["Strength 1", "Strength 2"],
  "weakest_areas": ["Area 1", "Area 2"],
  "revision_concepts": ["Concept 1", "Concept 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}}
"""
        try:
            response_text = self._call_gemini_json(prompt, "You are a supportive, insightful interview mentor. Return JSON only.")
            cleaned = clean_json_text(response_text)
            data = json.loads(cleaned)
            if isinstance(data, list) and data:
                data = data[0]
            if not isinstance(data, dict):
                data = {}

            return {
                "summary_text": to_clean_str(data.get("summary_text"), f"You completed your {topic} interview practice session successfully!"),
                "strongest_areas": to_clean_list(data.get("strongest_areas"), ["Technical vocabulary"]),
                "weakest_areas": to_clean_list(data.get("weakest_areas"), ["Elaboration depth"]),
                "revision_concepts": to_clean_list(data.get("revision_concepts"), [f"{topic} core fundamentals"]),
                "recommendations": to_clean_list(data.get("recommendations"), ["Keep practicing daily."]),
                "is_demo_mode": False
            }
        except Exception as e:
            logger.error(f"Live Gemini session summary failed on {model_name}: {e}")
            raise RuntimeError(f"Gemini API Session Summary generation failed on model {model_name}: {str(e)}")

gemini_service = GeminiService()
