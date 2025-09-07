
import { useRef, useState } from 'react'

export default function FileDropzone({ onFileSelected, accept }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (files) => {
    const file = files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer ${dragOver ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-gray-600">Drag & drop report here, or click to browse</p>
      <p className="text-xs text-gray-500 mt-1">PDF, DOCX, JPG, PNG</p>
    </div>
  )
}
