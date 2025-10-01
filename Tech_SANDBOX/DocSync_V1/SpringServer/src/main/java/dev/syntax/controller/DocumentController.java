package dev.syntax.controller;

import dev.syntax.dto.DocumentOperation;
import dev.syntax.entity.Document;
import dev.syntax.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/docs")
public class DocumentController {
    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService){
        this.documentService = documentService;
    }

    @PostMapping("/create")
    public String Create(){
        Document doc = documentService.createDocs();
        return doc.getDocumentId();
    }

    @PatchMapping("/operations")
    public ResponseEntity<Void> Insert(@RequestBody DocumentOperation request){
        request.validate();

        switch(request.op()) {
            case INSERT -> {
                System.out.println(documentService.insert(request.documentId(), request.at(), request.text()));
            }

            case DELETE -> {
                System.out.println(documentService.delete(request.documentId(), request.start(), request.end()));
            }

            case REPLACE -> {
                System.out.println(documentService.replace(request.documentId(), request.start(), request.end(), request.text()));
            }
        }
        return ResponseEntity
                .status(200)
                .build();
    }
}
