import pytesseract
from PIL import Image
import os
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Document

# Specify Tesseract executable path (Windows only)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@csrf_exempt
def upload_document(request):
    if request.method == 'POST' and request.FILES.get('file'):
        file = request.FILES['file']
        file_name = default_storage.save(f'documents/{file.name}', file)

        # Perform OCR if the file is an image (JPG, PNG)
        file_path = default_storage.path(file_name)
        extracted_text = ""
        
        try:
            if file.name.lower().endswith(('.png', '.jpg', '.jpeg')):
                image = Image.open(file_path)
                extracted_text = pytesseract.image_to_string(image)
            elif file.name.lower().endswith('.pdf'):
                extracted_text = "PDF processing to be implemented."
        except Exception as e:
            return JsonResponse({'error': f'OCR processing failed: {str(e)}'}, status=500)

        # Save document and extracted text
        document = Document.objects.create(file=file_name, extracted_text=extracted_text)

        return JsonResponse({
            'message': 'File uploaded and processed successfully',
            'document_id': str(document.id),
            'extracted_text': extracted_text
        })

    return JsonResponse({'error': 'Invalid request'}, status=400)
