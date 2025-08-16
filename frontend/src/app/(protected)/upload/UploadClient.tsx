'use client';

import {useCallback, useState} from "react";
import UploadComponent from "../../../components/UploadComponent";
import { useDropzone } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/utils/axiosInstance";

export default function UploadClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
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
    if (files.length === 0) {
      setError("Please upload at least one PDF file.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]); // note plural "files" if your backend expects that
      }
      const res = await api.post("/chapters/create-with-questions/", formData);
      console.log(res);
      // Axios response data is in res.data
      setSuccess("Chapter and questions generated successfully!");
      setFiles([]);
      setTitle("");
    } catch (error) {
      console.log(error);
      // Get error message from Axios error response if possible
      const errMsg =
          error.response?.data?.error || "Failed to generate chapter and questions.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl h-full mx-auto flex flex-col gap-3 justify-center align-center">
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
          disabled={loading}
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
          <ul className="space-y-2">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                <span className="truncate text-gray-800">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.name)}
                  className="ml-2 text-gray-400 hover:text-red-500 enabled:hover:cursor-pointer disabled:cursor-not-allowed"
                  aria-label={`Remove ${file.name}`}
                  disabled={false}
                >
                  <XMarkIcon className="h-5 w-5" />
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
        disabled={loading}
        className={`mt-8 w-full py-3 rounded bg-blue-600 text-white font-bold text-lg transition hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed enabled:hover:cursor-pointer`}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
  );
}
