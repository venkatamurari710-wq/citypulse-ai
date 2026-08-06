// client/src/components/complaint/FileUploadZone.jsx
import { useRef, useState } from 'react';
import { Upload, X, Image, Film, Music, FileText } from 'lucide-react';

const TYPE_ICONS = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
};

function getFileCategory(mime) {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'document';
}

function FilePreview({ file, onRemove }) {
  const category = getFileCategory(file.type);
  const Icon = TYPE_ICONS[category];
  const url = URL.createObjectURL(file);

  return (
    <div className="relative group rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs">
      {category === 'image' ? (
        <img src={url} alt={file.name} className="w-full h-24 object-cover" />
      ) : (
        <div className="w-full h-24 flex flex-col items-center justify-center gap-1.5 p-2 bg-neutral-50">
          <Icon className="w-7 h-7 text-neutral-500" />
          <span className="text-xs text-neutral-700 font-medium truncate w-full text-center">{file.name}</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => onRemove(file)}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-90"
      >
        <X className="w-3.5 h-3.5 text-white" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-xs px-2 py-1">
        <span className="text-xs text-white font-medium truncate block">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
      </div>
    </div>
  );
}

export default function FileUploadZone({ files, onChange, maxFiles = 10 }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (newFiles) => {
    const merged = [...files];
    for (const f of newFiles) {
      if (merged.length >= maxFiles) break;
      if (!merged.find(e => e.name === f.name && e.size === f.size)) merged.push(f);
    }
    onChange(merged);
  };

  const removeFile = (file) => onChange(files.filter(f => f !== file));

  return (
    <div className="space-y-3">
      <div
        className={`drop-zone ${dragging ? 'drop-zone-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles([...e.dataTransfer.files]); }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.txt"
          className="hidden"
          onChange={e => addFiles([...e.target.files])}
        />
        <div className="flex flex-col items-center gap-2.5 pointer-events-none">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 shadow-xs">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800">
              Drop files here or <span className="text-primary-600 underline">click to browse</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Images, Videos, Audio, PDFs • Max 25MB each • Up to {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {files.map((f, i) => (
            <FilePreview key={`${f.name}-${i}`} file={f} onRemove={removeFile} />
          ))}
        </div>
      )}
    </div>
  );
}
