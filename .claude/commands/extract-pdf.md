---
description: Extract tables and images from PDF files using the pdf-extractor skill
argument-hint: [path to PDF file]
allowed-tools:
  - Skill
  - Read
  - Write
  - Bash
---

# PDF Extractor

Extract tables and images from a PDF file.

## Input

PDF file path: $ARGUMENTS

## Instructions

1. First, invoke the Skill tool with skill: "pdf-extractor" to load the PDF extraction capabilities
2. Then use those capabilities to extract tables and/or images from the specified PDF file
3. Save extracted data to appropriate formats (JSON/CSV for tables, PNG for images)

If no file path is provided, ask the user to specify a PDF file to process.
