import pytesseract
from PIL import Image
import os
import json
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Q
from .models import Document

# Specify Tesseract executable path (Windows only)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@csrf_exempt
def upload_document(request):
    """
    Handles document uploads, performs OCR on image files,
    and extracts text. Saves metadata and extracted text in the database.
    """
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        file_name = default_storage.save(f'documents/{file.name}', file)

        # Perform OCR if the file is an image (JPG, PNG)
        file_path = default_storage.path(file_name)
        extracted_text = ""
        metadata = {}

        try:
            if file.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                image = Image.open(file_path)
                extracted_text = pytesseract.image_to_string(image)
                metadata['format'] = 'image'
            elif file.name.lower().endswith('.pdf'):
                extracted_text = "PDF processing to be implemented."
                metadata['format'] = 'pdf'
            else:
                metadata['format'] = 'unknown'
        except Exception as e:
            return JsonResponse({'error': f'OCR processing failed: {str(e)}'}, status=500)

        # Determine document type based on extracted text (basic logic)
        if 'invoice' in extracted_text.lower():
            document_type = 'Invoice'
        elif 'certificate' in extracted_text.lower():
            document_type = 'Certificate'
        else:
            document_type = 'General Document'

        # Save document and extracted text
        document = Document.objects.create(
            file=file_name,
            extracted_text=extracted_text,
            document_type=document_type,
            metadata=metadata
        )

        return JsonResponse({
            'message': 'File uploaded and processed successfully',
            'document_id': str(document.id),
            'extracted_text': extracted_text,
            'metadata': metadata
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt
def document_stats(request):
    """
    Provides statistics on uploaded documents.
    Returns total document count and count per document type.
    """
    total_documents = Document.objects.count()
    document_types = (
        Document.objects.values('document_type')
        .annotate(count=Count('document_type'))
        .order_by('-count')
    )

    return JsonResponse({
        'total_documents': total_documents,
        'document_types': list(document_types),
    })


@csrf_exempt
def search_documents(request):
    """
    Searches documents based on query text.
    Looks for matches in the 'extracted_text' field.
    """
    query = request.GET.get('q', '').strip()
    if not query:
        return JsonResponse({'error': 'Search query is required'}, status=400)

    documents = Document.objects.filter(Q(extracted_text__icontains=query))

    results = [
        {
            'id': str(doc.id),
            'file': doc.file.url,
            'text': doc.extracted_text[:200],  # Returning first 200 characters
            'uploaded_at': doc.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
        }
        for doc in documents
    ]

    return JsonResponse({'results': results})
