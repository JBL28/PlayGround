package dev.syntax.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String documentId;

    // 문서 제목 (필요 없다면 지워도 됨)
    @Column(nullable = false, length = 200)
    private String title;

    // 본문은 길 수 있으니 LOB로
    @Lob
    @Column(nullable = false)
    private String content;

    // 낙관적 락 (동시 수정 대비, 선택)
    @Version
    private Long version;

    public Document() {}                 // JPA 기본 생성자

    public Document(String title, String content) {
        this.title = title;
        this.content = content;
    }

    // --- getter/setter ---
    public String getDocumentId() { return documentId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Long getVersion() { return version; }
    public void setDocumentId(String id) { this.documentId = id; }
    public void setTitle(String title) { this.title = title; }
    public void setContent(String content) { this.content = content; }
    public void setVersion(Long version) { this.version = version; }
}
