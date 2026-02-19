from django.db import models


class Employee(models.Model):
    class Department(models.TextChoices):
        ENGINEERING = 'Engineering', 'Engineering'
        HR = 'HR', 'HR'
        FINANCE = 'Finance', 'Finance'
        MARKETING = 'Marketing', 'Marketing'
        OPERATIONS = 'Operations', 'Operations'
        SALES = 'Sales', 'Sales'
        SUPPORT = 'Support', 'Support'
        DESIGN = 'Design', 'Design'

    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100, choices=Department.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
