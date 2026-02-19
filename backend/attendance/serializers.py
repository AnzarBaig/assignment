from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source='employee.full_name', read_only=True
    )
    employee_id_display = serializers.CharField(
        source='employee.employee_id', read_only=True
    )

    class Meta:
        model = Attendance
        fields = [
            'id',
            'employee',
            'employee_name',
            'employee_id_display',
            'date',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        if employee and date:
            existing = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    {"date": f"Attendance for this employee on {date} already exists."}
                )
        return data


class AttendanceSummarySerializer(serializers.Serializer):
    employee_id = serializers.IntegerField(source='employee__id')
    employee_id_display = serializers.CharField(source='employee__employee_id')
    employee_name = serializers.CharField(source='employee__full_name')
    total_present = serializers.IntegerField()
    total_absent = serializers.IntegerField()
