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
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

//this class handles the document upload, data extraction, and passing to AI
@Service
public class DocumentService {

    private final DocumentRepository documentRepo;
    //this line is to associate each document with its parent shipment
    private final ShipmentRepository shipmentRepo;
    //bean from doc AI service to handle doc processing
    private final HSCodeAIService aiService;
    public DocumentService(DocumentRepository documentRepo,
                           ShipmentRepository shipmentRepo,
                           HSCodeAIService  aiService) {
        this.documentRepo=documentRepo;
        this.shipmentRepo=shipmentRepo;
        this.aiService=aiService;
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
                if (!lower.endsWith(".pdf") && !lower.endsWith(".doc") && !lower.endsWith(".docx") 
                    && !lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
                    return ResponseEntity.status(400).body("Please upload PDF, Word, or Image files only");
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
                    document.setFileData(file.getBytes());
                    document.setContentType(file.getContentType());
                } catch (IOException e) {
                    System.err.println("Failed to read file bytes");
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
             if (!lower.endsWith(".pdf") && !lower.endsWith(".doc") && !lower.endsWith(".docx")
                 && !lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".jpeg")) {
                 return ResponseEntity.status(400).body("Please upload PDF, Word, or Image files only");
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
             document.setFileData(file.getBytes());
             document.setContentType(file.getContentType());
         } catch (IOException e) {
             System.err.println("Failed to read file bytes");
         }
         //store the new document in the list of documents in the shipment class
         shipment.addDocument(document);
         //save the new document in the document table
         documentRepo.save(document);
        return ResponseEntity.ok("upload successful");
     }

     public ResponseEntity<byte[]> viewDocument(Long id) {
         Document doc = documentRepo.findById(id).orElseThrow(() -> new RuntimeException("Document not found"));
         return ResponseEntity.ok()
                 .contentType(org.springframework.http.MediaType.parseMediaType(doc.getContentType() != null ? doc.getContentType() : "application/pdf"))
                 .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getDocumentName() + "\"")
                 .body(doc.getFileData());
     }
}
