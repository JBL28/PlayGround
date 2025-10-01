package dev.syntax.dto;

public record DocumentOperation(
        String documentId,

        // INSERT | DELETE | REPLACE
        Op op,

        Integer at,

        Integer start,

        Integer end,

        String text
) {
    public enum Op {INSERT, DELETE, REPLACE};

    public void validate() {
        if(op == null){
            throw new IllegalArgumentException("올바르지 않은 요청입니다. : op");
        }
        if(documentId == null){
            throw new IllegalArgumentException("올바르지 않은 요청입니다. : documentId");
        }
        switch (op) {
            case INSERT -> {
                if(at == null)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Index");
                if(at < 0)
                    throw new IllegalArgumentException("at이 음수입니다.");
                if(text == null)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Text");
            }

            case DELETE -> {
                if(start == null || end == null)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Index");
                if(start < 0 || end < 0)
                    throw new IllegalArgumentException("start/end가 음수입니다.");
                if(start > end)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Index");
            }

            case REPLACE -> {
                if(start == null || end ==null)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Index");
                if(start < 0 || end < 0)
                    throw new IllegalArgumentException("start/end가 음수입니다.");
                if(start > end)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Index");
                if(text == null)
                    throw new IllegalArgumentException("올바르지 않은 요청입니다. : Text");
            }
        }
    }
}
