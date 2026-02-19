from django.db.models import Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    RESTful CRUD for employees.

    GET    /api/employees/          → list all
    POST   /api/employees/          → create
    GET    /api/employees/{pk}/     → retrieve
    DELETE /api/employees/{pk}/     → delete
    GET    /api/employees/summary/  → dashboard stats
    """

    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total = Employee.objects.count()
        departments = list(
            Employee.objects.values('department')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response({
            'total_employees': total,
            'departments': departments,
        })
