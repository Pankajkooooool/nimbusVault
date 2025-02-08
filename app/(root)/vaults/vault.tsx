"use client"

import React, {  useState } from "react"
import { Upload, File, Trash2 } from "lucide-react"

interface VaultFile {
  id: string
  name: string
  size: string
  type: string
}
export default function VaultComponent() {
  const [files, setFiles] = useState<VaultFile[]>([
    { id: "1", name: "secret_document.pdf", size: "2.5 MB", type: "PDF" },
  ])

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newFile: VaultFile = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type.split("/")[1].toUpperCase(),
      }
      setFiles([newFile, ...files])
    }
  }

  const handleDelete = (id: string) => {
    setFiles(files.filter((file) => file.id !== id))
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="mb-6">
        <label
          htmlFor="fileInput"
          className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-purple-400 focus:outline-none"
        >
          <span className="flex items-center space-x-2">
            <Upload className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-600">Drop pdf Files here or Click to Browse</span>
          </span>
          <input id="fileInput" type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition hover:bg-gray-100"
          >
            <div className="flex items-center space-x-4">
              <File className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-700">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {file.size} • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(file.id)}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

