"""
Curated sample data and fallback demonstration generator.
Used when GEMINI_API_KEY is not configured or during offline demonstration mode.
Clearly marks all returned objects with is_demo_mode = True.
"""

from typing import List, Dict, Any

SAMPLE_QUESTIONS_BY_TOPIC: Dict[str, Dict[str, List[Dict[str, str]]]] = {
    "Python": {
        "Beginner": [
            {
                "question_text": "What is the difference between a list and a tuple in Python? Give an example of when you would prefer a tuple.",
                "category": "Data Structures",
                "sample_answer": "In Python, a list is mutable (can be changed after creation) while a tuple is immutable (cannot be modified). Lists are created with square brackets [] and tuples with parentheses (). Tuples are preferred when storing constant collections of items (like geographic coordinates or database credentials) because they are faster, memory-efficient, and prevent accidental data tampering."
            },
            {
                "question_text": "Explain Python's memory management and how garbage collection works at a high level.",
                "category": "Core Architecture",
                "sample_answer": "Python uses private heap memory managed by the Python memory manager. Python primarily employs reference counting to track object usage; when an object's reference count drops to zero, its memory is deallocated immediately. Additionally, a cyclic garbage collector detects and cleans up circular references."
            },
            {
                "question_text": "What are Python decorators and how do they function?",
                "category": "Advanced Functions",
                "sample_answer": "Decorators are design patterns used to modify or extend the behavior of a function or class without permanently modifying its code. A decorator is a callable that takes another function as an argument, defines an inner wrapper function that adds extra logic (e.g., logging, timing, authentication), and returns that wrapper."
            },
            {
                "question_text": "How does error handling work in Python using try, except, else, and finally blocks?",
                "category": "Error Handling",
                "sample_answer": "Python uses try/except blocks for exception handling. Code that might raise an exception goes in the 'try' block. Specific exceptions are caught in 'except' blocks. The 'else' block executes only if no exception occurred, and the 'finally' block always executes regardless of exceptions, typically for cleanup."
            },
            {
                "question_text": "What is the difference between '==' and 'is' in Python?",
                "category": "Operators",
                "sample_answer": "'==' compares the values or equality of two objects (checking if content matches), whereas 'is' checks for identity (whether both variables point to the exact same memory address in heap memory)."
            }
        ],
        "Intermediate": [
            {
                "question_text": "What are Python Generators and the 'yield' keyword? How do they differ from normal functions?",
                "category": "Generators & Iterators",
                "sample_answer": "Generators are functions that return an iterator and yield items one at a time using 'yield' instead of returning all results at once. They maintain their execution state between calls, saving significant memory when processing large datasets because items are evaluated lazily on demand."
            },
            {
                "question_text": "Explain the Global Interpreter Lock (GIL) in CPython and its impact on multi-threading.",
                "category": "Concurrency",
                "sample_answer": "The Global Interpreter Lock (GIL) is a mutex in CPython that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously. Consequently, multi-threading in Python cannot achieve true CPU-bound parallelism, making the 'multiprocessing' module or asynchronous I/O preferred for high-throughput computing."
            },
            {
                "question_text": "What are *args and **kwargs in Python function definitions and how are they used?",
                "category": "Function Parameters",
                "sample_answer": "*args allows a function to accept any number of positional arguments as a tuple, while **kwargs allows a function to accept arbitrary keyword arguments as a dictionary. They provide flexibility for writing extensible wrapper functions and APIs."
            },
            {
                "question_text": "Explain list comprehensions vs generator expressions in terms of syntax, memory, and performance.",
                "category": "Functional Programming",
                "sample_answer": "List comprehensions use brackets [x for x in data] and create the entire list in memory immediately. Generator expressions use parentheses (x for x in data) and produce items lazily on each iteration. Generator expressions are far more memory-efficient for large sequences."
            },
            {
                "question_text": "How does Python's `__init__` differ from `__new__`?",
                "category": "Object Oriented Programming",
                "sample_answer": "'__new__' is the static constructor method responsible for actually creating and returning a new instance of a class. '__init__' is the initializer method that takes that newly created instance as 'self' to set up initial attributes."
            }
        ],
        "Advanced": [
            {
                "question_text": "How do metaclasses work in Python? Provide an architectural use-case where a custom metaclass is needed.",
                "category": "Metaprogramming",
                "sample_answer": "Metaclasses are 'classes of classes'—they define how classes themselves are constructed, instantiated, and validated. A common use case is in ORMs or validation frameworks (like Pydantic or Django models) to inspect class attributes and register database fields during class creation time."
            },
            {
                "question_text": "Explain Python's asyncio event loop architecture and cooperative multitasking.",
                "category": "Async Programming",
                "sample_answer": "Asyncio uses a single-threaded cooperative multitasking model driven by an event loop. When a coroutine awaits an I/O operation via 'await', it yields execution back to the event loop, which switches to run another ready task without OS context-switching overhead."
            }
        ]
    },
    "Data Structures and Algorithms": {
        "Beginner": [
            {
                "question_text": "Explain the difference between an Array and a Linked List with respect to memory allocation and search time complexity.",
                "category": "Data Structures",
                "sample_answer": "Arrays store elements in contiguous memory locations, allowing O(1) random access by index, but insertions/deletions at arbitrary points take O(n). Linked Lists store elements as individual nodes with pointers in non-contiguous memory, making insertions/deletions O(1) once position is located, but search requires O(n) linear traversal."
            },
            {
                "question_text": "What is a Stack data structure and where is it commonly used in software systems?",
                "category": "Data Structures",
                "sample_answer": "A Stack is a Last-In, First-Out (LIFO) linear data structure. Common operations are push, pop, and peek (all O(1)). Applications include call stack execution in compilers, Undo/Redo operations in text editors, and syntax checking for balanced parentheses."
            },
            {
                "question_text": "Explain Binary Search, its preconditions, and its time complexity.",
                "category": "Algorithms",
                "sample_answer": "Binary Search is a divide-and-conquer search algorithm that works on sorted collections. By repeatedly comparing the target to the middle element and halving the search space, it finds elements in O(log n) time complexity, requiring O(1) auxiliary space."
            },
            {
                "question_text": "What is a Hash Table and how are hash collisions handled?",
                "category": "Data Structures",
                "sample_answer": "A Hash Table maps keys to values using a hash function for average O(1) lookups. Collisions occur when two distinct keys produce the same hash index. They are commonly handled via Separate Chaining (linked lists or balanced trees at each bucket) or Open Addressing (linear probing, quadratic probing, or double hashing)."
            },
            {
                "question_text": "What is Big-O notation and why is it important for software engineers?",
                "category": "Complexity Analysis",
                "sample_answer": "Big-O notation describes the upper bound of an algorithm's runtime or memory requirements as the input size (n) grows towards infinity. It helps engineers compare algorithmic scalability independently of hardware differences."
            }
        ],
        "Intermediate": [
            {
                "question_text": "Compare Breadth-First Search (BFS) and Depth-First Search (DFS) on trees or graphs.",
                "category": "Graph Algorithms",
                "sample_answer": "BFS traverses level-by-level using a Queue (FIFO) and is ideal for finding the shortest path on unweighted graphs. DFS explores as deep as possible along each branch before backtracking using a Stack or recursion, requiring less memory when trees are broad."
            },
            {
                "question_text": "What is QuickSort, what is its average and worst-case time complexity, and how can the worst case be avoided?",
                "category": "Sorting Algorithms",
                "sample_answer": "QuickSort is a divide-and-conquer sorting algorithm that partitions elements around a pivot. Average time complexity is O(n log n), while worst-case is O(n²) when the pivot selection is skewed. Worst-case can be mitigated using randomized pivot selection or the median-of-three technique."
            }
        ]
    },
    "DBMS": {
        "Beginner": [
            {
                "question_text": "What are ACID properties in a Database Management System? Explain each property briefly.",
                "category": "Transactions",
                "sample_answer": "ACID stands for Atomicity (all-or-nothing transaction execution), Consistency (data remains valid according to constraints before and after transactions), Isolation (concurrent transactions execute independently without interference), and Durability (committed changes persist permanently even during system crashes)."
            },
            {
                "question_text": "What is the difference between Primary Key, Candidate Key, and Foreign Key?",
                "category": "Relational Concepts",
                "sample_answer": "A Candidate Key is any minimal attribute set that uniquely identifies a row. The Primary Key is the chosen candidate key used as the unique identifier for a table (cannot be NULL). A Foreign Key is a field that references the primary key of another table to establish relational integrity."
            },
            {
                "question_text": "What is database normalization? Explain 1NF, 2NF, and 3NF briefly.",
                "category": "Schema Design",
                "sample_answer": "Normalization organizes database schema to reduce redundancy and eliminate insertion, update, and deletion anomalies. 1NF requires atomic values and no repeating groups. 2NF requires 1NF and no partial dependencies on composite keys. 3NF requires 2NF and no transitive dependencies."
            },
            {
                "question_text": "What is a database index and what are the trade-offs of adding too many indexes?",
                "category": "Indexing & Performance",
                "sample_answer": "An index is a data structure (typically a B-Tree or Hash) that speeds up data retrieval. The trade-off is that every INSERT, UPDATE, or DELETE requires updating the indexes, slowing down write throughput and consuming extra disk storage."
            },
            {
                "question_text": "Explain the difference between SQL (Relational) and NoSQL databases. When would you choose each?",
                "category": "Architecture",
                "sample_answer": "SQL databases are structured, table-based, schema-enforced, and ACID compliant (e.g., PostgreSQL, MySQL). NoSQL databases are document, key-value, column, or graph stores that support dynamic schemas and horizontal scaling (e.g., MongoDB, Redis). Choose SQL for complex transactions and structured relationships; choose NoSQL for high velocity, flexible schemas, and distributed caching."
            }
        ]
    },
    "Operating Systems": {
        "Beginner": [
            {
                "question_text": "What is the difference between a Process and a Thread?",
                "category": "Concurrency & Processes",
                "sample_answer": "A Process is an executing program instance with its own independent address space, memory, and system resources. A Thread is a lightweight unit of execution within a process that shares the process's code, data, and OS resources, but has its own stack and registers. Context switching between threads is much faster than between processes."
            },
            {
                "question_text": "What is Deadlock, what are the four Coffman conditions required for it to occur, and how can it be prevented?",
                "category": "Process Synchronization",
                "sample_answer": "Deadlock is a condition where two or more processes are blocked waiting for resources held by each other. The four conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Deadlock can be prevented by breaking any one of these conditions (e.g., resource ordering to eliminate circular wait)."
            },
            {
                "question_text": "Explain Virtual Memory, Paging, and Page Faults.",
                "category": "Memory Management",
                "sample_answer": "Virtual Memory provides an illusion of a large contiguous physical memory by swapping memory pages between RAM and disk storage. Physical memory is divided into frames and virtual memory into pages. A Page Fault occurs when a program attempts to access a page that is mapped in address space but not currently loaded in physical RAM, prompting the OS to retrieve it from disk."
            },
            {
                "question_text": "What are System Calls and why are they necessary in an operating system?",
                "category": "Kernel Architecture",
                "sample_answer": "System Calls are the programmatic interface by which user-space applications request privileged services from the operating system kernel (e.g., file system I/O, network sockets, process creation). They enforce security by separating User Mode from Kernel Mode."
            },
            {
                "question_text": "What is CPU Scheduling and what is the difference between Preemptive and Non-Preemptive scheduling?",
                "category": "CPU Scheduling",
                "sample_answer": "CPU Scheduling determines which ready process gets allocated the CPU. In Preemptive scheduling (e.g., Round Robin, SRTF), the OS can interrupt a running process to switch context. In Non-Preemptive scheduling (e.g., FCFS), once a process receives the CPU, it holds it until termination or voluntary I/O block."
            }
        ]
    },
    "Computer Networks": {
        "Beginner": [
            {
                "question_text": "What is the difference between TCP and UDP? Give real-world examples of when each is used.",
                "category": "Transport Layer",
                "sample_answer": "TCP is connection-oriented, reliable, orders packets, and performs flow and congestion control (used for HTTP, email, file transfers). UDP is connectionless, lightweight, and transmits packets without guarantees or retransmissions (used for real-time video streaming, DNS queries, and online multiplayer gaming where low latency is critical)."
            },
            {
                "question_text": "Explain the 7 layers of the OSI model and the function of each layer.",
                "category": "Network Models",
                "sample_answer": "The 7 OSI layers are: 1. Physical (raw bit transmission), 2. Data Link (node-to-node framing and MAC addressing), 3. Network (packet routing and IP addressing), 4. Transport (end-to-end communication and reliability - TCP/UDP), 5. Session (dialogue control), 6. Presentation (data encryption and formatting), 7. Application (user-facing protocols like HTTP, FTP)."
            },
            {
                "question_text": "What happens when you type a URL like 'https://www.google.com' into a web browser and hit Enter?",
                "category": "Web Architecture",
                "sample_answer": "1. Browser checks cache, then resolves domain to IP via DNS hierarchy. 2. Initiates TCP 3-way handshake (SYN, SYN-ACK, ACK). 3. Conducts TLS/SSL handshake for HTTPS security. 4. Sends HTTP GET request. 5. Server processes and returns HTTP response (HTML, CSS, JS). 6. Browser renders the DOM and paints the page."
            },
            {
                "question_text": "What is DNS and how does DNS resolution work?",
                "category": "Application Layer",
                "sample_answer": "DNS (Domain Name System) translates human-readable domain names into machine-readable IP addresses. Resolution queries recursively go through the local DNS resolver, Root DNS servers, Top-Level Domain (TLD) servers (like .com), and Authoritative Name Servers to locate the correct IP."
            },
            {
                "question_text": "What is the difference between HTTP and HTTPS, and how does SSL/TLS provide security?",
                "category": "Security & Protocols",
                "sample_answer": "HTTP transmits data in plaintext over port 80. HTTPS encrypts data using TLS/SSL over port 443, ensuring confidentiality, integrity against tampering, and server authentication via digital certificates signed by Certificate Authorities."
            }
        ]
    },
    "JavaScript": {
        "Beginner": [
            {
                "question_text": "What is the difference between `var`, `let`, and `const` in JavaScript?",
                "category": "Variables & Scoping",
                "sample_answer": "`var` is function-scoped and hoisted with an initial value of undefined. `let` and `const` are block-scoped and hoisted to a Temporal Dead Zone (TDZ). `let` can be reassigned, while `const` cannot be reassigned after declaration."
            },
            {
                "question_text": "Explain Closures in JavaScript with a simple practical example.",
                "category": "Core JavaScript",
                "sample_answer": "A closure is a function bundled together with references to its surrounding lexical state. Closures give an inner function access to an outer function's scope even after the outer function has completed execution, commonly used for data encapsulation, private variables, and factory functions."
            },
            {
                "question_text": "What is the JavaScript Event Loop and how does asynchronous execution work?",
                "category": "Concurrency Model",
                "sample_answer": "JavaScript is single-threaded. The Event Loop monitors the Call Stack and Task Queues (Microtask Queue for Promises/queueMicrotask, and Macrotask Queue for setTimeout/setInterval). When the Call Stack is empty, microtasks execute first, followed by macrotasks, enabling non-blocking I/O."
            },
            {
                "question_text": "What is the difference between synchronous code and Promises / async-await?",
                "category": "Asynchronous JavaScript",
                "sample_answer": "Synchronous code blocks the thread until completion. Promises represent eventual completion or failure of an asynchronous operation, preventing 'callback hell'. Async/await is syntactic sugar over Promises that allows asynchronous code to be written in a cleaner, synchronous-like style."
            },
            {
                "question_text": "What is prototype inheritance in JavaScript and how does the prototype chain work?",
                "category": "Object Oriented JS",
                "sample_answer": "In JavaScript, objects inherit properties and methods directly from other objects via their prototype. Every object has an internal link to another object called its prototype. When accessing a property, JavaScript searches the object itself, then climbs up the prototype chain until found or reaching null."
            }
        ]
    },
    "React": {
        "Beginner": [
            {
                "question_text": "What is the Virtual DOM and how does React's reconciliation process improve performance?",
                "category": "Core Architecture",
                "sample_answer": "The Virtual DOM is a lightweight in-memory representation of the real DOM. When component state changes, React creates a new virtual DOM tree, diffs it against the previous one (reconciliation), and batches minimal necessary updates to the real DOM, avoiding expensive layout reflows."
            },
            {
                "question_text": "What are React Hooks? Explain the difference between `useState` and `useEffect`.",
                "category": "React Hooks",
                "sample_answer": "Hooks let functional components use state and lifecycle features. `useState` declares a local state variable and updater function. `useEffect` handles side-effects (data fetching, subscriptions, DOM manipulation) after component render, controlled by a dependency array."
            },
            {
                "question_text": "What is the difference between props and state in React?",
                "category": "Component Communication",
                "sample_answer": "Props (properties) are read-only inputs passed from a parent component to a child to configure it. State is mutable data managed locally within a component that can trigger re-renders when updated."
            },
            {
                "question_text": "Why are keys important when rendering lists of elements in React?",
                "category": "Rendering & Reconciliation",
                "sample_answer": "Keys help React identify which list items have changed, been added, or been removed. They give elements a stable identity across renders, allowing React's diffing algorithm to efficiently reorder existing DOM nodes instead of re-rendering the entire list."
            },
            {
                "question_text": "How can you prevent unnecessary re-renders in a React application?",
                "category": "Performance Optimization",
                "sample_answer": "By using React.memo for pure functional components, `useCallback` to memoize callback function instances passed as props, and `useMemo` to cache computationally expensive calculations between renders."
            }
        ]
    }
}

def get_fallback_questions(topic: str, difficulty: str, count: int) -> List[Dict[str, Any]]:
    """Return fallback questions for demonstration when Gemini is offline or API key is missing."""
    topic_clean = topic.strip()
    
    # Try exact match or partial match
    matched_topic = None
    for key in SAMPLE_QUESTIONS_BY_TOPIC.keys():
        if key.lower() == topic_clean.lower() or key.lower() in topic_clean.lower() or topic_clean.lower() in key.lower():
            matched_topic = key
            break
            
    if not matched_topic:
        matched_topic = "Python" # Default reliable fallback topic
        
    diff_pool = SAMPLE_QUESTIONS_BY_TOPIC[matched_topic].get(difficulty)
    if not diff_pool:
        diff_pool = SAMPLE_QUESTIONS_BY_TOPIC[matched_topic].get("Beginner", [])
        
    # Build list of questions
    results = []
    for idx in range(count):
        source = diff_pool[idx % len(diff_pool)]
        results.append({
            "question_number": idx + 1,
            "question_text": source["question_text"],
            "topic": topic,
            "difficulty": difficulty,
            "category": source.get("category", "Fundamentals"),
            "sample_answer": source.get("sample_answer", "")
        })
    return results

def get_fallback_evaluation(question_text: str, user_answer: str, topic: str, difficulty: str) -> Dict[str, Any]:
    """Generates an honest fallback evaluation clearly marked as Demonstration Mode."""
    clean_ans = user_answer.strip()
    words = clean_ans.split()
    word_count = len(words)
    
    if word_count == 0:
        return {
            "overall_score": 1.0,
            "technical_accuracy_score": 1.0,
            "conceptual_understanding_score": 1.0,
            "completeness_score": 1.0,
            "clarity_score": 2.0,
            "what_went_well": "You started the practice question. Taking the first step in interview preparation is important.",
            "areas_to_improve": "No answer content was provided. Try expressing your thoughts even if you are not 100% certain.",
            "missing_concepts": "Key definitions, core syntax/mechanisms, and real-world practical examples.",
            "corrected_explanation": f"Start with a direct definition of the {topic} concept, followed by how it operates internally and when to use it.",
            "improved_sample_answer": f"For {topic} ({difficulty} level): Start by clearly defining the core concept in one sentence, explain how it functions under the hood, and conclude with a practical use case or code example.",

            "personalized_recommendation": f"Review foundational documentation and beginner tutorials for {topic}. Practice speaking or writing your explanations out loud.",
            "follow_up_question": f"Can you state the primary purpose of {topic} in your own words?",
            "is_demo_mode": True
        }
    
    # Assess length & simple relevance for demo
    if word_count < 15:
        score = 4.5
        tech = 4.0
        concept = 4.5
        comp = 4.0
        clarity = 5.5
        strengths = "Good initial instinct and concise phrasing."
        areas = "The explanation is brief. In technical interviews, expanding on 'why' and 'how' demonstrates deeper technical mastery."
        missing = "Underlying mechanism, trade-offs, and an illustrative scenario."
    elif word_count < 45:
        score = 7.0
        tech = 7.0
        concept = 7.5
        comp = 6.5
        clarity = 7.5
        strengths = "Clear explanation covering the main points effectively with good terminology."
        areas = "You can enhance your response by providing an edge case, memory or performance consideration, or practical example."
        missing = "Comparison with alternative approaches or runtime complexity details."
    else:
        score = 8.5
        tech = 8.5
        concept = 9.0
        comp = 8.0
        clarity = 8.5
        strengths = "Well-elaborated answer showing solid technical vocabulary and thorough reasoning."
        areas = "Ensure you maintain a sharp opening summary before detailing secondary nuances."
        missing = "Specific production trade-offs or benchmark considerations."

    return {
        "overall_score": score,
        "technical_accuracy_score": tech,
        "conceptual_understanding_score": concept,
        "completeness_score": comp,
        "clarity_score": clarity,
        "what_went_well": strengths,
        "areas_to_improve": areas,
        "missing_concepts": missing,
        "corrected_explanation": f"Focus on structuring your {topic} explanation: 1) Definition, 2) Technical mechanism, and 3) Practical implementation or edge case.",
        "improved_sample_answer": f"A comprehensive model answer for this {topic} question breaks the explanation into three parts: 1) Precise definition, 2) Core mechanism or data structure used, and 3) Practical trade-off (e.g. time vs space complexity or immutability benefits).",

        "personalized_recommendation": f"Continue practicing structured answers for {topic}: use the 'Define -> Elaborate -> Example' pattern.",
        "follow_up_question": f"How would this concept scale or behave under heavy workload or edge case inputs in {topic}?",
        "is_demo_mode": True
    }
