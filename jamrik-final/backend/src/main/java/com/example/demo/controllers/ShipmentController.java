package com.example.demo.controllers;

import com.example.demo.DTOs.ShipmentDTO;
import com.example.demo.classes.Document;
import com.example.demo.classes.Shipment;
import com.example.demo.services.HSCodeAIService;
import com.example.demo.services.ShipmentService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jamrik/shipments")
public class ShipmentController {
    private final ShipmentService shipmentService;
    private final HSCodeAIService hsCodeAIService;
    public ShipmentController(ShipmentService shipmentService, HSCodeAIService hsCodeAIService) {
        this.shipmentService = shipmentService;
        this.hsCodeAIService = hsCodeAIService;
    }

    @PostMapping("/newShipment")
    public Shipment createNewShipment(@RequestBody ShipmentDTO sDTO,
                                      Authentication auth){
        return shipmentService.createNewShipment(sDTO,auth.getName());
    }
    @PostMapping("/changeStatus/{referenceNumber}")
    public Shipment changeShipmentStatus(@PathVariable String referenceNumber,
                                         @RequestParam String status){
        return shipmentService.setShipmentStatus(referenceNumber,status);
    }
    @GetMapping("/searchShipment")
    public Optional<Shipment> searchShipment(@RequestParam String ReferenceNumber){
        return shipmentService.search(ReferenceNumber);
    }
    @DeleteMapping("/deleteShipment")
    public Shipment deleteShipment(@RequestParam String referenceNumber){
        return shipmentService.delete(referenceNumber);
    }
    @GetMapping("/searchAll")
    public List<Shipment> searchAll(Authentication auth){
        return shipmentService.searchAllByUser(auth.getName());
    }
    @GetMapping("/searchAllDocs")
    public List<com.example.demo.DTOs.DocumentResponseDTO> searchAllDocuments(@RequestParam String referenceNumber){
        return shipmentService.searchDocsMetadata(referenceNumber);
    }

    // Generate Customs Declaration Form as PDF
    @PostMapping("/generateCustomsDeclaration")
    public ResponseEntity<?> generateCustomsDeclaration(@RequestParam String referenceNumber) {
        try {
            // Get the AI-generated customs declaration text
            String declarationText = hsCodeAIService.generateCustomsDeclaration(referenceNumber);

            // Convert the text to a PDF using PDFBox
            byte[] pdfBytes = createPdfFromText(declarationText, referenceNumber);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "customs_declaration_" + referenceNumber + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error generating PDF: " + e.getMessage());
        }
    }

    // Helper: Create a PDF document from text content using PDFBox
    private byte[] createPdfFromText(String text, String referenceNumber) throws IOException {
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PDType1Font titleFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font headerFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font bodyFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            float margin = 50;
            float fontSize = 10;
            float titleFontSize = 16;
            float headerFontSize = 12;
            float leading = 14;
            float pageWidth = PDRectangle.A4.getWidth();
            float pageHeight = PDRectangle.A4.getHeight();
            float usableWidth = pageWidth - 2 * margin;

            // Split text into lines
            String[] lines = text.split("\n");

            PDPage currentPage = new PDPage(PDRectangle.A4);
            document.addPage(currentPage);
            PDPageContentStream contentStream = new PDPageContentStream(document, currentPage);
            float yPosition = pageHeight - margin;

            // Add title
            contentStream.beginText();
            contentStream.setFont(titleFont, titleFontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("CUSTOMS DECLARATION FORM");
            contentStream.endText();
            yPosition -= 20;

            contentStream.beginText();
            contentStream.setFont(bodyFont, fontSize);
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Reference: " + referenceNumber);
            contentStream.endText();
            yPosition -= 10;

            // Draw a line separator
            contentStream.moveTo(margin, yPosition);
            contentStream.lineTo(pageWidth - margin, yPosition);
            contentStream.stroke();
            yPosition -= 20;

            // Write each line of the AI-generated content
            for (String line : lines) {
                // Determine if this is a header line (e.g., starts with a number or contains all caps section)
                boolean isHeader = line.matches("^\\d+\\..*") || line.matches("^[A-Z][A-Z\\s&/]+$")
                        || line.startsWith("##") || line.startsWith("**");

                // Clean markdown formatting
                String cleanLine = line.replaceAll("\\*\\*", "").replaceAll("##\\s*", "").replaceAll("#\\s*", "");

                PDType1Font currentFont = isHeader ? headerFont : bodyFont;
                float currentFontSize = isHeader ? headerFontSize : fontSize;

                // Word wrap the line
                List<String> wrappedLines = wrapText(cleanLine, currentFont, currentFontSize, usableWidth);

                for (String wrappedLine : wrappedLines) {
                    // Check if we need a new page
                    if (yPosition < margin + 20) {
                        contentStream.close();
                        currentPage = new PDPage(PDRectangle.A4);
                        document.addPage(currentPage);
                        contentStream = new PDPageContentStream(document, currentPage);
                        yPosition = pageHeight - margin;
                    }

                    contentStream.beginText();
                    contentStream.setFont(currentFont, currentFontSize);
                    contentStream.newLineAtOffset(margin, yPosition);
                    // Filter out non-ASCII characters that the font can't handle
                    String safeText = wrappedLine.replaceAll("[^\\x00-\\x7F]", "");
                    contentStream.showText(safeText);
                    contentStream.endText();
                    yPosition -= leading;
                }

                // Add extra spacing after header lines
                if (isHeader) {
                    yPosition -= 5;
                }
            }

            contentStream.close();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    // Helper: Word-wrap text to fit within a given width
    private List<String> wrapText(String text, PDType1Font font, float fontSize, float maxWidth) throws IOException {
        List<String> lines = new java.util.ArrayList<>();
        if (text == null || text.isEmpty()) {
            lines.add("");
            return lines;
        }
        String[] words = text.split("\\s+");
        StringBuilder currentLine = new StringBuilder();
        for (String word : words) {
            String safeWord = word.replaceAll("[^\\x00-\\x7F]", "");
            String testLine = currentLine.length() == 0 ? safeWord : currentLine + " " + safeWord;
            float textWidth = font.getStringWidth(testLine) / 1000 * fontSize;
            if (textWidth > maxWidth && currentLine.length() > 0) {
                lines.add(currentLine.toString());
                currentLine = new StringBuilder(safeWord);
            } else {
                currentLine = new StringBuilder(testLine);
            }
        }
        if (currentLine.length() > 0) {
            lines.add(currentLine.toString());
        }
        return lines;
    }
}
