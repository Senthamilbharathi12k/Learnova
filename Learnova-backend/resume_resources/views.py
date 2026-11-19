
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ResumeResource
from .serializers import ResumeResourceSerializer


class ResumeResourceListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        search = request.query_params.get("search", "").strip()
        category = request.query_params.get("category", "").strip().upper()
        pricing_type = request.query_params.get("pricing_type", "").strip().upper()

        valid_categories = dict(ResumeResource.CATEGORY_CHOICES)
        valid_pricing_types = dict(ResumeResource.PRICING_CHOICES)

        if category and category not in valid_categories:
            return Response(
                {"error": "Invalid category."},
                status=400
            )

        if pricing_type and pricing_type not in valid_pricing_types:
            return Response(
                {"error": "Invalid pricing_type. Use FREE or PAID."},
                status=400
            )

        resources = ResumeResource.objects.filter(is_active=True)

        if search:
            resources = resources.filter(title__icontains=search)

        if category:
            resources = resources.filter(category=category)

        if pricing_type:
            resources = resources.filter(pricing_type=pricing_type)

        serializer = ResumeResourceSerializer(resources, many=True)

        return Response({
            "message": "Resume resources retrieved successfully.",
            "total_resources": resources.count(),
            "resources": serializer.data
        })
