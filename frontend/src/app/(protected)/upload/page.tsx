'use client';

import { useCallback, useState } from "react";
import UploadComponent from "../../../components/UploadComponent";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { createChaptersAndQuestions } from "@/services/chapters";
import LoadingSpinner from "@/components/LoadingSpinner";
import { handleError } from "../../../utils/handleError";

export default function UploadClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const existingNames = prev.map((f) => f.name);
      const newFiles = acceptedFiles.filter((f) => !existingNames.includes(f.name));
      return [...prev, ...newFiles];
    });
  }, []);

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const { isDragActive, getInputProps, getRootProps, fileRejections } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    if (!title.trim()) { setError("Please enter a chapter title."); return; }
    if (!category.trim()) { setError("Please enter a category."); return; }
    if (files.length === 0) { setError("Please upload at least one PDF file."); return; }
    setIsGenerating(true);
    try {
      await createChaptersAndQuestions({ title, category, files });
      setSuccess("Chapter and questions generated successfully!");
      setFiles([]);
      setTitle("");
      setCategory("");
    } catch (error) {
      setError(handleError(error) || "Failed to generate chapter and questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Upload Notes</h1>

      <div className="max-w-2xl bg-card border border-border rounded-xl p-6 space-y-5">

        {/* Title + Category row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground tracking-wide">
              Chapter Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry — Ch.4"
              disabled={isGenerating}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground tracking-wide">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Chemistry"
              disabled={isGenerating}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Dropzone */}
        <UploadComponent
          isDragActive={isDragActive}
          getInputProps={getInputProps}
          getRootProps={getRootProps}
        />

        {/* Selected files */}
        {files.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-2">
              Selected PDFs
            </p>
            <ul className="flex flex-wrap gap-2">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-1.5 bg-accent text-primary rounded-full px-3 py-1 text-xs font-semibold">
                  <span className="truncate max-w-[140px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="text-primary/60 hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors / rejections */}
        {fileRejections.length > 0 && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
            Only PDF files are accepted.
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-700 bg-green-50 rounded-md px-3 py-2 border border-green-200">{success}</p>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? <LoadingSpinner message="Generating…" /> : "Generate Questions"}
        </button>
      </div>
    </div>
  );
}
