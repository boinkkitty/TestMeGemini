'use client';


import { useCallback, useState } from "react";
import UploadComponent from "../../../components/UploadComponent";
import { useDropzone } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function UploadClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only add new files that aren't already in the list
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

  return (
    <div className="p-6 max-w-xl mx-auto">
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
                  className="ml-2 text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${file.name}`}
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
    </div>
  );
}
