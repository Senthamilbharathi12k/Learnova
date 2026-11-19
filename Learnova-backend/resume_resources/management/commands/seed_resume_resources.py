
from django.core.management.base import BaseCommand
from django.db import transaction

from resume_resources.models import ResumeResource


RESOURCES = [

    # 10 RESUME BUILDERS
    {
        "title": "Reactive Resume",
        "category": "RESUME_BUILDER",
        "description": "Free open-source resume builder with PDF and Word exports.",
        "url": "https://rx.cv/",
    },
    {
        "title": "OpenResume",
        "category": "RESUME_BUILDER",
        "description": "Free open-source resume builder with ATS readability parser.",
        "url": "https://www.open-resume.com/",
    },
    {
        "title": "Resumake",
        "category": "RESUME_BUILDER",
        "description": "Free resume builder with templates and PDF export. No account required.",
        "url": "https://resumake.io/",
    },
    {
        "title": "Resume.com",
        "category": "RESUME_BUILDER",
        "description": "Free resume builder with PDF and text downloads.",
        "url": "https://www.resume.com/",
    },
    {
        "title": "Resumv",
        "category": "RESUME_BUILDER",
        "description": "Free open-source browser-based resume builder with multiple export formats.",
        "url": "https://resumv.com/",
    },
    {
        "title": "NoCapCV",
        "category": "RESUME_BUILDER",
        "description": "Free resume builder with editable templates and unlimited PDF exports.",
        "url": "https://nocapcv.com/",
    },
    {
        "title": "EngineCV",
        "category": "RESUME_BUILDER",
        "description": "Free privacy-focused resume builder with local editing and exports.",
        "url": "https://enginecv.app/",
    },
    {
        "title": "OpenApps Resume",
        "category": "RESUME_BUILDER",
        "description": "Free browser-based resume builder with PDF export.",
        "url": "https://openapps.free/apps/resume",
    },
    {
        "title": "Google Docs Resume Templates",
        "category": "RESUME_BUILDER",
        "description": "Create resumes using free Google Docs templates.",
        "url": "https://docs.google.com/document/u/0/",
    },
    {
        "title": "Microsoft Word Resume Templates",
        "category": "RESUME_BUILDER",
        "description": "Explore free resume templates from Microsoft Word.",
        "url": "https://support.microsoft.com/en-us/word/use-a-template-to-create-a-resume",
    },

    # 5 ATS RESUME CHECKERS
    {
        "title": "ATSPrep Resume Checker",
        "category": "ATS_CHECKER",
        "description": "Check ATS readability, resume score and job-description keyword matches.",
        "url": "https://atsprep.com/",
    },
    {
        "title": "Jobalytics ATS Checker",
        "category": "ATS_CHECKER",
        "description": "Free ATS match score and missing keyword checker.",
        "url": "https://jobalytics.app/free-ats-checker",
    },
    {
        "title": "ResuPals ATS Checker",
        "category": "ATS_CHECKER",
        "description": "Free browser-based ATS parser check without uploading a resume.",
        "url": "https://resupals.com/ats-checker",
    },
    {
        "title": "OpenResume ATS Parser",
        "category": "ATS_CHECKER",
        "description": "Check how resume text is extracted by an ATS-style parser.",
        "url": "https://www.open-resume.com/",
    },
    {
        "title": "SkillSyncer ATS Scanner",
        "category": "ATS_CHECKER",
        "description": "Compare a resume with job descriptions using the free weekly scan allowance.",
        "url": "https://skillsyncer.com/",
    },

    # 5 RESUME GUIDANCE RESOURCES
    {
        "title": "Indeed India ATS Resume Guide",
        "category": "RESUME_GUIDANCE",
        "description": "Learn ATS-friendly resume formatting, keywords and sections.",
        "url": "https://in.indeed.com/career-advice/resumes-cover-letters/ats-resume",
    },
    {
        "title": "Harvard Resume Writing Guide",
        "category": "RESUME_GUIDANCE",
        "description": "Professional resume writing tips, examples and action verbs.",
        "url": "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/",
    },
    {
        "title": "Purdue OWL Resume Guide",
        "category": "RESUME_GUIDANCE",
        "description": "Resume writing guidance, design tips and sample resumes.",
        "url": "https://owl.purdue.edu/owl/job_search_writing/resumes_and_vitas/",
    },
    {
        "title": "MIT Resume Guide",
        "category": "RESUME_GUIDANCE",
        "description": "Learn resume writing, formatting and accomplishment-based descriptions.",
        "url": "https://capd.mit.edu/resources/resumes/",
    },
    {
        "title": "UC Berkeley Resume Guide",
        "category": "RESUME_GUIDANCE",
        "description": "Resume writing guidance, achievements and job-specific tailoring.",
        "url": "https://www.career.berkeley.edu/prepare-for-success/resumes/",
    },
]


class Command(BaseCommand):
    help = "Seed 20 free external resume resources"

    @transaction.atomic
    def handle(self, *args, **options):

        created_count = 0
        updated_count = 0

        for item in RESOURCES:

            resource_data = {
                **item,
                "pricing_type": "FREE",
                "is_active": True,
            }

            _, created = ResumeResource.objects.update_or_create(
                title=item["title"],
                defaults=resource_data,
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Resume resource seeding completed. "
                f"Created: {created_count}, "
                f"Updated: {updated_count}, "
                f"Total: {ResumeResource.objects.count()}"
            )
        )
