package com.example.demo.controllers;

import com.example.demo.services.AiProxyService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import com.example.demo.services.ShipmentService;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiProxyController {

    private final AiProxyService aiProxyService;
    private final ShipmentService shipmentService;

    public AiProxyController(AiProxyService aiProxyService, ShipmentService shipmentService) {
        this.aiProxyService = aiProxyService;
        this.shipmentService = shipmentService;
    }

    // DTO class to guarantee perfect JSON mapping (Best Practice)
    public static class AiRequest {
        @com.fasterxml.jackson.annotation.JsonProperty("product_name")
        private String product_name;
        
        @com.fasterxml.jackson.annotation.JsonProperty("description")
        private String description;

        public String getProduct_name() { return product_name; }
        public void setProduct_name(String product_name) { this.product_name = product_name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    @PostMapping("/predict-hs-code")
    public ResponseEntity<String> predictHsCode(@RequestBody AiRequest payload) {
        
        // Print the incoming data to the terminal for debugging
        System.out.println("---- AI REQUEST RECEIVED FROM FRONTEND ----");
        System.out.println("Product Name: " + payload.getProduct_name());
        System.out.println("Description: " + payload.getDescription());

        // Validate that the data is not null
        if (payload.getProduct_name() == null || payload.getDescription() == null) {
            return ResponseEntity.badRequest().body("Error: Data didn't map correctly. Check Java terminal.");
        }

        // Send to Python AI Service
        String result = aiProxyService.getHsCode(payload.getProduct_name(), payload.getDescription());
        if (result != null && (result.contains("\"error\":") || result.contains("\"detail\":"))) {
            return ResponseEntity.status(503).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/validate-two-invoices", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> validateTwoInvoices(
            @RequestParam("invoice_1") MultipartFile invoice1,
            @RequestParam("invoice_2") MultipartFile invoice2) {
        try {
            String result = aiProxyService.forwardFilesToAI(invoice1, invoice2);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("{\"detail\": \"Failed to read file bytes\"}");
        }
    }

    @PostMapping("/generate-declaration")
    public ResponseEntity<String> generateDeclaration(@RequestParam("referenceNumber") String referenceNumber) {
        List<com.example.demo.classes.Document> docs = shipmentService.searchDocs(referenceNumber);
        if (docs == null || docs.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"detail\": \"No documents found for this shipment.\"}");
        }
        String result = aiProxyService.generateFullDeclarationProxy(docs);
        return ResponseEntity.ok(result);
     }

    @PostMapping("/analyze-documents")
    public ResponseEntity<String> analyzeDocuments(@RequestParam("referenceNumber") String referenceNumber) {
        List<com.example.demo.classes.Document> docs = shipmentService.searchDocs(referenceNumber);
        if (docs == null || docs.isEmpty()) {
            return ResponseEntity.badRequest().body("{\"detail\": \"No documents found for this shipment.\"}");
        }
        String result = aiProxyService.analyzeDocumentsProxy(docs);
        return ResponseEntity.ok(result);
    }
}