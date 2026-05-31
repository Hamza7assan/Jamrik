import pytest
from fastapi.testclient import TestClient
from main import app, clean_json_response

# Initialize a mock test client to test the API endpoints without starting the actual server
client = TestClient(app)

def test_health_check():
    """
    Test the health check endpoint to ensure the FastAPI server initializes correctly.
    Expected Result: HTTP 200 OK and status 'Online'.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "Online"

def test_clean_json_response_markdown():
    """
    Test the output sanitization utility against Markdown-formatted JSON.
    Expected Result: The function should strip the ```json and ``` tags and return pure JSON.
    """
    dirty_text = "
