package dev.syntax.repository;

import dev.syntax.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {
    Optional<Document> findBydocumentId(String documentId);
}
