'use client';

type UploadComponentProps = {
  isDragActive: boolean;
  getInputProps: any;
  getRootProps: any;
  className?: string;
};

function UploadComponent({ isDragActive, getInputProps, getRootProps, className = "" }: UploadComponentProps) {
  return (
    <div
      {...getRootProps()}
      className={`w-full flex flex-col items-center justify-center border-[1.5px] border-dashed rounded-xl cursor-pointer transition-all duration-150 min-h-[160px] ${className} ${
        isDragActive
          ? 'border-primary bg-accent/50'
          : 'border-border bg-background hover:border-primary/50 hover:bg-accent/20'
      }`}
    >
      <input {...getInputProps()} accept="application/pdf" />
      <div className="flex flex-col items-center gap-1.5 text-center px-4 py-10">
        <div className="w-10 h-10 rounded-[10px] bg-accent flex items-center justify-center mb-1">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {isDragActive ? 'Drop your PDFs here…' : 'Drag & drop your PDF here'}
        </p>
        <p className="text-xs text-muted-foreground">or click to browse — only .pdf accepted</p>
      </div>
    </div>
  );
}

export default UploadComponent;
