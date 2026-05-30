import os
import io
import json
import re
import chromadb
from datetime import datetime
from PIL import Image
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from google import genai
from xhtml2pdf import pisa
from fastapi.responses import FileResponse
import logging

import itertools

# 1 Configuration & Security
load_dotenv()
API_KEYS = [
    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY_6"),
    os.getenv("GEMINI_API_KEY_7"),
]
VALID_KEYS = [key for key in API_KEYS if key]
key_pool = itertools.cycle(VALID_KEYS) if VALID_KEYS else None

def generate_content_with_fallback(model_name: str, contents):
    if not VALID_KEYS:
        raise HTTPException(status_code=500, detail="CRITICAL: No valid Gemini API Keys found in environment.")
    
    # Rotate keys globally per request to balance load and prevent rate limits
    for _ in range(len(VALID_KEYS)):
        current_key = next(key_pool)
        try:
            temp_client = genai.Client(api_key=current_key)
            return temp_client.models.generate_content(model=model_name, contents=contents)
        except Exception as e:
            error_str = str(e).lower()
            if any(err in error_str for err in ["429", "503", "quota", "exhausted", "unavailable", "rate limit"]):
                logging.warning(f"⚠️ API Key failed due to overload/limits. Rotating to next key...")
                continue
            else:
                raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")
                
    raise HTTPException(status_code=503, detail="All AI providers are currently overloaded. Please try again later.")

# 2 Vector Database Connection ---
chroma_client = chromadb.PersistentClient(path="./jamrik_vectordb")
customs_collection = chroma_client.get_or_create_collection(name="jordanian_customs_laws")

app = FastAPI(title="JAMRIK AI Customs Engine - Master Build v4.5.1")
from fastapi.middleware.cors import CORSMiddleware

# Allow Spring Boot (8080) and the Frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 3 Request Models 
class HSCodeRequest(BaseModel):
    product_name: str
    description: str

# 4 Engineering Utilities 
def clean_json_response(text: str):
    if not text: return "{}"
    cleaned = re.sub(r'```json\s*|```', '', text).strip()
    start, end = cleaned.find('{'), cleaned.rfind('}')
    if start != -1 and end != -1:
        return cleaned[start:end+1]
    return cleaned

def create_pdf_multi(data, output_path):
    try:
        if not os.path.exists("declaration_template.html"):
            return False
        with open("declaration_template.html", "r", encoding="utf-8") as f:
            template_content = f.read()
        
        html_filled = template_content
        for key, value in data.items():
            html_filled = html_filled.replace("{{" + " " + key + " " + "}}", str(value))
            html_filled = html_filled.replace("{{" + key + "}}", str(value))
        
        with open(output_path, "wb") as pdf_file:
            pisa.CreatePDF(html_filled, dest=pdf_file)
        return True
    except Exception as e:
        print(f"🔥 PDF Rendering Error: {e}")
        return False


# FEATURE 1: Standalone HS Code Suggestion
@app.post("/api/v1/predict-hs-code-rag")
async def predict_hs_code_rag(request: HSCodeRequest):
    try:
        results = customs_collection.query(
            query_texts=[f"{request.product_name} {request.description}"],
            n_results=3 
        )
        retrieved_context = ""
        for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
            retrieved_context += f"- Law: {doc} | Code: {meta['hs_code']} | Rate: {meta['duty_rate']}%\n"

        prompt = f"""
        Act as a Senior Customs Auditor. Classify:
        Product Name: {request.product_name}
        Description: {request.description}
        [LOCAL CONTEXT]: {retrieved_context if retrieved_context else "No local laws found."}
        STRICT: 11-digit numeric HS Code only (No dots).
        Return ONLY JSON: {{"predicted_hs_code": "string", "duty_rate": "string"}}
        """
        response = generate_content_with_fallback('gemini-2.5-flash', prompt)
        
        try:
            data = json.loads(clean_json_response(response.text))
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"AI response was not valid JSON. Raw output: {response.text}")
        
        clean_hs = re.sub(r'[^0-9]', '', str(data.get("predicted_hs_code")))
        clean_duty = re.sub(r'[^0-9.]', '', str(data.get("duty_rate")))
        if not clean_duty: clean_duty = "5"

        return {"status": "Success", "suggested_hs_code": clean_hs, "duty_rate": f"{clean_duty}%"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# FEATURE 2: Detailed Invoice Extraction
async def extract_invoice_data(file: UploadFile):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    
    prompt = """
    Extract ALL details from this invoice. 
    Return ONLY JSON:
    {
      "supplier": "string",
      "currency": "string",
      "total_amount": float,
      "items": [{"description": "string", "qty": "string", "unit_price": "string", "total": "string"}]
    }
    """
    response = generate_content_with_fallback('gemini-2.5-flash', [prompt, image])
    return json.loads(clean_json_response(response.text))

@app.post("/api/v1/extract-invoice-details")
async def extract_invoice_details(file: UploadFile = File(...)):
    try:
        return await extract_invoice_data(file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FEATURE 4: AI Reconciliation Engine
@app.post("/api/v1/validate-two-invoices")
async def validate_two_invoices(invoice_1: UploadFile = File(...), invoice_2: UploadFile = File(...)):
    try:
        # 1 Extract data from both (Re-using existing logic)
        supplier_data = await extract_invoice_data(invoice_1) 
        internal_data = await extract_invoice_data(invoice_2)
        
        # 2 AI Comparison Engine
        comparison_prompt = f"""
        Act as an expert Customs Reconciliation Auditor. 
        Compare these two JSON datasets representing invoices/records:
        Dataset 1 (Supplier Invoice): {json.dumps(supplier_data)}
        Dataset 2 (Internal Record): {json.dumps(internal_data)}

        Task:
        1. Soft-match items by description (handle naming variations/synonyms).
        2. Compare unit prices, quantities, and totals for matched items.
        3. Detect discrepancies in Supplier Name, Total Amount, or unmatched items.

        Return ONLY a strict JSON structure:
        {{
           "discrepancies": [
              {{"field": "string (e.g., 'Total Amount', 'Quantity - Laptop')", "status": "Match" or "Mismatch", "message": "Detailed explanation of the difference or confirmation of match"}}
           ]
        }}
        Do not include any other text, markdown formatting, or explanation outside the JSON.
        """
        
        response = generate_content_with_fallback('gemini-2.5-flash', comparison_prompt)
        result = json.loads(clean_json_response(response.text))
        
        return {
            "status": "Success",
            "discrepancies": result.get("discrepancies", [])
        }
    except Exception as e:
        print(f"🔥 Reconciliation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# FEATURE 3: Multi-Item PDF Generation
@app.post("/api/v1/generate-full-declaration")
async def generate_full_declaration(files: list[UploadFile] = File(...)):
    try:
        invoice_prompt = """
        Extract: Supplier, Total Amount, Currency, and ALL items.
        Return ONLY JSON: 
        {"supplier": "string", "amount": float, "currency": "string", 
         "items": [{"desc": "string", "qty": "string", "price": "string"}]}
        """
        
        contents = [invoice_prompt]
        
        for file in files:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            contents.append(image)
            
        res = generate_content_with_fallback('gemini-2.5-flash', contents)
        invoice_data = json.loads(clean_json_response(res.text))
        
        items_html_rows = ""

        # --- the clean loop ---
        for item in invoice_data.get("items", []):
            desc = item.get("desc", "Unknown")
            qty = item.get("qty", "1")
            price = item.get("price", "0.0")
            
            # 1 labor check
            is_service = any(x in desc.lower() for x in ["labor", "service", "work", "hrs", "hours"])
            
            if is_service:
                items_html_rows += f"""
                <tr>
                    <td class="col-desc">{desc}</td>
                    <td class="col-qty">{qty}</td>
                    <td class="col-price">{price}</td>
                    <td class="col-hs">SERVICE / LABOR</td>
                    <td class="col-duty">0%</td>
                </tr>
                """
                continue 

            # 2 RAG Search
            db_res = customs_collection.query(query_texts=[desc], n_results=2)
            context = ""
            for d, m in zip(db_res['documents'][0], db_res['metadatas'][0]):
                context += f"- Jordan Law: {d} | Code: {m['hs_code']} | Rate: {m['duty_rate']}%\n"

            # 3 AI Classification
            class_prompt = f"""
            Identify 11-digit HS Code for: "{desc}".
            [CONTEXT]: {context}
            Return ONLY JSON: {{"hs_code": "string", "duty": "string"}}
            """
            c_res = generate_content_with_fallback('gemini-2.5-flash', class_prompt)
            c_data = json.loads(clean_json_response(c_res.text))
            
            # 4  Clean and Build Row
            clean_hs = re.sub(r'[^0-9]', '', str(c_data.get("hs_code", "00000000000")))
            raw_duty = str(c_data.get("duty", "")).strip()
            clean_duty = re.sub(r'[^0-9]', '', raw_duty)
            if not clean_duty: clean_duty = "5"
            
            items_html_rows += f"""
            <tr>
                <td class="col-desc">{desc[:65]}</td>
                <td class="col-qty">{qty}</td>
                <td class="col-price">{price}</td>
                <td class="col-hs">{clean_hs}</td>
                <td class="col-duty">{clean_duty}%</td>
            </tr>
            """

        pdf_payload = {
            "supplier_name": invoice_data.get("supplier"),
            "currency": invoice_data.get("currency"),
            "total_amount": invoice_data.get("amount"),
            "items_table": items_html_rows,
            "date_generated": datetime.now().strftime("%Y-%m-%d %H:%M")
        }
        
        pdf_name = f"declaration_{datetime.now().strftime('%H%M%S')}.pdf"
        os.makedirs("generated_declarations", exist_ok=True)
        pdf_path = os.path.join("generated_declarations", pdf_name)

        if create_pdf_multi(pdf_payload, pdf_path):
            return {"status": "Success", "download_url": f"/api/v1/download/{pdf_name}", "data": pdf_payload}
            
    except Exception as e:
        print(f"🔥 Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analyze-shipment-documents")
async def analyze_shipment_documents(files: list[UploadFile] = File(...)):
    try:
        audit_prompt = """
        Act as an expert Customs Auditor performing an N-way cross-check across the provided trade documents (e.g. Invoices, Airway Bills, Packing Lists, Certificates of Origin).
        Carefully inspect all text and values in the provided document images.
        Cross-check key data fields across all documents, including:
        1. Supplier/Exporter Name
        2. Buyer/Importer Name
        3. Total Invoice Amount & Currency
        4. Quantities & Weights of goods
        5. Descriptions of items
        
        Identify any discrepancies, mismatches, or verified matches.
        For each key field checked, return the field name, its status ("Match" or "Mismatch"), and a detailed explanatory message (including the values found in each document to justify the mismatch or confirm the match).
        
        Return ONLY a strict JSON structure of the following schema:
        {
           "discrepancies": [
              {"field": "string (e.g., 'Supplier Name', 'Total Weight')", "status": "Match" or "Mismatch", "message": "Detailed description of cross-check results"}
           ]
        }
        Do not include any other text, markdown formatting, or explanation outside the JSON.
        """
        
        contents = [audit_prompt]
        
        for file in files:
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            contents.append(image)
            
        res = generate_content_with_fallback('gemini-2.5-flash', contents)
        
        try:
            result = json.loads(clean_json_response(res.text))
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"AI response was not valid JSON. Raw output: {res.text}")
            
        return result
    except Exception as e:
        print(f"🔥 Audit Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/download/{filename}")
async def download_declaration(filename: str):
    file_path = os.path.join("generated_declarations", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='application/pdf', filename=filename)
    raise HTTPException(status_code=404, detail="File not found.")

@app.get("/health")
async def health_check():
    return {"status": "Online", "version": "4.5.1-FINAL"}