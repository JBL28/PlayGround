package dev.syntax.dto;

import java.time.Instant;

public record DocumentDTO(
        String id,
        long version,
        String content,
        int length,
        Instant lastModified
) {
    public static DocumentDTO of(String id, long version, String content, Instant lastModified) {
        return new DocumentDTO(id, version, content, content != null ? content.length() : 0, lastModified);
    }
}
