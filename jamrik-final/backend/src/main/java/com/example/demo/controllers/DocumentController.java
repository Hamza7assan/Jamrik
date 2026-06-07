package com.example.demo.controllers;
import com.example.demo.DTOs.DocumentMetadata;
import com.example.demo.classes.Document;
import com.example.demo.services.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;

//this controller is solely responsible for file uploads, and other file related features
@RestController
//is the url correct or is it just part of the shipments?
@RequestMapping("/jamrik/documents")
public class DocumentController {
    private final DocumentService documentService;
    public DocumentController(DocumentService documentService){
        this.documentService = documentService;
    }
    @PostMapping(value="/upload/{referenceNumber}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocuments(@PathVariable String referenceNumber,
                                @RequestPart(value = "files", required = false) List<MultipartFile> files,
                                @RequestParam(value = "metadata", required = false) String metadataJson) {
        if (files == null || files.isEmpty()) {
           return ResponseEntity.ok("Shipment created without documents.");
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<DocumentMetadata> metadata = mapper.readValue(metadataJson, new TypeReference<List<DocumentMetadata>>() {});
            documentService.processAndSaveDocument(referenceNumber,files,metadata);
            return ResponseEntity.ok("processing started for documents.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to parse metadata JSON.");
        }
    }
    @DeleteMapping("/delete/{referenceNumber}")
    public ResponseEntity<?> deleteDocument(@PathVariable String referenceNumber
            ,@RequestParam String documentName){
         documentService.deleteDocument(referenceNumber,documentName);
         return ResponseEntity.noContent().build();
    }
    @GetMapping("/searchDocument/{referenceNumber}")
    public Optional<Document> searchDocument(@PathVariable String referenceNumber
            ,@RequestParam String documentName){
        return documentService.search(referenceNumber,documentName);
    }
    @PostMapping(value="/uploadOne/{referenceNumber}",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadOneDocument(@PathVariable String referenceNumber,
                                              @RequestParam("file") MultipartFile file,
                                               @RequestParam String fileName,
                                               @RequestParam String fileType){
        return documentService.uploadOneDoc(referenceNumber,file,fileName,fileType);


    }

    @GetMapping("/view/{id}")
    public ResponseEntity<?> viewDocument(@PathVariable Long id) {
        return documentService.viewDocument(id);
    }
}