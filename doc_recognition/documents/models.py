import uuid
from django.db import models
from django.utils.timezone import now

class Document(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=100, blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"Document {self.id}"

