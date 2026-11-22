
from django.core.management.base import BaseCommand
from assessments.models import AssessmentCategory, AssessmentQuestion


ASSESSMENTS = {
    "python": {
        "name": "Python",
        "description": "Test your Python programming knowledge.",
        "level": "Programming",
        "questions": [
            ("Which keyword is used to define a function in Python?",
             ["function", "def", "fun", "define"], 1,
             "Python uses the def keyword to define a function."),
            ("Which data type stores True or False values?",
             ["int", "str", "bool", "float"], 2,
             "The bool data type stores Boolean values: True and False."),
            ('What is the output of len("Learnova")?',
             ["7", "8", "9", "10"], 1,
             "Learnova contains 8 characters."),
            ("Which collection stores key-value pairs?",
             ["List", "Tuple", "Set", "Dictionary"], 3,
             "A Python dictionary stores data as key-value pairs."),
            ("Which keyword is used to handle exceptions?",
             ["try", "check", "error", "catch"], 0,
             "Python uses try and except blocks to handle exceptions."),
        ],
    },
    "javascript": {
        "name": "JavaScript",
        "description": "Evaluate your JavaScript fundamentals.",
        "level": "Programming",
        "questions": [
            ("Which keyword declares a block-scoped variable?",
             ["var", "let", "static", "define"], 1,
             "let declares a block-scoped variable in JavaScript."),
            ("Which operator checks value and type equality?",
             ["==", "=", "===", "!="], 2,
             "The === operator checks strict equality."),
            ("Which method adds an item to the end of an array?",
             ["push()", "pop()", "shift()", "unshift()"], 0,
             "push() adds items to the end of an array."),
            ("Which method converts JSON text into a JavaScript object?",
             ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.object()"], 1,
             "JSON.parse() converts JSON text into a JavaScript value."),
            ("Which function is used to handle a Promise result?",
             ["then()", "catchOnly()", "wait()", "resolveNow()"], 0,
             "The then() method handles a fulfilled Promise."),
        ],
    },
    "html-css": {
        "name": "HTML & CSS",
        "description": "Check your web design fundamentals.",
        "level": "Web Development",
        "questions": [
            ("Which HTML tag creates a hyperlink?",
             ["<link>", "<a>", "<href>", "<url>"], 1,
             "The anchor tag creates hyperlinks."),
            ("Which CSS property changes text color?",
             ["font-color", "text-style", "color", "background"], 2,
             "The color property changes the text color."),
            ("Which HTML element is used for the largest heading?",
             ["<h6>", "<head>", "<heading>", "<h1>"], 3,
             "<h1> represents the highest-level heading."),
            ("Which CSS layout system is one-dimensional?",
             ["Flexbox", "Grid", "Float", "Position"], 0,
             "Flexbox is designed for one-dimensional layouts."),
            ("Which attribute provides alternative text for an image?",
             ["title", "alt", "src", "name"], 1,
             "The alt attribute provides alternative text for images."),
        ],
    },
    "sql": {
        "name": "SQL",
        "description": "Test your database and SQL knowledge.",
        "level": "Database",
        "questions": [
            ("Which SQL command retrieves data from a table?",
             ["GET", "OPEN", "SELECT", "FETCH TABLE"], 2,
             "SELECT retrieves data from database tables."),
            ("Which clause filters rows in a query?",
             ["WHERE", "ORDER BY", "GROUP BY", "SELECT"], 0,
             "WHERE filters rows based on a specified condition."),
            ("Which command adds a new row to a table?",
             ["UPDATE", "INSERT INTO", "ALTER", "CREATE"], 1,
             "INSERT INTO adds new records to a table."),
            ("Which key uniquely identifies each row?",
             ["Foreign Key", "Index", "Primary Key", "Candidate Value"], 2,
             "A primary key uniquely identifies each table row."),
            ("Which function counts rows?",
             ["SUM()", "TOTAL()", "NUMBER()", "COUNT()"], 3,
             "COUNT() returns the number of matching rows."),
        ],
    },
    "react": {
        "name": "React",
        "description": "Evaluate your React development skills.",
        "level": "Web Development",
        "questions": [
            ("Which hook manages state in a React function component?",
             ["useEffect", "useState", "useRoute", "useStyle"], 1,
             "useState is used to add state to function components."),
            ("What is JSX?",
             ["A database language", "A CSS framework",
              "A JavaScript syntax extension", "A browser"], 2,
             "JSX lets you write HTML-like markup in JavaScript."),
            ("Which prop helps React identify list items?",
             ["id", "key", "index", "name"], 1,
             "The key prop helps React identify elements in a list."),
            ("Which hook performs side effects?",
             ["useEffect", "useState", "useMemo", "useId"], 0,
             "useEffect synchronizes components with external systems."),
            ("How does a child component receive data from a parent?",
             ["Through props", "Through CSS",
              "Through HTML tags only", "Through a database"], 0,
             "A parent passes data to a child through props."),
        ],
    },
}



class Command(BaseCommand):
    help = "Create or update the default Learnova assessment categories and questions."

    def handle(self, *args, **options):
        total_questions = 0

        for slug, data in ASSESSMENTS.items():
            category, _ = AssessmentCategory.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": data["name"],
                    "description": data["description"],
                    "level": data["level"],
                    "duration": "10-15 minutes",
                    "is_active": True,
                },
            )

            for order, item in enumerate(data["questions"], start=1):
                AssessmentQuestion.objects.update_or_create(
                    category=category,
                    order=order,
                    defaults={
                        "question": item[0],
                        "options": item[1],
                        "correct_answer": item[2],
                        "explanation": item[3],
                        "is_active": True,
                    },
                )
                total_questions += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Assessment seed completed: "
                f"{len(ASSESSMENTS)} categories, "
                f"{total_questions} questions."
            )
        )
