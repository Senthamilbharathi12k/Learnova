
from django.core.management.base import BaseCommand

from virtual_experience.models import ExperienceProgram, ExperienceTask


PROGRAMS = [
    {
        "title": "Python Developer Virtual Experience",
        "slug": "python-developer-virtual-experience",
        "role": "Python Developer",
        "description": (
            "Practice Python programming through practical "
            "developer tasks and a mini project."
        ),
        "duration_days": 14,
        "level": "Beginner",
        "tasks": [
            ("Python Fundamentals", "Write Python programs using variables, conditions and loops.", 1),
            ("Functions and Modules", "Create reusable Python functions and modules.", 3),
            ("File Handling", "Build a small application that reads and writes files.", 5),
            ("API Integration", "Connect to a public API and process JSON data.", 8),
            ("Mini Project", "Build a Python-based mini project and submit its repository.", 12),
        ],
    },
    {
        "title": "Full Stack Developer Virtual Experience",
        "slug": "full-stack-developer-virtual-experience",
        "role": "Full Stack Developer",
        "description": (
            "Practice frontend and backend development "
            "through a small full stack project."
        ),
        "duration_days": 14,
        "level": "Intermediate",
        "tasks": [
            ("HTML and CSS Interface", "Create a responsive web page using HTML and CSS.", 1),
            ("JavaScript Interaction", "Add interactive functionality using JavaScript.", 3),
            ("React Components", "Build reusable React components.", 5),
            ("Backend API", "Create a REST API for the application.", 8),
            ("Full Stack Mini Project", "Connect frontend and backend and submit the project.", 12),
        ],
    },
    {
        "title": "Data Analyst Virtual Experience",
        "slug": "data-analyst-virtual-experience",
        "role": "Data Analyst",
        "description": (
            "Practice data analysis using spreadsheets, "
            "SQL and data visualization."
        ),
        "duration_days": 14,
        "level": "Beginner",
        "tasks": [
            ("Data Understanding", "Explore a sample dataset and identify its columns.", 1),
            ("Data Cleaning", "Clean missing and duplicate values.", 3),
            ("SQL Analysis", "Write SQL queries to answer business questions.", 5),
            ("Data Visualization", "Create charts to explain the findings.", 8),
            ("Analysis Report", "Prepare a short data analysis report and submit it.", 12),
        ],
    },
]


class Command(BaseCommand):
    help = "Create predefined Virtual Work Experience programs and tasks."

    def handle(self, *args, **options):
        created_programs = 0
        created_tasks = 0

        for item in PROGRAMS:
            program, created = ExperienceProgram.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "role": item["role"],
                    "description": item["description"],
                    "duration_days": item["duration_days"],
                    "level": item["level"],
                    "is_active": True,
                },
            )

            if created:
                created_programs += 1

            for title, description, day in item["tasks"]:
                task, task_created = ExperienceTask.objects.get_or_create(
                    program=program,
                    title=title,
                    defaults={
                        "description": description,
                        "instructions": (
                            "Complete the task and submit your work "
                            "using a project description or repository link."
                        ),
                        "day_number": day,
                        "is_required": True,
                    },
                )

                if task_created:
                    created_tasks += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Programs created: {created_programs}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Tasks created: {created_tasks}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS("Virtual experiences seeded successfully.")
        )
