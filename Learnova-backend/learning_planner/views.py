
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import StudentProfile

from .models import LearningPlannerTask
from .serializers import LearningPlannerTaskSerializer


class LearningPlannerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_student(self, user):
        return get_object_or_404(
            StudentProfile,
            user=user
        )

    def get(self, request):
        student = self.get_student(request.user)

        tasks = LearningPlannerTask.objects.filter(
            student=student
        )

        date_filter = request.query_params.get("date")
        status_filter = request.query_params.get("status")

        if date_filter:
            tasks = tasks.filter(date=date_filter)

        if status_filter:
            if status_filter not in ["PENDING", "COMPLETED"]:
                return Response(
                    {"error": "Invalid status."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            tasks = tasks.filter(status=status_filter)

        serializer = LearningPlannerTaskSerializer(
            tasks,
            many=True
        )

        return Response({
            "message": "Planner tasks retrieved successfully.",
            "total_tasks": tasks.count(),
            "tasks": serializer.data
        })

    def post(self, request):
        student = self.get_student(request.user)

        serializer = LearningPlannerTaskSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(student=student)

        return Response({
            "message": "Study task created successfully.",
            "task": serializer.data
        }, status=status.HTTP_201_CREATED)


class LearningPlannerDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_task(self, request, task_id):
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        return get_object_or_404(
            LearningPlannerTask,
            id=task_id,
            student=student
        )

    def get(self, request, task_id):
        task = self.get_task(request, task_id)

        serializer = LearningPlannerTaskSerializer(task)

        return Response({"task": serializer.data})

    def put(self, request, task_id):
        task = self.get_task(request, task_id)

        serializer = LearningPlannerTaskSerializer(
            task,
            data=request.data
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Study task updated successfully.",
            "task": serializer.data
        })

    def patch(self, request, task_id):
        task = self.get_task(request, task_id)

        serializer = LearningPlannerTaskSerializer(
            task,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "message": "Study task updated successfully.",
            "task": serializer.data
        })

    def delete(self, request, task_id):
        task = self.get_task(request, task_id)
        task.delete()

        return Response({
            "message": "Study task deleted successfully."
        }, status=status.HTTP_200_OK)


class LearningPlannerStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        student = get_object_or_404(
            StudentProfile,
            user=request.user
        )

        task = get_object_or_404(
            LearningPlannerTask,
            id=task_id,
            student=student
        )

        new_status = request.data.get("status")

        if new_status not in ["PENDING", "COMPLETED"]:
            return Response({
                "error": "Status must be PENDING or COMPLETED."
            }, status=status.HTTP_400_BAD_REQUEST)

        task.status = new_status
        task.save(update_fields=["status", "updated_at"])

        return Response({
            "message": "Task status updated successfully.",
            "id": task.id,
            "status": task.status
        })
