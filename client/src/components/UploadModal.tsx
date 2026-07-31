import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { uploadDocument } from "../api/documents";
import type { OwnerOption } from "../types";
import { formatDate } from "../utils/format";

interface UploadModalProps {
  owners: OwnerOption[];
  onClose: () => void;
  onUploaded: (owner: OwnerOption) => void;
  onViewExisting: (title: string) => void;
}

export function UploadModal({ owners, onClose, onUploaded, onViewExisting }: UploadModalProps) {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("sozlesme");
  const [ownerId, setOwnerId] = useState(owners[0] ? String(owners[0].id) : "");

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
  });

  function submit() {
    const owner = owners.find((o) => String(o.id) === ownerId);
    if (!file || !title.trim() || !owner) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("docType", docType);
    formData.append("ownerId", String(owner.id));
    formData.append("ownerName", owner.name);

    uploadMutation.mutate(formData, {
      onSuccess: (result) => {
        if (!result.duplicate) {
          queryClient.invalidateQueries({ queryKey: ["documents"] });
          onUploaded(owner);
          setTimeout(onClose, 900);
        }
      },
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  const result = uploadMutation.data;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Doküman Yükle</h2>

        <form onSubmit={handleSubmit}>
          <label className="filter-field">
            Dosya
            <input
              type="file"
              required
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                uploadMutation.reset();
              }}
            />
          </label>

          <label className="filter-field">
            Başlık
            <input
              type="text"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="filter-field">
            Doküman tipi
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option value="sozlesme">Sözleşme</option>
              <option value="teklif">Teklif</option>
              <option value="fatura">Fatura</option>
            </select>
          </label>

          <label className="filter-field">
            Sahip
            <select
              value={ownerId}
              disabled={owners.length === 0}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              {owners.length === 0 && <option value="">Sahip listesi yükleniyor…</option>}
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </label>

          {result && !result.duplicate && (
            <div className="upload-success">Doküman yüklendi.</div>
          )}

          {result && result.duplicate && (
            <div className="upload-warning">
              <strong>Bu doküman zaten sistemde mevcut.</strong>
              <span>
                {result.existing.title} · {result.existing.ownerName} ·{" "}
                {formatDate(result.existing.createdAt)}
              </span>
              <button type="button" onClick={() => onViewExisting(result.existing.title)}>
                Mevcut dokümanı gör
              </button>
            </div>
          )}

          {uploadMutation.isError && (
            <div className="upload-error">
              <span>
                {uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : "Yükleme başarısız oldu."}
              </span>
              <button type="button" onClick={submit}>
                Tekrar dene
              </button>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              İptal
            </button>
            <button type="submit" disabled={uploadMutation.isPending || owners.length === 0}>
              {uploadMutation.isPending ? "Yükleniyor…" : "Yükle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
