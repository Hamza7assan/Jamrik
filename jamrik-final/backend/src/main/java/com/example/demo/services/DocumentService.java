package com.example.demo.services;
import com.example.demo.DTOs.DocumentMetadata;
import com.example.demo.classes.Document;
import com.example.demo.classes.Shipment;
import com.example.demo.repositories.DocumentRepository;
import com.example.demo.repositories.ShipmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

//this class handles the document upload, data extraction, and passing to AI
@Service
public class DocumentService {

    private final DocumentRepository documentRepo;
    //this line is to associate each document with its parent shipment
    private final ShipmentRepository shipmentRepo;
    //bean from doc AI service to handle doc processing
    private final HSCodeAIService aiService;
    private final Cloudinary cloudinary;
    public DocumentService(DocumentRepository documentRepo,
                           ShipmentRepository shipmentRepo,
                           HSCodeAIService  aiService,
                           Cloudinary cloudinary) {
        this.documentRepo=documentRepo;
        this.shipmentRepo=shipmentRepo;
        this.aiService=aiService;
        this.cloudinary=cloudinary;
    }
    //this method receives the document with its shipment id
    @Transactional
    //this method takes a shipments reference number,list of docs,and doc metadata
     public ResponseEntity<?> processAndSaveDocument(String referenceNumber,
                                            List<MultipartFile> files,
                                            List<DocumentMetadata> metadata){
        //checking whether the requested shipment is within the db
        Shipment shipment=shipmentRepo.findByReferenceNumber(referenceNumber)
                .orElseThrow(()-> new RuntimeException("Shipment not found"));
        //new empty list to store extracted text from all docs
        List<String> allExtractedTexts=new ArrayList<>();
        for (int i=0;i<files.size();i++) {
            MultipartFile file = files.get(i);
            DocumentMetadata meta = metadata.get(i);
            
            String originalFilename = file.getOriginalFilename();
            if (originalFilename != null) {
                String lower = originalFilename.toLowerCase();
                if (!lower.endsWith(".pdf")) {
                    return ResponseEntity.status(400).body("Please upload PDF files only");
                }
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.status(400).body("Please upload a file smaller than 10MB");
            }

            String rawText = "";
            try {
                if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
                    //calling the method responsible for extracting text
                    rawText = extractTextFromDocument(file);
                }
            } catch (IOException e) {
                    System.err.println("Failed to extract text from: " + meta.name());
                }
                //create new doc object
                Document document = new Document();
                //link the document with its shipment
                document.setShipment(shipment);
                //setting the document's name from the user
                document.setDocumentName(meta.name());
                //COO, PL, AB?
                document.setDocumentType(meta.type());
                //store the new document in the list of documents in the shipment class
                shipment.addDocument(document);
                //save the content of the doc in the db table
                document.setContent(rawText);
                try {
                    Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                    document.setDocumentUrl(uploadResult.get("secure_url").toString());
                    document.setDocumentPublicId(uploadResult.get("public_id").toString());
                    document.setContentType(file.getContentType());
                } catch (IOException e) {
                    System.err.println("Failed to upload file to Cloudinary: " + e.getMessage());
                }
                //save the new document in the document table
                documentRepo.save(document);
                //adding the extracted text from current file to the list
                if (!rawText.isEmpty()) {
                    allExtractedTexts.add(rawText);
                }
        }
        return ResponseEntity.ok("upload successful");
        }

     public String extractTextFromDocument(MultipartFile file) throws IOException {
         try (org.apache.pdfbox.pdmodel.PDDocument document=
                      org.apache.pdfbox.Loader.loadPDF(file.getBytes())) {
             org.apache.pdfbox.text.PDFTextStripper stripper=new org.apache
                     .pdfbox.text.PDFTextStripper();
             return stripper.getText(document);
         }
     }
     public void deleteDocument(String referenceNumber,String documentName){
        Document document=documentRepo.findByDocumentName(referenceNumber,documentName)
                .orElseThrow(()->new RuntimeException("Document not found"));
        try {
            if (document.getDocumentPublicId() != null) {
                cloudinary.uploader().destroy(document.getDocumentPublicId(), ObjectUtils.emptyMap());
            }
        } catch (IOException e) {
            System.err.println("Failed to delete file from Cloudinary: " + e.getMessage());
        }
        Shipment shipment=document.getShipment();
        if(shipment!=null)
            shipment.deleteDocument(document);
        documentRepo.delete(document);
     }
     public Optional<Document> search(String referenceNumber, String documentName){
        return documentRepo.findByDocumentName(referenceNumber,documentName);
     }
     public ResponseEntity<?> uploadOneDoc(String referenceNumber,MultipartFile file,
                                           String fileName, String fileType){
         //checking whether the requested shipment is within the db
         Shipment shipment=shipmentRepo.findByReferenceNumber(referenceNumber)
                 .orElseThrow(()-> new RuntimeException("Shipment not found"));
                 
         String originalFilename = file.getOriginalFilename();
         if (originalFilename != null) {
             String lower = originalFilename.toLowerCase();
             if (!lower.endsWith(".pdf")) {
                 return ResponseEntity.status(400).body("Please upload PDF files only");
             }
         }
         if (file.getSize() > 10 * 1024 * 1024) {
             return ResponseEntity.status(400).body("Please upload a file smaller than 10MB");
         }

         String rawText = "";
         try {
             if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
                 //calling the method responsible for extracting text
                 rawText = extractTextFromDocument(file);
             }
         } catch (IOException e) {
             System.err.println("Failed to extract text from: " + fileName);
         }
         //create new doc object
         Document document = new Document();
         //link the document with its shipment
         document.setShipment(shipment);
         //setting the document's name from the user
         document.setDocumentName(fileName);
         //COO, PL, AB?
         document.setDocumentType(fileType);
         //save the content of the doc in the db table
         document.setContent(rawText);
         try {
             Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
             document.setDocumentUrl(uploadResult.get("secure_url").toString());
             document.setDocumentPublicId(uploadResult.get("public_id").toString());
             document.setContentType(file.getContentType());
         } catch (IOException e) {
             System.err.println("Failed to upload file to Cloudinary: " + e.getMessage());
         }
         //store the new document in the list of documents in the shipment class
         shipment.addDocument(document);
         //save the new document in the document table
         documentRepo.save(document);
        return ResponseEntity.ok("upload successful");
     }

     public ResponseEntity<?> viewDocument(Long id) {
         Document doc = documentRepo.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
         if (doc.getDocumentUrl() != null) {
             return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                     .location(URI.create(doc.getDocumentUrl()))
                     .build();
         }
         return ResponseEntity.notFound().build();
     }
}
