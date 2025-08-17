'use client';

type UploadComponentProps = {
  isDragActive: boolean;
  getInputProps: any;
  getRootProps: any;
};

function UploadComponent({ isDragActive, getInputProps, getRootProps }: UploadComponentProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div
        {...getRootProps()}
        className={`w-full max-w-xl h-48 flex items-center justify-center border-2 rounded-xl cursor-pointer transition-all duration-150
        ${isDragActive ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-dashed border-gray-300 bg-gray-50 shadow'}`}
      >
        <input {...getInputProps()} accept="application/pdf" />
        <div className="flex flex-col items-center">
          <p className="text-lg text-gray-700 font-medium">
            {isDragActive
              ? 'Drop your PDF files here...'
              : 'Drag & drop PDF files here, or click to select'}
          </p>
          <span className="mt-2 text-sm text-gray-500">Only .pdf files will be accepted</span>
        </div>
      </div>
    </div>
  );
}

export default UploadComponent;
