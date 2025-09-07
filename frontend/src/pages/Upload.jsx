
import { useState } from 'react'
import { uploadReport } from '../services/api'
import FileDropzone from '../components/FileDropzone'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState(null)

  const onFileSelected = (f) => {
    setFile(f)
    if (f && f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  const onUpload = async () => {
    if (!file) return
    setStatus('Uploading...')
    try {
      const { data } = await uploadReport(file)
      setStatus('Upload successful! Report parsed.')
      // optionally navigate or show summary
    } catch (e) {
      setStatus(e.response?.data?.error || e.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Upload Medical Report</h2>
      <FileDropzone onFileSelected={onFileSelected} accept=".pdf,.docx,image/*" />
      {file && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size/1024/1024).toFixed(2)} MB</p>
            </div>
            <button className="btn btn-primary" onClick={onUpload}>Send to AI</button>
          </div>
          {preview && <img src={preview} alt="preview" className="mt-4 rounded-xl max-h-80 object-contain" />}
        </div>
      )}
      {status && <div className="text-sm">{status}</div>}
    </div>
  )
}
