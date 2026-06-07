package com.example.demo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiProxyService {

    private final RestTemplate restTemplate;

    // Reads the URL from application.properties, defaults to http://localhost:8000 if not found
    @Value("${jamrik.ai-service.base-url:http://localhost:8000}")
    private String aiServiceBaseUrl;

    public AiProxyService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // This is the method the Controller was looking for
   public String getHsCode(String productName, String description) {
        // Using injected baseUrl
        String url = aiServiceBaseUrl + "/api/v1/predict-hs-code-rag";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("product_name", productName);
        requestBody.put("description", description);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            return restTemplate.postForObject(url, request, String.class);
        } catch (HttpStatusCodeException e) {
            // Forward the exact JSON error returned by FastAPI
            return e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"AI Service Unreachable: " + e.getMessage() + "\", \"suggested_hs_code\": null}";
        }
    }

    public String forwardFilesToAI(MultipartFile invoice1, MultipartFile invoice2) throws IOException {
        String url = aiServiceBaseUrl + "/api/v1/validate-two-invoices";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        // Wrap invoice_1
        ByteArrayResource fileResource1 = new ByteArrayResource(invoice1.getBytes()) {
            @Override
            public String getFilename() {
                return invoice1.getOriginalFilename();
            }
        };
        body.add("invoice_1", fileResource1);

        // Wrap invoice_2
        ByteArrayResource fileResource2 = new ByteArrayResource(invoice2.getBytes()) {
            @Override
            public String getFilename() {
                return invoice2.getOriginalFilename();
            }
        };
        body.add("invoice_2", fileResource2);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            // Return the raw JSON error from FastAPI directly to the frontend
            return e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to forward files to AI Service");
        }
    }

    public String generateFullDeclarationProxy(java.util.List<com.example.demo.classes.Document> docs) {
        String url = aiServiceBaseUrl + "/api/v1/generate-full-declaration";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        for (com.example.demo.classes.Document doc : docs) {
            if (doc.getDocumentUrl() != null) {
                try {
                    byte[] fileData = restTemplate.getForObject(doc.getDocumentUrl(), byte[].class);
                    if (fileData != null) {
                        ByteArrayResource fileResource = new ByteArrayResource(fileData) {
                            @Override
                            public String getFilename() {
                                return doc.getDocumentName() != null ? doc.getDocumentName() : "file.pdf";
                            }
                        };
                        body.add("files", fileResource);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to download file from Cloudinary for AI proxy: " + e.getMessage());
                }
            }
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            return e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to forward file to AI Service");
        }
    }

    public String analyzeDocumentsProxy(java.util.List<com.example.demo.classes.Document> docs) {
        String url = aiServiceBaseUrl + "/api/v1/analyze-shipment-documents";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        for (com.example.demo.classes.Document doc : docs) {
            if (doc.getDocumentUrl() != null) {
                try {
                    byte[] fileData = restTemplate.getForObject(doc.getDocumentUrl(), byte[].class);
                    if (fileData != null) {
                        ByteArrayResource fileResource = new ByteArrayResource(fileData) {
                            @Override
                            public String getFilename() {
                                return doc.getDocumentName() != null ? doc.getDocumentName() : "file.pdf";
                            }
                        };
                        body.add("files", fileResource);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to download file from Cloudinary for AI proxy: " + e.getMessage());
                }
            }
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            return e.getResponseBodyAsString();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to forward files to AI Service for auditing");
        }
    }
}