from django.db.models import Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Attendance
from .serializers import AttendanceSerializer, AttendanceSummarySerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    RESTful CRUD for attendance.

    GET    /api/attendance/              → list all (filterable)
    POST   /api/attendance/              → mark attendance
    DELETE /api/attendance/{pk}/          → delete
    GET    /api/attendance/summary/       → present/absent per employee

    Query params:
        ?employee={pk}
        ?date=YYYY-MM-DD
        ?status=Present|Absent
    """

    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'date', 'status']
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    @action(detail=False, methods=['get'])
    def summary(self, request):
        data = (
            Attendance.objects.values(
                'employee__id',
                'employee__employee_id',
                'employee__full_name',
            )
            .annotate(
                total_present=Count('id', filter=Q(status='Present')),
                total_absent=Count('id', filter=Q(status='Absent')),
            )
            .order_by('employee__employee_id')
        )
        serializer = AttendanceSummarySerializer(data, many=True)
        return Response(serializer.data)
