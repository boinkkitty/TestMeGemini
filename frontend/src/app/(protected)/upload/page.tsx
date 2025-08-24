'use client';

import {useCallback, useState} from "react";
import UploadComponent from "../../../components/UploadComponent";
import { useDropzone } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { createChaptersAndQuestions } from "@/services/chapters";

import LoadingSpinner from "@/components/LoadingSpinner";
import {handleError} from "../../../utils/handleError";

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
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    noClick: false,
    noKeyboard: false,
  });

  const handleGenerate = async () => {
    setError("");
    setSuccess("");
    if (!title.trim()) {
      setError("Please enter a chapter title.");
      return;
    }
    if (!category.trim()) {
      setError("Please enter a category.");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    setIsGenerating(true);
    try {
      await createChaptersAndQuestions({
        title,
        category,
        files,
      });
      setSuccess("Chapter and questions generated successfully!");
      setFiles([]);
      setTitle("");
      setCategory("");
    } catch (error) {
      console.log(error);
      // Get error message from Axios error response if possible
      const errMsg = handleError(error) || "Failed to generate chapter and questions.";
      setError(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 h-full w-full mx-auto flex flex-col gap-3 justify-center items-center">
      <div className="flex justify-start items-center p-2 mb-4 w-full">
        <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight underline underline-offset-4 decoration-blue-300 drop-shadow-sm">
          Upload
        </h1>
      </div>
      <div className="flex-grow justify-between items-center w-2xl">
        <div className="mb-6">
          <label htmlFor="chapter-title" className="block text-md font-semibold mb-2 text-gray-700">
            Chapter Title
          </label>
          <input
              id="chapter-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter chapter title..."
              disabled={isGenerating}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="chapter-category" className="block text-md font-semibold mb-2 text-gray-700">
            Category
          </label>
          <input
              id="chapter-category"
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter category..."
              disabled={isGenerating}
          />
        </div>
        <UploadComponent
            isDragActive={isDragActive}
            getInputProps={getInputProps}
            getRootProps={getRootProps}
        />
        {files.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold mb-2 text-gray-700">Selected PDFs:</h4>
              <ul className="flex flex-wrap gap-2">
                {files.map((file) => (
                    <li key={file.name} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="ml-1 text-blue-400 hover:text-red-500 enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                          aria-label={`Remove ${file.name}`}
                          disabled={false}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </li>
                ))}
              </ul>
            </div>
        )}
        {fileRejections.length > 0 && (
            <div className="mt-4 text-red-600">
              File rejected: Only PDF files allowed.
            </div>
        )}
        {error && (
            <div className="mt-4 text-red-600 font-semibold">{error}</div>
        )}
        {success && (
            <div className="mt-4 text-green-600 font-semibold">{success}</div>
        )}
        <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`mt-8 w-full py-3 rounded bg-blue-600 text-white font-bold text-lg transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed enabled:hover:cursor-pointer`}
        >
          {isGenerating ? <LoadingSpinner message="Generating..." /> : "Generate"}
        </button>
      </div>
    </div>
  );
}
