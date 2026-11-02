import logging
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import PracticeSession, QuestionRecord
from app.routes.interview import router as interview_router
from app.routes.sessions import router as sessions_router
from app.routes.analytics import router as analytics_router
from app.routes.questions import router as questions_router
from app.services.gemini_service import gemini_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("ai_interview.main")

# Create tables in SQLite
Base.metadata.create_all(bind=engine)

# Ensure schema has latest columns without dropping existing data
def ensure_schema_updated():
    with engine.connect() as conn:
        try:
            cursor = conn.execute(text("PRAGMA table_info(question_records);"))
            columns = [row[1] for row in cursor.fetchall()]
            if "corrected_explanation" not in columns:
                conn.execute(text("ALTER TABLE question_records ADD COLUMN corrected_explanation TEXT;"))
                conn.commit()
                logger.info("Migrated SQLite schema: added corrected_explanation column.")
        except Exception as ex:
            logger.warning(f"Schema check notice: {ex}")

ensure_schema_updated()

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for AI Interview Practice Assistant powered by Google Gemini",
    version="1.0.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + settings.cors_list

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local student project testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial demonstration session if DB is empty
def seed_initial_demo_data():
    db = SessionLocal()
    try:
        count = db.query(PracticeSession).count()
        if count == 0:
            logger.info("Database empty. Seeding initial showcase practice session...")
            demo_session_id = "demo-showcase-session-1"
            base_time = datetime.utcnow() - timedelta(days=1)
            
            s1 = PracticeSession(
                session_id=demo_session_id,
                topic="Python",
                difficulty="Beginner",
                interview_type="Technical Interview",
                total_questions=3,
                questions_attempted=3,
                average_score=8.5,
                status="Completed",
                created_at=base_time,
                summary_text="Great performance on fundamental Python concepts. Strong understanding of data structures and memory paradigms. Keep sharpening real-world concurrency and algorithmic complexity explanations.",
                strongest_areas='["List vs Tuple Mutability", "Object References", "Clarity in Technical Definitions"]',
                weakest_areas='["CPython GIL Internal Mechanics", "Generators Lazy Evaluation"]',
                revision_concepts='["CPython Memory Model", "Decorator Chaining", "Iterator Protocols"]',
                recommendations='["Practice answering system architecture questions using concrete code examples.", "Structure responses with Definition -> Mechanism -> Trade-offs."]'
            )
            db.add(s1)

            q1 = QuestionRecord(
                session_id=demo_session_id,
                question_number=1,
                topic="Python",
                difficulty="Beginner",
                category="Data Structures",
                question_text="What is the difference between a list and a tuple in Python? Give an example of when you would prefer a tuple.",
                user_answer="Lists in Python are mutable, meaning we can modify, append, and remove elements after creation. Tuples are immutable and defined with parentheses. I prefer a tuple for coordinates like (latitude, longitude) so the values cannot be changed accidentally.",
                word_count=41,
                is_answered=True,
                is_evaluated=True,
                overall_score=9.0,
                technical_accuracy_score=9.5,
                conceptual_understanding_score=9.0,
                completeness_score=8.5,
                clarity_score=9.0,
                what_went_well="Accurately explained mutability vs immutability and gave an excellent real-world coordinate example.",
                areas_to_improve="You could also mention that tuples are hashable and can be dictionary keys, whereas lists cannot.",
                missing_concepts="Memory efficiency and dictionary key hashability.",
                corrected_explanation="Lists and tuples both store ordered sequences of items, but lists allocate over-capacity for mutability while tuples have static memory sizes.",
                improved_sample_answer="Lists are mutable sequences defined with square brackets, while tuples are immutable sequences created with parentheses. Tuples have smaller memory overhead, execute faster, and can be used as dictionary keys because they are hashable. For example, storing geographic coordinates (lat, lon) or database connection parameters is ideal with tuples to prevent unintentional tampering.",
                personalized_recommendation="Explore Python's __sizeof__() method to verify how tuples consume less memory than lists.",
                follow_up_question="Why can tuples be used as dictionary keys in Python, but lists cannot?",
                evaluated_at=base_time + timedelta(minutes=5),
                created_at=base_time
            )
            db.add(q1)

            q2 = QuestionRecord(
                session_id=demo_session_id,
                question_number=2,
                topic="Python",
                difficulty="Beginner",
                category="Operators",
                question_text="What is the difference between '==' and 'is' in Python?",
                user_answer="'==' compares if the values of two variables are equal. 'is' checks if both variables refer to the exact same object in memory.",
                word_count=23,
                is_answered=True,
                is_evaluated=True,
                overall_score=8.5,
                technical_accuracy_score=9.0,
                conceptual_understanding_score=9.0,
                completeness_score=7.5,
                clarity_score=8.5,
                what_went_well="Concise and precise distinction between value equality and memory identity.",
                areas_to_improve="Mention how Python's small integer caching (interning) can make 'is' behave unexpectedly with numbers.",
                missing_concepts="Object identity, id() function, and integer interning.",
                corrected_explanation="The '==' operator calls the __eq__() dunder method to compare values, whereas 'is' evaluates pointer addresses in heap memory.",
                improved_sample_answer="'==' checks for value equality (invoking __eq__ under the hood). 'is' checks for identity, verifying if id(a) == id(b) (whether both references point to the exact same location in heap memory). For example, a = [1, 2] and b = [1, 2] will yield a == b as True, but a is b as False.",
                personalized_recommendation="Experiment with sys.intern() and Python's id() function in the interactive shell.",
                follow_up_question="What does Python's id() function return and how does it relate to the 'is' operator?",
                evaluated_at=base_time + timedelta(minutes=10),
                created_at=base_time
            )
            db.add(q2)

            q3 = QuestionRecord(
                session_id=demo_session_id,
                question_number=3,
                topic="Python",
                difficulty="Beginner",
                category="Core Architecture",
                question_text="Explain Python's memory management and how garbage collection works at a high level.",
                user_answer="Python uses reference counting to count references to objects. When count becomes zero, memory is freed. It also has a garbage collector to catch circular references.",
                word_count=28,
                is_answered=True,
                is_evaluated=True,
                overall_score=8.0,
                technical_accuracy_score=8.0,
                conceptual_understanding_score=8.5,
                completeness_score=7.5,
                clarity_score=8.0,
                what_went_well="Identified the two core mechanisms: reference counting and cyclic garbage collection.",
                areas_to_improve="Briefly mention the 3 generations (Gen 0, 1, 2) in Python's gc module.",
                missing_concepts="Generational garbage collection (gc module) and memory allocation via PyMalloc.",
                corrected_explanation="Python allocates memory using PyMalloc for small objects (<512 bytes) and delegates larger allocations to the system allocator.",
                improved_sample_answer="Python manages memory through private heap space using PyMalloc. Memory reclamation is primarily handled by Reference Counting, which immediately frees an object once its reference count drops to zero. To resolve cyclic references where objects reference each other, Python runs a Generational Garbage Collector that periodically inspects three generations of objects (0, 1, and 2) based on allocation frequency.",
                personalized_recommendation="Read the documentation for Python's built-in 'gc' module.",
                follow_up_question="Can you describe an example of a circular reference that normal reference counting cannot collect?",
                evaluated_at=base_time + timedelta(minutes=15),
                created_at=base_time
            )
            db.add(q3)

            db.commit()
            logger.info("Demo showcase session seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

seed_initial_demo_data()

# Include Routers
app.include_router(interview_router)
app.include_router(sessions_router)
app.include_router(analytics_router)
app.include_router(questions_router)

@app.get("/api/health", tags=["Health"])
def health_check(force_verify: bool = False):
    """
    Health check endpoint providing runtime state and Gemini AI status.
    Uses cached verification by default (5-min success / 2-min failure cache).
    Pass ?force_verify=true to trigger a fresh live ping.
    Does not expose API credentials.
    """
    settings.refresh_from_env()
    model_name = settings.GEMINI_MODEL

    # If no API key at all, report demo mode without hitting Gemini
    if not settings.has_api_key:
        return {
            "status": "healthy",
            "app_name": settings.APP_NAME,
            "gemini_model": model_name,
            "gemini_api_configured": False,
            "is_demo_mode": True,
            "ai_engine": "Demo Simulation Engine"
        }

    # Use cached result unless force_verify is requested
    verify_result = gemini_service.verify_connection(force=force_verify)

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "gemini_model": model_name,
        "gemini_api_configured": True,
        "is_demo_mode": False,
        "gemini_verified": verify_result.get("verified", False),
        "ai_engine": f"Google Gemini AI ({model_name})" if verify_result.get("verified") else f"Google Gemini AI ({model_name} — {verify_result.get('message', 'checking')})"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API. Visit /docs for OpenAPI documentation."
    }
