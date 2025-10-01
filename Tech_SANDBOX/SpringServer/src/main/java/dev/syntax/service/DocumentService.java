package dev.syntax.service;

import dev.syntax.entity.Document;
import dev.syntax.repository.DocumentRepository;
import org.springframework.stereotype.Service;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;

    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    private void indexValidation(int index, String text) {
        if (text.length() < index)
            throw new IllegalArgumentException("올바르지 않은 요청입니다. : index가 문서 범위를 벗어남");
    }

    private Document getDocContent(String documentId) {
        return documentRepository.findBydocumentId(documentId).orElseGet(null);
    }

    public String insert(String documentId, Integer at, String text) {
        Document document = getDocContent(documentId);
        if(document == null)
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");

        indexValidation(at, document.getContent());

        document.setContent(new StringBuilder(document.getContent()).insert(at, text).toString());

        documentRepository.save(document);

        return document.getContent();
    }

    public String delete(String documentId, Integer start, Integer end) {
        Document document = getDocContent(documentId);
        if(document == null)
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");

        // DTO validation으로 end는 항상 start보다 크거나 같다
        indexValidation(end, document.getContent());

        document.setContent(new StringBuilder(document.getContent()).delete(start, end).toString());

        documentRepository.save(document);

        return document.getContent();
    }

    public String replace(String documentId, Integer start, Integer end, String text) {
        Document document = getDocContent(documentId);
        if(document == null)
            throw new IllegalArgumentException("존재하지 않는 문서입니다.");

        // DTO validation으로 end는 항상 start보다 크거나 같다
        indexValidation(end, document.getContent());

        document.setContent(new StringBuilder(document.getContent()).replace(start, end, text).toString());

        documentRepository.save(document);

        return document.getContent();
    }

    public Object getDoc(String documentId) {
        return getDocContent(documentId);
    }

    public Document createDocs(){
        Document newDoc = new Document("", "");
        documentRepository.save(newDoc);
        return newDoc;
    }
}
