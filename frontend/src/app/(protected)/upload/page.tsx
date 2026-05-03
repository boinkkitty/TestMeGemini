'use client';

import { useCallback, useState } from "react";
import UploadComponent from "../../../components/UploadComponent";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { createChaptersAndQuestions } from "@/services/chapters";
import LoadingSpinner from "@/components/LoadingSpinner";
import { handleError } from "../../../utils/handleError";

const NUM_QUESTIONS_OPTIONS = [
  { value: "10", label: "10 questions" },
  { value: "20", label: "20 questions" },
  { value: "30", label: "30 questions" },
  { value: "50", label: "50 questions" },
];

export default function UploadClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [numQuestions, setNumQuestions] = useState<string>("30");
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
      setDescription("");
      setNumQuestions("30");
    } catch (error) {
      setError(handleError(error) || "Failed to generate chapter and questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition disabled:opacity-60";
  const labelClass = "text-xs font-semibold text-muted-foreground tracking-wide";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">Generate quiz questions from your PDF notes</p>
      </div>

      <div className="max-w-[760px] bg-card border border-border rounded-xl p-6 space-y-5">

        {/* Section header */}
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Chapter details</p>

        {/* 3-column top row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Chapter title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Lec 4 — Search Algorithms"
              disabled={isGenerating}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Subject / Category</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. CS2109S"
              disabled={isGenerating}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>No. of questions</label>
            <select
              value={numQuestions}
              onChange={e => setNumQuestions(e.target.value)}
              disabled={isGenerating}
              className={inputClass + " cursor-pointer"}
            >
              {NUM_QUESTIONS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Two-column: dropzone + description/steps */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Dropzone fills full column height */}
          <div className="flex flex-col gap-3">
            <UploadComponent
              isDragActive={isDragActive}
              getInputProps={getInputProps}
              getRootProps={getRootProps}
              className="flex-1"
            />
            {files.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {files.map((file) => (
                  <li key={file.name} className="flex items-center gap-1.5 bg-accent text-primary rounded-full px-3 py-1 text-xs font-semibold">
                    <span className="truncate max-w-[100px]">{file.name}</span>
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
            )}
          </div>

          {/* Right: Description + What happens next */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                Description <span className="font-normal text-muted-foreground/70">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={isGenerating}
                placeholder="Briefly describe what this chapter covers…"
                rows={4}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition resize-none disabled:opacity-60"
              />
            </div>
            <div className="bg-background border border-border rounded-xl p-3.5">
              <p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">What happens next</p>
              <div className="flex flex-col gap-2">
                {[
                  "PDF is parsed and chunked",
                  "Gemini generates MCQ & MRQ questions",
                  "Chapter appears ready to quiz",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

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
          {isGenerating ? <LoadingSpinner message="Generating…" /> : "Generate questions"}
        </button>
      </div>
    </div>
  );
}
