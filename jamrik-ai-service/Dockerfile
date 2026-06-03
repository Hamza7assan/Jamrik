# Use a lightweight Python image
FROM python:3.10-slim

# NEW: Install system dependencies required for PDF generation (pycairo/xhtml2pdf)
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    libcairo2-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install uvicorn to serve the FastAPI application
RUN pip install uvicorn

# Copy the rest of the project files
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the application server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
