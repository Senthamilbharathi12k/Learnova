
from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Course, CourseSkill, CourseInterest
from skills_interests.models import Skill, Interest


COURSES = [
    {
        "name": "Python Programming",
        "category": "Programming",
        "description": "Learn Python fundamentals and programming concepts.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 6,
        "skills": ["Python"],
        "interests": ["Software Engineering"],
    },
    {
        "name": "Java Programming",
        "category": "Programming",
        "description": "Learn Java programming and object-oriented concepts.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 8,
        "skills": ["Java"],
        "interests": ["Software Engineering", "Backend Development"],
    },
    {
        "name": "C Programming",
        "category": "Programming",
        "description": "Learn C programming fundamentals.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 5,
        "skills": ["C"],
        "interests": ["Software Engineering"],
    },
    {
        "name": "C++ Programming",
        "category": "Programming",
        "description": "Learn C++ and object-oriented programming.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 7,
        "skills": ["C++"],
        "interests": ["Software Engineering", "Game Development"],
    },
    {
        "name": "JavaScript Development",
        "category": "Programming",
        "description": "Learn modern JavaScript programming.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 6,
        "skills": ["JavaScript"],
        "interests": ["Frontend Development", "Web Development"],
    },
    {
        "name": "HTML & CSS",
        "category": "Web Development",
        "description": "Learn webpage structure and styling.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 4,
        "skills": ["HTML", "CSS"],
        "interests": ["Frontend Development", "Web Development", "UI/UX Design"],
    },
    {
        "name": "React.js Development",
        "category": "Web Development",
        "description": "Build interactive frontend applications using React.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["HTML", "CSS", "JavaScript", "React.js"],
        "interests": ["Frontend Development", "Web Development"],
    },
    {
        "name": "Node.js Development",
        "category": "Web Development",
        "description": "Learn server-side JavaScript development.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 7,
        "skills": ["JavaScript", "Node.js", "REST API"],
        "interests": ["Backend Development", "Web Development"],
    },
    {
        "name": "Django Web Development",
        "category": "Web Development",
        "description": "Build backend applications using Django.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["Python", "Django", "SQL"],
        "interests": ["Backend Development", "Web Development"],
    },
    {
        "name": "Full Stack Web Development",
        "category": "Web Development",
        "description": "Learn frontend and backend web development.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 12,
        "skills": ["HTML", "CSS", "JavaScript", "React.js", "Python", "Django"],
        "interests": ["Full Stack Development", "Web Development"],
    },
    {
        "name": "SQL & Database Management",
        "category": "Database",
        "description": "Learn SQL queries and relational database concepts.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 5,
        "skills": ["SQL", "MySQL"],
        "interests": ["Database Management", "Data Analytics"],
    },
    {
        "name": "MySQL Database",
        "category": "Database",
        "description": "Learn MySQL database design and management.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 4,
        "skills": ["MySQL", "SQL"],
        "interests": ["Database Management"],
    },
    {
        "name": "MongoDB",
        "category": "Database",
        "description": "Learn NoSQL database development with MongoDB.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 5,
        "skills": ["MongoDB"],
        "interests": ["Database Management", "Backend Development"],
    },
    {
        "name": "Data Analytics",
        "category": "Data",
        "description": "Learn data analysis and interpretation.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 8,
        "skills": ["Python", "SQL", "Excel"],
        "interests": ["Data Analytics", "Data Science"],
    },
    {
        "name": "Power BI",
        "category": "Data",
        "description": "Learn business intelligence and data visualization.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 5,
        "skills": ["Power BI", "SQL", "Excel"],
        "interests": ["Data Analytics", "Data Science"],
    },
    {
        "name": "Data Science",
        "category": "Data",
        "description": "Learn data science and statistical analysis.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 12,
        "skills": ["Python", "SQL", "Machine Learning"],
        "interests": ["Data Science", "Data Analytics"],
    },
    {
        "name": "Machine Learning",
        "category": "Artificial Intelligence",
        "description": "Learn machine learning algorithms and applications.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 10,
        "skills": ["Python", "Machine Learning"],
        "interests": ["Machine Learning", "Artificial Intelligence", "Data Science"],
    },
    {
        "name": "Deep Learning",
        "category": "Artificial Intelligence",
        "description": "Learn neural networks and deep learning.",
        "difficulty_level": "ADVANCED",
        "duration_weeks": 12,
        "skills": ["Python", "Deep Learning", "Machine Learning"],
        "interests": ["Deep Learning", "Artificial Intelligence"],
    },
    {
        "name": "Artificial Intelligence Fundamentals",
        "category": "Artificial Intelligence",
        "description": "Understand core artificial intelligence concepts.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 6,
        "skills": ["Python", "Machine Learning"],
        "interests": ["Artificial Intelligence", "Machine Learning"],
    },
    {
        "name": "Cybersecurity Fundamentals",
        "category": "Cybersecurity",
        "description": "Learn cybersecurity principles and security practices.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 8,
        "skills": ["Cybersecurity", "Networking"],
        "interests": ["Cybersecurity"],
    },
    {
        "name": "Ethical Hacking",
        "category": "Cybersecurity",
        "description": "Learn ethical hacking and penetration testing concepts.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 10,
        "skills": ["Cybersecurity", "Python"],
        "interests": ["Cybersecurity"],
    },
    {
        "name": "AWS Cloud Computing",
        "category": "Cloud",
        "description": "Learn cloud computing using AWS services.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["AWS", "Docker"],
        "interests": ["Cloud Computing", "DevOps"],
    },
    {
        "name": "Microsoft Azure",
        "category": "Cloud",
        "description": "Learn Microsoft Azure cloud services.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["Azure"],
        "interests": ["Cloud Computing"],
    },
    {
        "name": "DevOps & Docker",
        "category": "DevOps",
        "description": "Learn DevOps practices and Docker containers.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["Docker", "Git", "GitHub"],
        "interests": ["DevOps", "Cloud Computing"],
    },
    {
        "name": "Git & GitHub",
        "category": "Tools",
        "description": "Learn version control and collaborative development.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 3,
        "skills": ["Git", "GitHub"],
        "interests": ["Software Engineering"],
    },
    {
        "name": "Software Testing",
        "category": "Testing",
        "description": "Learn software testing fundamentals.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 6,
        "skills": ["Software Testing"],
        "interests": ["Software Testing & Automation"],
    },
    {
        "name": "Selenium Automation Testing",
        "category": "Testing",
        "description": "Learn browser automation using Selenium.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["Selenium", "Python", "Software Testing"],
        "interests": ["Software Testing & Automation"],
    },
    {
        "name": "UI/UX Design with Figma",
        "category": "Design",
        "description": "Learn interface and user experience design.",
        "difficulty_level": "BEGINNER",
        "duration_weeks": 6,
        "skills": ["Figma", "UI/UX Design"],
        "interests": ["UI/UX Design"],
    },
    {
        "name": "Android App Development",
        "category": "App Development",
        "description": "Learn mobile application development concepts.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 10,
        "skills": ["Java", "Kotlin"],
        "interests": ["Mobile App Development"],
    },
    {
        "name": "Internet of Things (IoT)",
        "category": "Emerging Technology",
        "description": "Learn IoT concepts and connected devices.",
        "difficulty_level": "INTERMEDIATE",
        "duration_weeks": 8,
        "skills": ["C", "Python"],
        "interests": ["Internet of Things (IoT)"],
    },
]

COURSE_AVAILABILITY = {
    "Python Programming": ("ONLINE", "FREE"),
    "Java Programming": ("ONLINE", "PAID"),
    "C Programming": ("OFFLINE", "FREE"),
    "C++ Programming": ("ONLINE", "FREE"),
    "JavaScript Development": ("ONLINE", "PAID"),
    "HTML & CSS": ("ONLINE", "FREE"),
    "React.js Development": ("ONLINE", "PAID"),
    "Node.js Development": ("ONLINE", "PAID"),
    "Django Web Development": ("ONLINE", "PAID"),
    "Full Stack Web Development": ("OFFLINE", "PAID"),
    "SQL & Database Management": ("ONLINE", "FREE"),
    "MySQL Database": ("ONLINE", "FREE"),
    "MongoDB": ("ONLINE", "PAID"),
    "Data Analytics": ("ONLINE", "PAID"),
    "Power BI": ("OFFLINE", "PAID"),
    "Data Science": ("ONLINE", "PAID"),
    "Machine Learning": ("ONLINE", "PAID"),
    "Deep Learning": ("ONLINE", "PAID"),
    "Artificial Intelligence Fundamentals": ("ONLINE", "FREE"),
    "Cybersecurity Fundamentals": ("OFFLINE", "PAID"),
    "Ethical Hacking": ("ONLINE", "PAID"),
    "AWS Cloud Computing": ("ONLINE", "FREE"),
    "Microsoft Azure": ("ONLINE", "FREE"),
    "DevOps & Docker": ("ONLINE", "PAID"),
    "Git & GitHub": ("ONLINE", "FREE"),
    "Software Testing": ("OFFLINE", "FREE"),
    "Selenium Automation Testing": ("ONLINE", "PAID"),
    "UI/UX Design with Figma": ("ONLINE", "FREE"),
    "Android App Development": ("OFFLINE", "PAID"),
    "Internet of Things (IoT)": ("OFFLINE", "PAID"),
}


class Command(BaseCommand):
    help = "Seed the 30 IT courses and their skill and interest mappings."

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in COURSES:
            course_data = {
                key: value
                for key, value in item.items()
                if key not in ("skills", "interests")
            }

            learning_mode, pricing_type = COURSE_AVAILABILITY[item["name"]]

            course_data.update({
                "learning_mode": learning_mode,
                "pricing_type": pricing_type,
            })


            course, created = Course.objects.update_or_create(
                name=item["name"],
                defaults=course_data,
            )



            if created:
                created_count += 1
            else:
                updated_count += 1

            skill_objects = []
            for skill_name in item["skills"]:
                skill = Skill.objects.filter(
                    name=skill_name,
                    is_active=True
                ).first()

                if not skill:
                    raise ValueError(
                        f"Active skill not found: {skill_name} "
                        f"for course: {course.name}"
                    )

                skill_objects.append(skill)

            interest_objects = []
            for interest_name in item["interests"]:
                interest = Interest.objects.filter(
                    name=interest_name,
                    is_active=True
                ).first()

                if not interest:
                    raise ValueError(
                        f"Active interest not found: {interest_name} "
                        f"for course: {course.name}"
                    )

                interest_objects.append(interest)

            CourseSkill.objects.filter(course=course).delete()
            CourseInterest.objects.filter(course=course).delete()

            CourseSkill.objects.bulk_create([
                CourseSkill(course=course, skill=skill)
                for skill in skill_objects
            ])

            CourseInterest.objects.bulk_create([
                CourseInterest(course=course, interest=interest)
                for interest in interest_objects
            ])

        self.stdout.write(
            self.style.SUCCESS(
                f"Course seeding completed. Created: {created_count}, "
                f"Updated: {updated_count}, Total: {Course.objects.count()}"
            )
        )
