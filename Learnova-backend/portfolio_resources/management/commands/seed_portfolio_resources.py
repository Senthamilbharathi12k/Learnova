from django.core.management.base import BaseCommand
from portfolio_resources.models import PortfolioResource


RESOURCES = [
    {
        "title": "GitHub Pages",
        "category": "DEVELOPER_PORTFOLIO",
        "access": "Free",
        "description": "Host a personal developer portfolio website directly from a GitHub repository.",
        "features": ["Static website hosting", "GitHub integration", "Custom domain support"],
        "url": "https://pages.github.com/",
    },
    {
        "title": "Vercel",
        "category": "DEVELOPER_PORTFOLIO",
        "access": "Free and Paid",
        "description": "Deploy portfolio websites and frontend projects with a simple development workflow.",
        "features": ["Quick deployments", "Git integration", "Custom domains"],
        "url": "https://vercel.com/",
    },
    {
        "title": "Netlify",
        "category": "DEVELOPER_PORTFOLIO",
        "access": "Free and Paid",
        "description": "Publish personal websites and projects with deployment and hosting tools.",
        "features": ["Website deployment", "Git integration", "Custom domains"],
        "url": "https://www.netlify.com/",
    },
    {
        "title": "WordPress",
        "category": "WEBSITE_BUILDER",
        "access": "Free and Paid",
        "description": "Create a personal portfolio website using themes, pages and website-building tools.",
        "features": ["Website themes", "Page editor", "Portfolio layouts"],
        "url": "https://wordpress.com/",
    },
    {
        "title": "Wix",
        "category": "WEBSITE_BUILDER",
        "access": "Free and Paid",
        "description": "Build a portfolio website using customizable templates and a visual editor.",
        "features": ["Portfolio templates", "Visual editor", "Website customization"],
        "url": "https://www.wix.com/",
    },
    {
        "title": "Behance",
        "category": "DESIGN_PORTFOLIO",
        "access": "Free",
        "description": "Showcase creative projects, graphic design work, UI designs and visual case studies.",
        "features": ["Creative project showcase", "Design inspiration", "Community discovery"],
        "url": "https://www.behance.net/",
    },
    {
        "title": "Dribbble",
        "category": "DESIGN_PORTFOLIO",
        "access": "Free and Paid",
        "description": "Share visual design work, UI concepts and creative design projects.",
        "features": ["Design showcase", "Creative inspiration", "Designer community"],
        "url": "https://dribbble.com/",
    },
    {
        "title": "Adobe Portfolio",
        "category": "DESIGN_PORTFOLIO",
        "access": "Paid plan required",
        "description": "Create a professional portfolio website to present photography and design work.",
        "features": ["Portfolio layouts", "Project galleries", "Customizable pages"],
        "url": "https://portfolio.adobe.com/",
    },
    {
        "title": "Notion",
        "category": "PORTFOLIO_TEMPLATES",
        "access": "Free and Paid",
        "description": "Organize projects, skills, achievements and links into a shareable portfolio page.",
        "features": ["Portfolio templates", "Project organization", "Shareable pages"],
        "url": "https://www.notion.so/",
    },
    {
        "title": "Canva Website Builder",
        "category": "PORTFOLIO_TEMPLATES",
        "access": "Free and Paid",
        "description": "Create a simple visual portfolio website using customizable templates.",
        "features": ["Ready-made templates", "Visual customization", "Website publishing"],
        "url": "https://www.canva.com/websites/",
    },
    {
        "title": "GitHub",
        "category": "DEVELOPER_PORTFOLIO",
        "access": "Free and Paid",
        "description": "Showcase source code, projects, contributions and technical skills through repositories.",
        "features": ["Project repositories", "README documentation", "Contribution history"],
        "url": "https://github.com/",
    },
    {
        "title": "Portfolio Inspiration",
        "category": "LEARNING_INSPIRATION",
        "access": "Free",
        "description": "Explore portfolio examples and ideas to plan your own professional presentation.",
        "features": ["Portfolio examples", "Layout inspiration", "Design ideas"],
        "url": "https://www.awwwards.com/websites/portfolio/",
    },
]


class Command(BaseCommand):
    help = "Seed Learnova portfolio resources"

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in RESOURCES:
            title = item["title"]

            _, created = PortfolioResource.objects.update_or_create(
                title=title,
                defaults=item
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Portfolio resources seeded. Created: {created_count}, Updated: {updated_count}, Total: {PortfolioResource.objects.count()}"
            )
        )
