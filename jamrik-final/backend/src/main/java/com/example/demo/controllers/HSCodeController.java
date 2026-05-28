package com.example.demo.controllers;
import com.example.demo.services.DocumentService;
import com.example.demo.services.HSCodeAIService;
import com.google.genai.Documents;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

//@RestController
//@RequestMapping("/jamrik/codes")
public class HSCodeController {
    //Autowiring the service and AI service classes via constructor injection
    private final HSCodeAIService aiService;
    public HSCodeController(HSCodeAIService aiService, DocumentService documentService) {
        this.aiService=aiService;
    }
@GetMapping("/hs")
public String getHSCode(@RequestParam String productName,
                        @RequestParam String description){
        return aiService.getHSCode(productName,description);
}
@PostMapping(value="/validate",consumes= MediaType.MULTIPART_FORM_DATA_VALUE)
    public String validateTwoDocs(@RequestPart List<MultipartFile> docs){
    if (docs.isEmpty()) {
        return "Please upload at leat 1 document.";
    }
        return aiService.validate(docs);
}
@GetMapping("/analyzeDocs/{referenceNumber}")
    public String analyze(@PathVariable String referenceNumber){
        return aiService.analyze(referenceNumber);
}


}
