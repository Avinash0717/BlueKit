# from django.shortcuts import render
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from rest_framework.decorators import api_view, parser_classes # type: ignore
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from typing import Any
from django.shortcuts import get_object_or_404

import re
import os

# Create your views here.

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def comment_remover(request):
    """
    Expects a file upload from frontend as 'file'.
    Removes comments based on file type and returns cleaned file.

    """

    if request.method == "POST":
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        filename = uploaded_file.name
        _, ext = os.path.splitext(filename)

        # Comment patterns for different languages
        COMMENT_PATTERNS = {
                # ".py":   [r"#[^\n]*", r'"""[\s\S]*?"""', r"'''[\s\S]*?'''"], 
                # ".r":    [r"#[^\n]*"],

                # ".c":    [r"//[^\n]*", r"/\*[\s\S]*?\*/"],
                # ".cpp":  [r"//[^\n]*", r"/\*[\s\S]*?\*/"],
                # ".java": [r"//[^\n]*", r"/\*[\s\S]*?\*/"],
                # ".js":   [r"//[^\n]*", r"/\*[\s\S]*?\*/"],
                # ".ts":   [r"//[^\n]*", r"/\*[\s\S]*?\*/"],
                # ".php":  [r"//[^\n]*", r"/\*[\s\S]*?\*/", r"#[^\n]*"],
                # ".rs":   [r"//[^\n]*", r"/\*[\s\S]*?\*/"],

                # ".html": [r"<!--[\s\S]*?-->"],
                # ".css":  [r"/\*[\s\S]*?\*/"],

                ".py":   [r"#[^\n]*", r'"""[\s\S]*?"""', r"'''[\s\S]*?'''"],

                ".r":    [r"#[^\n]*"],

                ".c":    [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],
                ".cpp":  [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],
                ".java": [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],
                ".js":   [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],
                ".ts":   [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],
                ".php":  [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/", r"#[^\n]*"],
                ".rs":   [r"(?<!:)//[^\n]*", r"/\*[\s\S]*?\*/"],

                ".html": [r"<!--[\s\S]*?-->"],
                ".css":  [r"/\*[\s\S]*?\*/"],

            # ".py":   [r"#.*"],                           Python
            # ".r":    [r"#.*"],                           R
            # ".c":    [r"//.*", r"/\*.*?\*/"],            C
            # ".cpp":  [r"//.*", r"/\*.*?\*/"],            C++
            # ".java": [r"//.*", r"/\*.*?\*/"],            Java
            # ".js":   [r"//.*", r"/\*.*?\*/"],            JavaScript
            # ".ts":   [r"//.*", r"/\*.*?\*/"],            TypeScript
            # ".php":  [r"//.*", r"/\*.*?\*/", r"#.*"],    PHP
            # ".rs":   [r"//.*", r"/\*.*?\*/"],            Rust
            # ".html": [r"<!--.*?-->"],                    HTML
            # ".css":  [r"/\*.*?\*/"],                     CSS
        }
        patterns = COMMENT_PATTERNS.get(ext.lower())
        if not patterns:
            return Response({"error": f"Unsupported file type: {ext}"}, status=status.HTTP_400_BAD_REQUEST)

        # Read file content
        code = uploaded_file.read().decode("utf-8")

        # Remove comments
        for pattern in patterns:
            code = re.sub(pattern, "", code, flags=re.DOTALL)

        # Remove extra blank lines
        code = "\n".join(line for line in code.splitlines() if line.strip())

        # Return file back to frontend
        response = HttpResponse(code, content_type="text/plain")
        response["Content-Disposition"] = f'attachment; filename="cleaned_{filename}"'
        return response

    return Response({"error": "Invalid request method"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)