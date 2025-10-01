"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Op = "INSERT" | "DELETE" | "REPLACE";
type InsertReq = { documentId: string; op: "INSERT"; at: number; text: string };
type DeleteReq = { documentId: string; op: "DELETE"; start: number; end: number };
type ReplaceReq = { documentId: string; op: "REPLACE"; start: number; end: number; text: string };
type OperationReq = InsertReq | DeleteReq | ReplaceReq;

type Props = {
  defaultApiBase?: string;
  defaultDocumentId?: string;
  debounceMs?: number;
};

function diffOneChange(documentId: string, prev: string, next: string): OperationReq | null {
  if (prev === next) return null;
  let i = 0;
  const minLen = Math.min(prev.length, next.length);
  while (i < minLen && prev.charCodeAt(i) === next.charCodeAt(i)) i++;
  let j = 0;
  while (j < (minLen - i) &&
    prev.charCodeAt(prev.length - 1 - j) === next.charCodeAt(next.length - 1 - j)) j++;

  const prevMid = prev.slice(i, prev.length - j);
  const nextMid = next.slice(i, next.length - j);

  if (prevMid.length === 0 && nextMid.length > 0) {
    return { documentId, op: "INSERT", at: i, text: nextMid };
  } else if (prevMid.length > 0 && nextMid.length === 0) {
    return { documentId, op: "DELETE", start: i, end: i + prevMid.length };
  } else {
    return { documentId, op: "REPLACE", start: i, end: i + prevMid.length, text: nextMid };
  }
}

export default function SyncDocsTestComponent({
  defaultApiBase = "http://localhost:8080/api/docs",
  defaultDocumentId = "",
  debounceMs = 800,
}: Props) {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [documentId, setDocumentId] = useState(defaultDocumentId);

  const [text, setText] = useState("");
  const [prevText, setPrevText] = useState("");
  const [status, setStatus] = useState<string>("Idle");
  const [isComposing, setIsComposing] = useState(false);

  const [previewOp, setPreviewOp] = useState<OperationReq | null>(null);  // 전송 예정 바디
  const [lastSentOp, setLastSentOp] = useState<OperationReq | null>(null); // 마지막 전송 바디

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canSend = useMemo(() => !!apiBase && !!documentId, [apiBase, documentId]);

  const sendOperation = useCallback(
    async (op: OperationReq) => {
      setStatus(`${op.op} sending...`);
      try {
        const res = await fetch(`${apiBase}/operations`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(op),
        });
        if (!res.ok) {
          setStatus(`${op.op} failed: ${res.status}`);
          return;
        }
        setLastSentOp(op);           // 마지막 전송 바디 기록
        setPrevText(text);           // 낙관적 반영 (서버가 본문을 돌려주면 여기서 치환)
        setStatus(`${op.op} ok`);
      } catch (e: any) {
        setStatus(`${op.op} error: ${e?.message ?? e}`);
      }
    },
    [apiBase, text]
  );

  // 디바운스 + preview 계산
  useEffect(() => {
    if (!canSend) return;
    if (isComposing) {
      setPreviewOp(null); // 조합 중에는 미리보기 생성 안 함
      return;
    }
    if (text === prevText) {
      setPreviewOp(null);
      return;
    }

    // 먼저 preview를 즉시 계산해서 보여줌
    const opPreview = diffOneChange(documentId, prevText, text);
    setPreviewOp(opPreview);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const op = diffOneChange(documentId, prevText, text);
      if (!op) {
        setStatus("No change");
        setPreviewOp(null);
        return;
      }
      void sendOperation(op);
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, isComposing, prevText, documentId, debounceMs, canSend, sendOperation]);

  const onCreateDoc = useCallback(async () => {
    setStatus("Creating document...");
    try {
      const res = await fetch(`${apiBase}/create`, { method: "POST" });
      if (!res.ok) {
        setStatus(`Create failed: ${res.status}`);
        return;
      }
      const id = await res.text();
      setDocumentId(id);
      setPrevText("");
      setText("");
      setPreviewOp(null);
      setLastSentOp(null);
      setStatus(`Created: ${id}`);
    } catch (e: any) {
      setStatus(`Create error: ${e?.message ?? e}`);
    }
  }, [apiBase]);

  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = () => setIsComposing(false);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value);

  const acceptAsServer = () => {
    setPrevText(text);
    setPreviewOp(null);
    setStatus("Accepted current text as server baseline");
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="flex flex-col">
          <span className="font-medium mb-1">API Base</span>
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="http://localhost:8080/api/docs"
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-medium mb-1">Document ID</span>
          <input
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            placeholder="existing docId or create one"
            className="border rounded px-2 py-1"
          />
        </label>

        <div className="flex items-end gap-2">
          <button onClick={onCreateDoc} className="border rounded px-3 py-2 w-full hover:bg-gray-50">
            Create
          </button>
          <button
            onClick={acceptAsServer}
            className="border rounded px-3 py-2 w-full hover:bg-gray-50"
            title="테스트용: 현재 텍스트를 서버 기준으로 수동 동기화"
          >
            Accept as Server
          </button>
        </div>
      </div>

      <div className="text-gray-600">
        <div>Debounce: <b>{debounceMs}ms</b> • IME composing: <b>{String(isComposing)}</b></div>
        <div>Status: <b>{status}</b></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="font-medium mb-1">TextArea (Edit me)</span>
          <textarea
            value={text}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="border rounded p-3 h-64 whitespace-pre-wrap"
            placeholder="여기에 입력하세요 (한글 조합 입력 지원)"
          />
        </div>

        <div className="flex flex-col">
          <span className="font-medium mb-1">Server Baseline (prevText)</span>
          <textarea
            value={prevText}
            readOnly
            className="border rounded p-3 h-64 bg-gray-50 whitespace-pre-wrap"
          />
        </div>
      </div>

      {/* 요청 바디 미리보기 & 마지막 전송 바디 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="font-medium mb-1">Request Preview (will send after debounce)</span>
          <pre className="border rounded p-3 h-64 overflow-auto bg-gray-50">
{JSON.stringify(previewOp, null, 2)}
          </pre>
        </div>

        <div className="flex flex-col">
          <span className="font-medium mb-1">Last Sent Request</span>
          <pre className="border rounded p-3 h-64 overflow-auto bg-gray-50">
{JSON.stringify(lastSentOp, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
