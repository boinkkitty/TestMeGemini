'use client';

type UploadComponentProps = {
  isDragActive: boolean;
  getInputProps: any;
  getRootProps: any;
};

function UploadComponent({ isDragActive, getInputProps, getRootProps }: UploadComponentProps) {
  return (
    <div
      {...getRootProps()}
      className={`w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 ${
        isDragActive
          ? 'border-primary bg-accent/50'
          : 'border-border bg-background hover:border-primary/40 hover:bg-accent/20'
      }`}
    >
      <input {...getInputProps()} accept="application/pdf" />
      <div className="flex flex-col items-center gap-1.5 text-center px-4">
        <p className="text-sm font-semibold text-foreground">
          {isDragActive ? 'Drop your PDFs here…' : 'Drag & drop PDF files here'}
        </p>
        <p className="text-xs text-muted-foreground">or click to browse — only .pdf files accepted</p>
      </div>
    </div>
  );
}

export default UploadComponent;
