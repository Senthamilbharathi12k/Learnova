from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PortfolioResource
from .serializers import PortfolioResourceSerializer


class PortfolioResourceListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.query_params.get("search", "").strip()
        category = request.query_params.get("category", "").strip().upper()

        valid_categories = dict(PortfolioResource.CATEGORY_CHOICES)

        if category and category not in valid_categories:
            return Response(
                {"error": "Invalid category."},
                status=400
            )

        resources = PortfolioResource.objects.filter(is_active=True)

        if search:
            from django.db.models import Q

            resources = resources.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )

        if category:
            resources = resources.filter(category=category)

        serializer = PortfolioResourceSerializer(resources, many=True)

        return Response({
            "message": "Portfolio resources retrieved successfully.",
            "total_resources": resources.count(),
            "resources": serializer.data
        })
