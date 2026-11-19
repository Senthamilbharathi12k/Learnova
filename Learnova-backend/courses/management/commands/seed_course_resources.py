
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from courses.models import Course, CourseResource


RESOURCES = [
    {
        "course_id": 29,
        "free": {
            "title": "Learn Python Programming",
            "provider": "CodeChef",
            "url": "https://www.codechef.com/learn/python",
            "description": (
                "Python learning path. Some lessons are available "
                "for free preview. Full access and course certificate "
                "may require CodeChef Pro."
            ),
        },
        "paid": {
            "title": "Complete Python Bootcamp",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/complete-python-bootcamp/",
            "description": (
                "Paid Python programming course. Price may vary "
                "by region and promotional offers. Check the provider page."
            ),
        },
    },
    {
        "course_id": 30,
        "free": {
            "title": "Learn Java",
            "provider": "CodeChef",
            "url": "https://www.codechef.com/learn/course/java",
            "description": (
                "Java programming course. Some lessons are available "
                "for free preview. Full access and certificate may "
                "require CodeChef Pro."
            ),
        },
        "paid": {
            "title": "Java Programming for Complete Beginners",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/java-programming-complete-beginner-to-advanced/",
            "description": (
                "Paid Java programming course. Price may vary "
                "by region and promotional offers. Check the provider page."
            ),
        },
    },
    {
        "course_id": 31,
        "free": {
            "title": "Learn C Programming",
            "provider": "CodeChef",
            "url": "https://www.codechef.com/learn/course/c",
            "description": (
                "C programming course. Some lessons are available "
                "for free preview. Full access and certificate may "
                "require CodeChef Pro."
            ),
        },
        "paid": {
            "title": "C Programming for Beginners",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/c-programming-for-beginners-/",
            "description": (
                "Paid C programming course. Price may vary "
                "by region and promotional offers. Check the provider page."
            ),
        },
    },
    {
        "course_id": 32,
        "free": {
            "title": "Learn C++",
            "provider": "CodeChef",
            "url": "https://www.codechef.com/learn/cpp",
            "description": (
                "C++ learning path. Some lessons are available "
                "for free preview. Full access and certificate may "
                "require CodeChef Pro."
            ),
        },
        "paid": {
            "title": "Beginning C++ Programming - From Beginner to Beyond",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/beginning-c-plus-plus-programming/",
            "description": (
                "Paid C++ programming course. Price may vary "
                "by region and promotional offers. Check the provider page."
            ),
        },
    },
    {
        "course_id": 33,
        "free": {
            "title": "Learn JavaScript",
            "provider": "CodeChef",
            "url": "https://www.codechef.com/learn/javascript",
            "description": (
                "JavaScript learning path. Some lessons are available "
                "for free preview. Full access and certificate may "
                "require CodeChef Pro."
            ),
        },
        "paid": {
            "title": "JavaScript - The Complete Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/",
            "description": (
                "Paid JavaScript course from beginner to advanced. "
                "Price may vary by region and promotional offers. "
                "Check the provider page."
            ),
        },
    },

    {
        "course_id": 34,
        "free": {
            "title": "Learn HTML and CSS",
            "provider": "MDN",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development",
            "description": "Free structured web development curriculum covering HTML and CSS fundamentals.",
        },
        "paid": {
            "title": "Complete Guide in HTML and CSS",
            "provider": "Udemy",
            "url": "https://www.udemy.com/frontends-course-landing-page/en/course/complete-guide-in-html-css-build-responsive-website/",
            "description": "Paid HTML and CSS course with practical website-building lessons. Price may vary by region and offers.",
        },
    },
    {
        "course_id": 35,
        "free": {
            "title": "Learn React",
            "provider": "React",
            "url": "https://react.dev/learn",
            "description": "Free official React learning guide covering components, props, state and interactive interfaces.",
        },
        "paid": {
            "title": "React - The Complete Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
            "description": "Paid React course covering React, Hooks, Redux, routing and Next.js. Price may vary.",
        },
    },
    {
        "course_id": 36,
        "free": {
            "title": "Learn Node.js",
            "provider": "Node.js",
            "url": "https://nodejs.org/learn",
            "description": "Free official Node.js learning resources covering installation, JavaScript runtime, HTTP and APIs.",
        },
        "paid": {
            "title": "NodeJS - The Complete Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/nodejs-the-complete-guide/",
            "description": "Paid Node.js course covering REST APIs, authentication, databases and backend development. Price may vary.",
        },
    },
    {
        "course_id": 37,
        "free": {
            "title": "Getting Started with Django",
            "provider": "Django Software Foundation",
            "url": "https://www.djangoproject.com/start/",
            "description": "Free official Django getting-started guide and first application tutorial.",
        },
        "paid": {
            "title": "Python and Django - Complete Django Web Development Course",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/python-django-the-complete-django-web-development-course/",
            "description": "Paid Django web development course covering Python and building web applications. Price may vary.",
        },
    },
    {
        "course_id": 38,
        "free": {
            "title": "Certified Full-Stack Developer Curriculum",
            "provider": "freeCodeCamp",
            "url": "https://www.freecodecamp.org/learn/full-stack-developer-v9",
            "description": "Free full-stack developer curriculum with exercises, projects and certification requirements.",
        },
        "paid": {
            "title": "The Complete Full-Stack Web Development Bootcamp",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
            "description": "Paid full-stack course covering HTML, CSS, JavaScript, React, Node.js and database concepts. Price may vary.",
        },
    },
            {
        "course_id": 39,
        "free": {
            "title": "Free SQL Course - Oracle Dev Gym",
            "provider": "Oracle Dev Gym",
            "url": "https://devgym.oracle.com/pls/apex/dg/class/databases-for-developers-foundations.html",
            "description": "Free SQL bootcamp covering database fundamentals, SQL queries, tutorials and quizzes. Free certificate available on completion."
        },
        "paid": {
            "title": "The Complete SQL Bootcamp",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
            "description": "Paid SQL course covering queries, joins, database operations and practical SQL exercises. Price varies; check provider page."
        }
    },
    {
        "course_id": 40,
        "free": {
            "title": "MySQL Official Tutorial",
            "provider": "MySQL",
            "url": "https://dev.mysql.com/doc/refman/26.10/en/tutorial.html",
            "description": "Free official MySQL tutorial covering database creation, tables and SQL operations. Documentation-based learning resource."
        },
        "paid": {
            "title": "The Complete MySQL Developer Course",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/the-complete-mysql-developer-course/",
            "description": "Paid MySQL course covering database development and web application database operations. Price varies; check provider page."
        }
    },
    {
        "course_id": 41,
        "free": {
            "title": "MongoDB Overview - Free Skill Course",
            "provider": "MongoDB University",
            "url": "https://learn.mongodb.com/courses/mongodb-overview",
            "description": "Free MongoDB skill course covering document models, database architecture and fundamentals. Free skill badge available after completing the skill check."
        },
        "paid": {
            "title": "MongoDB - The Complete Developer's Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/mongodb-the-complete-developers-guide/",
            "description": "Paid MongoDB course covering CRUD operations, indexes, aggregation and application development. Price varies; check provider page."
        }
    },
    {
        "course_id": 42,
        "free": {
            "title": "Kaggle Data Analytics Learning",
            "provider": "Kaggle",
            "url": "https://www.kaggle.com/learn",
            "description": "Free practical learning resources for data analysis, data visualization and working with datasets. Check individual course topics."
        },
        "paid": {
            "title": "Complete Data Analyst Bootcamp From Basics To Advanced",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/complete-data-analyst-bootcamp-from-basics-to-advanced/",
            "description": "Paid data analytics bootcamp covering Python, statistics, SQL, Excel, Power BI and data visualization. Price varies; check provider page."
        }
    },
    {
        "course_id": 43,
        "free": {
            "title": "Prepare and Visualize Data with Power BI",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/training/paths/prepare-visualize-data-power-bi/",
            "description": "Free Microsoft learning path covering Power BI, data preparation, Power Query and interactive reports."
        },
        "paid": {
            "title": "Microsoft Power BI - Complete Introduction",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/powerful-reports-and-dashboards-with-microsoft-powerbi/",
            "description": "Paid Power BI course covering data transformation, visualization, dashboards and reporting. Price varies; check provider page."
        }
    },

    {
        "course_id": 44,
        "free": {
            "title": "Data Science Learning - Kaggle",
            "provider": "Kaggle",
            "url": "https://www.kaggle.com/learn",
            "description": "Free practical courses covering Python, data visualization, machine learning and data science. Course certificates are available for eligible Kaggle Learn courses."
        },
        "paid": {
            "title": "The Data Science Course - Complete Data Science Bootcamp",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/the-data-science-course-complete-data-science-bootcamp/",
            "description": "Paid data science bootcamp covering mathematics, statistics, Python, machine learning and deep learning. Price varies; check provider page."
        }
    },
    {
        "course_id": 45,
        "free": {
            "title": "Machine Learning Crash Course",
            "provider": "Google",
            "url": "https://developers.google.com/machine-learning/crash-course",
            "description": "Free practical machine learning course with videos, interactive visualizations and exercises."
        },
        "paid": {
            "title": "Machine Learning A-Z",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/machinelearning/",
            "description": "Paid machine learning course covering supervised learning, unsupervised learning, deep learning, Python, R and AWS. Price varies; check provider page."
        }
    },
    {
        "course_id": 46,
        "free": {
            "title": "Practical Deep Learning for Coders",
            "provider": "fast.ai",
            "url": "https://course.fast.ai/",
            "description": "Free practical deep learning course covering computer vision, NLP, tabular analysis and model deployment. Some coding experience is recommended."
        },
        "paid": {
            "title": "Deep Learning A-Z",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/deeplearning/",
            "description": "Paid deep learning course covering neural networks, CNNs, RNNs, autoencoders and Python. Price varies; check provider page."
        }
    },
    {
        "course_id": 47,
        "free": {
            "title": "Elements of AI - Introduction to AI",
            "provider": "University of Helsinki",
            "url": "https://www.elementsofai.com/",
            "description": "Free introductory AI course created by the University of Helsinki and MinnaLearn. Covers AI concepts, possibilities and limitations."
        },
        "paid": {
            "title": "AI A-Z - Artificial Intelligence Course",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/artificial-intelligence-az/",
            "description": "Paid AI course covering artificial intelligence, machine learning, generative AI and practical AI projects. Price varies; check provider page."
        }
    },
    {
        "course_id": 48,
        "free": {
            "title": "Introduction to Cybersecurity",
            "provider": "Cisco Networking Academy",
            "url": "https://www.netacad.com/courses/introduction-to-cybersecurity",
            "description": "Free self-paced cybersecurity course covering security fundamentals, threats, vulnerabilities and protection."
        },
        "paid": {
            "title": "Complete Introduction to Cybersecurity 2026",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/complete-introduction-to-cybersecurity/",
            "description": "Paid beginner cybersecurity course covering IT fundamentals, cybersecurity concepts, attacks and defenses. Price varies; check provider page."
        }
    },

    {
        "course_id": 49,
        "free": {
            "title": "Ethical Hacking - Free Practice Rooms",
            "provider": "TryHackMe",
            "url": "https://tryhackme.com/free-rooms",
            "description": "Free cybersecurity practice rooms covering ethical hacking, web security and security fundamentals. Only selected rooms are free; some learning paths require Premium. Practise only in authorized labs."
        },
        "paid": {
            "title": "Learn Ethical Hacking From Scratch",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/",
            "description": "Paid ethical hacking course covering Kali Linux, penetration testing, networking and security tools. Price varies; check provider page. Use techniques only in authorized environments."
        }
    },
    {
        "course_id": 50,
        "free": {
            "title": "AWS Skill Builder - Free Digital Training",
            "provider": "Amazon Web Services",
            "url": "https://aws.amazon.com/training/digital/",
            "description": "Free AWS digital training resources covering cloud computing, AWS services and practical cloud skills. Some advanced learning features require a subscription."
        },
        "paid": {
            "title": "Ultimate AWS Certified Cloud Practitioner CLF-C02",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/",
            "description": "Paid AWS cloud computing and certification preparation course covering cloud concepts and AWS services. Price varies; check provider page."
        }
    },
    {
        "course_id": 51,
        "free": {
            "title": "Microsoft Learn - Azure Training",
            "provider": "Microsoft Learn",
            "url": "https://learn.microsoft.com/en-us/training/azure/",
            "description": "Free Microsoft Azure learning paths covering cloud infrastructure, architecture, services and administration."
        },
        "paid": {
            "title": "Master Microsoft Azure Fundamentals - AZ-900",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/az900-azure/",
            "description": "Paid Azure fundamentals course covering cloud concepts, Azure services, architecture and AZ-900 exam preparation. Price varies; check provider page."
        }
    },
    {
        "course_id": 52,
        "free": {
            "title": "Docker Official Getting Started",
            "provider": "Docker",
            "url": "https://docs.docker.com/get-started/",
            "description": "Free official Docker tutorials covering containers, images, Docker installation and containerized applications."
        },
        "paid": {
            "title": "Docker and Kubernetes - The Complete Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
            "description": "Paid hands-on course covering Docker, Kubernetes, container deployment and development workflows. Price varies; check provider page."
        }
    },
    {
        "course_id": 53,
        "free": {
            "title": "GitHub Skills - Free Interactive Courses",
            "provider": "GitHub",
            "url": "https://skills.github.com/",
            "description": "Free interactive GitHub learning courses covering repositories, branches, pull requests and collaboration."
        },
        "paid": {
            "title": "Git & GitHub - The Practical Guide",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/git-github-practical-guide/",
            "description": "Paid Git and GitHub course covering commits, branches, merging, rebasing, pull requests and collaboration. Price varies; check provider page."
        }
    },

    {
        "course_id": 54,
        "free": {
            "title": "Free Software Testing Courses",
            "provider": "Great Learning Academy",
            "url": "https://www.mygreatlearning.com/software-testing/free-courses",
            "description": "Free software testing learning courses covering testing fundamentals, manual testing, automation testing, Selenium and API testing. Certificate terms may vary by course."
        },
        "paid": {
            "title": "The Complete 2026 Software Testing Bootcamp",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/testerbootcamp/",
            "description": "Paid software testing bootcamp covering manual testing, test cases, Agile, API testing, Selenium and performance testing. Includes a Udemy certificate of completion. Price varies."
        }
    },
    {
        "course_id": 55,
        "free": {
            "title": "Selenium Official Getting Started Guide",
            "provider": "Selenium",
            "url": "https://www.selenium.dev/documentation/webdriver/getting_started/",
            "description": "Free official Selenium WebDriver documentation covering installation, browser automation and writing your first automation script."
        },
        "paid": {
            "title": "Selenium WebDriver with Java - Basics to Advanced",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/selenium-real-time-examplesinterview-questions/",
            "description": "Paid Selenium automation course covering Java, WebDriver, automation frameworks and practical examples. Price varies; check provider page."
        }
    },
    {
        "course_id": 56,
        "free": {
            "title": "Figma Design for Beginners",
            "provider": "Figma",
            "url": "https://help.figma.com/hc/en-us/sections/30880632542743-Figma-Design-for-beginners",
            "description": "Free beginner course covering frames, shapes, auto layout, components, responsive design and prototyping. Uses features available on Figma Starter plan."
        },
        "paid": {
            "title": "Figma UI UX Design Essentials",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/",
            "description": "Paid Figma UI/UX course covering wireframes, user experience, interface design, components and interactive prototypes. Includes certificate of completion. Price varies."
        }
    },
    {
        "course_id": 57,
        "free": {
            "title": "Android Basics with Compose",
            "provider": "Android Developers",
            "url": "https://developer.android.com/courses",
            "description": "Free official Android training covering Kotlin, Jetpack Compose, app architecture, UI development and building Android applications."
        },
        "paid": {
            "title": "The Complete Android Development Course with Kotlin",
            "provider": "Udemy",
            "url": "https://www.udemy.com/en/course/kotlin-masterclass-learn-kotlin-from-zero-to-advanced/",
            "description": "Paid Android development course covering Kotlin, Jetpack Compose, Firebase, Room and building practical Android applications. Includes certificate of completion. Price varies."
        }
    },
    {
        "course_id": 58,
        "free": {
            "title": "Learn Internet of Things",
            "provider": "Microsoft",
            "url": "https://dotnet.microsoft.com/en-us/learn/iot",
            "description": "Free IoT tutorials, courses and learning resources covering Internet of Things concepts and development."
        },
        "paid": {
            "title": "Complete Internet of Things - IoT Course",
            "provider": "Udemy",
            "url": "https://www.udemy.com/course/introduction-to-iot-and-its-components/",
            "description": "Paid IoT course covering IoT fundamentals, components, architecture and practical examples. Price varies; check provider page."
        }
    },


]


class Command(BaseCommand):
    help = "Seed Free and Paid resources for the first five courses."

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in RESOURCES:
            try:
                course = Course.objects.get(
                    id=item["course_id"],
                    is_active=True,
                )
            except Course.DoesNotExist:
                raise CommandError(
                    f"Active course ID {item['course_id']} not found."
                )

            for pricing_type in ("FREE", "PAID"):
                data = item[
                    "free" if pricing_type == "FREE" else "paid"
                ]

                resource = CourseResource.objects.filter(
                    course=course,
                    pricing_type=pricing_type,
                    title=data["title"],
                ).first()

                defaults = {
                    "provider": data["provider"],
                    "external_url": data["url"],
                    "description": data["description"],
                    "price": None,
                    "currency": "INR",
                    "is_active": True,
                }

                if resource:
                    for field, value in defaults.items():
                        setattr(resource, field, value)
                    resource.save()
                    updated_count += 1
                    action = "UPDATED"
                else:
                    CourseResource.objects.create(
                        course=course,
                        title=data["title"],
                        pricing_type=pricing_type,
                        **defaults,
                    )
                    created_count += 1
                    action = "CREATED"

                self.stdout.write(
                    f"{action}: {course.name} - {pricing_type}"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished! Created: {created_count}, "
                f"Updated: {updated_count}"
            )
        )
