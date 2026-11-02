import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"HTTP ERROR {e.code} on {endpoint}: {error_body}")
        raise

def run_all_8_tests():
    print("=" * 65)
    print("AI INTERVIEW PRACTICE ASSISTANT — BACKEND TEST SUITE (8 TESTS)")
    print("Group 11 — College Generative AI Project")
    print("=" * 65)

    # -------------------------------------------------------------
    # Test 1: Check backend health
    # -------------------------------------------------------------
    print("\n[TEST 1] Checking Backend Health (GET /api/health)...")
    health = make_request("/health")
    print("Response payload:")
    print(json.dumps(health, indent=2))
    assert health["status"] == "healthy", f"Health status invalid: {health}"
    assert "is_demo_mode" in health, "Missing is_demo_mode in health"
    assert "gemini_api_configured" in health, "Missing gemini_api_configured"
    print(f"-> TEST 1 PASSED: Status is '{health['status']}'. Engine: '{health['ai_engine']}'")

    # -------------------------------------------------------------
    # Test 2: Generate five Python beginner interview questions
    # -------------------------------------------------------------
    print("\n[TEST 2] Generating 5 Python Beginner Interview Questions (POST /api/interview/generate)...")
    gen_payload = {
        "topic": "Python",
        "difficulty": "Beginner",
        "num_questions": 5,
        "interview_type": "Technical Interview"
    }
    gen_res = make_request("/interview/generate", method="POST", data=gen_payload)
    session_id = gen_res.get("session_id")
    questions = gen_res.get("questions", [])
    
    assert session_id, "Missing session_id in response"
    assert len(questions) == 5, f"Expected 5 questions, received {len(questions)}"
    
    print(f"Session Created ID: {session_id}")
    print(f"AI Provider Mode: {gen_res.get('ai_provider')} (Demo Mode: {gen_res.get('is_demo_mode')})")
    print("Generated Questions:")
    for q in questions:
        print(f"  Q{q['question_number']}: [{q.get('category', 'General')}] {q['question_text']}")
    print(f"-> TEST 2 PASSED: 5 questions generated successfully.")

    # -------------------------------------------------------------
    # Test 3 & 4: Submit sample answer & verify evaluation
    # Sample answer: "Python is a high-level, interpreted programming language. It is known for its simple syntax and readability."
    # -------------------------------------------------------------
    print("\n[TEST 3 & 4] Submitting Candidate Answer & Verifying AI Evaluation (POST /api/interview/evaluate)...")
    target_q = questions[0]
    sample_answer = "Python is a high-level, interpreted programming language. It is known for its simple syntax and readability."
    
    eval_payload = {
        "session_id": session_id,
        "question_number": target_q["question_number"],
        "question_text": target_q["question_text"],
        "user_answer": sample_answer,
        "topic": "Python",
        "difficulty": "Beginner"
    }
    print(f"Question: {target_q['question_text']}")
    print(f"Submitted Answer: \"{sample_answer}\"")

    eval_res = make_request("/interview/evaluate", method="POST", data=eval_payload)
    print("\nEvaluation Response:")
    print(f"  Overall Score:               {eval_res.get('overall_score')}/10")
    print(f"  Technical Accuracy:          {eval_res.get('technical_accuracy_score')}/10")
    print(f"  Conceptual Understanding:    {eval_res.get('conceptual_understanding_score')}/10")
    print(f"  Completeness:                {eval_res.get('completeness_score')}/10")
    print(f"  Clarity:                     {eval_res.get('clarity_score')}/10")
    print(f"  What You Did Well:           {eval_res.get('what_went_well')}")
    print(f"  Areas to Improve:            {eval_res.get('areas_to_improve')}")
    print(f"  Missing Concepts:            {eval_res.get('missing_concepts')}")
    print(f"  Corrected Explanation:       {eval_res.get('corrected_explanation')}")
    print(f"  Improved Ideal Answer:       {eval_res.get('improved_sample_answer')}")
    print(f"  Personalized Recommendation: {eval_res.get('personalized_recommendation')}")

    assert eval_res.get("overall_score") is not None, "Missing overall_score"
    assert eval_res.get("what_went_well"), "Missing what_went_well"
    assert eval_res.get("areas_to_improve"), "Missing areas_to_improve"
    assert eval_res.get("improved_sample_answer"), "Missing improved_sample_answer"
    print(f"-> TEST 3 & 4 PASSED: Multidimensional AI answer evaluation verified.")

    # -------------------------------------------------------------
    # Test 5: Generate an AI follow-up question
    # -------------------------------------------------------------
    print("\n[TEST 5] Generating Contextual AI Follow-up Question (POST /api/interview/follow-up)...")
    followup_payload = {
        "question_text": target_q["question_text"],
        "user_answer": sample_answer,
        "topic": "Python",
        "difficulty": "Beginner"
    }
    follow_res = make_request("/interview/follow-up", method="POST", data=followup_payload)
    follow_up_q = follow_res.get("follow_up_question")
    assert follow_up_q, "Missing follow_up_question in response"
    print(f"  Follow-up Question: \"{follow_up_q}\"")
    print(f"  Rationale: {follow_res.get('rationale', 'Contextual probing')}")
    print(f"-> TEST 5 PASSED: AI follow-up question successfully generated.")

    # -------------------------------------------------------------
    # Test 6: Generate a session summary
    # -------------------------------------------------------------
    print("\n[TEST 6] Generating Session Mentorship Summary (POST /api/interview/summary)...")
    summary_payload = {"session_id": session_id}
    summary_res = make_request("/interview/summary", method="POST", data=summary_payload)
    
    assert summary_res.get("summary_text"), "Missing summary_text"
    assert summary_res.get("strongest_areas"), "Missing strongest_areas"
    assert summary_res.get("weakest_areas"), "Missing weakest_areas"
    
    print(f"  Summary Text:     {summary_res.get('summary_text')}")
    print(f"  Strongest Areas:  {summary_res.get('strongest_areas')}")
    print(f"  Areas for Revision: {summary_res.get('weakest_areas')}")
    print(f"  Recommendations:  {summary_res.get('recommendations')}")
    print(f"-> TEST 6 PASSED: Session summary successfully synthesized.")

    # -------------------------------------------------------------
    # Test 7: Verify that session information is saved in SQLite
    # -------------------------------------------------------------
    print("\n[TEST 7] Verifying Session Persistence in SQLite (GET /api/sessions/{session_id})...")
    detail_res = make_request(f"/sessions/{session_id}")
    assert detail_res["session_id"] == session_id, "Session ID mismatch in DB"
    assert detail_res["status"] == "Completed", f"Expected Completed status, got {detail_res['status']}"
    assert len(detail_res["questions"]) == 5, f"Expected 5 questions in DB, got {len(detail_res['questions'])}"
    
    # Check that Q1 has saved user answer and evaluation
    db_q1 = detail_res["questions"][0]
    assert db_q1["is_evaluated"] == True, "Q1 should be evaluated in DB"
    assert db_q1["user_answer"] == sample_answer, "User answer mismatch in DB"
    assert db_q1["overall_score"] is not None, "Overall score missing in DB"
    print(f"  Verified DB Session: {detail_res['topic']} ({detail_res['difficulty']})")
    print(f"  Questions Saved: {len(detail_res['questions'])}, Evaluated: {detail_res['questions_attempted']}")
    print(f"  Saved Average Score: {detail_res['average_score']}/10")
    print(f"-> TEST 7 PASSED: SQLite session, answers, and evaluations persisted properly.")

    # -------------------------------------------------------------
    # Test 8: Verify session retrieval and analytics
    # -------------------------------------------------------------
    print("\n[TEST 8] Verifying Session Retrieval, Analytics, and Question Bank...")
    # List sessions
    all_sessions = make_request("/sessions")
    assert any(s["session_id"] == session_id for s in all_sessions), "Session not found in list"
    print(f"  Sessions List: Found {len(all_sessions)} total sessions.")

    # Analytics
    analytics = make_request("/analytics")
    assert analytics["total_sessions"] > 0, "Analytics total_sessions should be > 0"
    assert analytics["questions_attempted"] > 0, "Analytics questions_attempted should be > 0"
    print(f"  Analytics: {analytics['total_sessions']} sessions, {analytics['questions_attempted']} evaluated, Avg: {analytics['average_score']}/10")
    print(f"  Strongest Topic: {analytics.get('strongest_topic')}")

    # Question Bank
    qbank = make_request("/questions?topic=Python")
    assert qbank["total"] > 0, "Question bank should have Python questions"
    print(f"  Question Bank: Retrieved {qbank['total']} Python questions with sample answers.")

    print(f"-> TEST 8 PASSED: Session retrieval, analytics telemetry, and Question Bank verified.")

    print("\n" + "=" * 65)
    print("ALL 8 TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    run_all_8_tests()
