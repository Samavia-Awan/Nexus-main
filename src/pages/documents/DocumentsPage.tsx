import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, PenTool, Eye, X, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSignatureView, setShowSignatureView] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => localStorage.getItem('business_nexus_token') || '';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_URL}/documents`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    try {
      const res = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      const data = await res.json();
      if (data._id) {
        alert('Document uploaded successfully!');
        await fetchDocuments();
      } else {
        alert('Upload failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload failed!');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      await fetchDocuments();
    } catch (err) {
      alert('Delete failed!');
    }
  };

  const handleDownload = (doc: any) => {
    const url = `${API_BASE}/uploads/${doc.filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.originalName || doc.filename;
    a.click();
  };

  const handlePreview = (doc: any) => {
  const url = `${API_BASE}/uploads/${doc.filename}`;
    setPreviewUrl(url);
    setSelectedDoc(doc);
    setShowPreviewModal(true);
  };

  const openSignModal = (doc: any) => {
    setSelectedDoc(doc);
    setShowSignModal(true);
    setTimeout(() => initCanvas(), 150);
  };

  const viewSignature = (doc: any) => {
    setSelectedDoc(doc);
    setShowSignatureView(true);
  };

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setLastPos(getPos(e, canvas));
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => initCanvas();

  const submitSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedDoc) return;
    const signatureData = canvas.toDataURL('image/png');
    try {
      const res = await fetch(`${API_URL}/documents/${selectedDoc._id}/sign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ signature: signatureData })
      });
      const data = await res.json();
      if (data._id) {
        alert('Document signed successfully!');
        setShowSignModal(false);
        await fetchDocuments();
      } else {
        alert('Signing failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Signing failed!');
    }
  };

  const getFileType = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['doc', 'docx'].includes(ext || '')) return 'Document';
    if (['xls', 'xlsx'].includes(ext || '')) return 'Spreadsheet';
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return 'Image';
    return 'File';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and sign your startup's important files</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" onChange={handleUpload} />
          <Button leftIcon={<Upload size={18} />}
            onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            All Documents
            {documents.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({documents.length} files)</span>
            )}
          </h2>
        </CardHeader>
        <CardBody>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
              <button onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-primary-600 hover:underline">
                Upload your first document
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc._id}
                  className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div className="p-2 bg-primary-50 rounded-lg mr-4 flex-shrink-0">
                    <FileText size={24} className="text-primary-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {doc.originalName || doc.filename}
                      </h3>
                      {doc.status === 'signed' && (
                        <Badge variant="secondary" size="sm">
                          ✍️ Signed
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>{getFileType(doc.originalName || doc.filename)}</span>
                      {doc.size && <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>}
                      <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Show signature preview inline */}
                    {doc.signature && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Signature:</p>
                        <img
                          src={doc.signature}
                          alt="Signature"
                          className="h-10 border border-gray-200 rounded bg-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {(doc.originalName || doc.filename)?.toLowerCase().endsWith('.pdf') && (
                      <button onClick={() => handlePreview(doc)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                        title="Preview PDF">
                        <Eye size={16} />
                      </button>
                    )}
                    <button onClick={() => openSignModal(doc)}
                      className={`p-2 rounded-md transition-colors ${doc.status === 'signed'
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
                      title={doc.status === 'signed' ? 'Re-sign' : 'Sign document'}>
                      <PenTool size={16} />
                    </button>
                    <button onClick={() => handleDownload(doc)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Download">
                      <Download size={16} />
                    </button>
                    <button onClick={() => handleDelete(doc._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* E-Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">E-Sign Document</h3>
                <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">
                  {selectedDoc?.originalName || selectedDoc?.filename}
                </p>
              </div>
              <button onClick={() => setShowSignModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Draw your signature below:
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={160}
                    className="w-full cursor-crosshair touch-none block"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Sign with mouse or touch</p>
              </div>
              <div className="flex gap-3">
                <button onClick={clearCanvas}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium">
                  Clear
                </button>
                <button onClick={submitSignature}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Apply Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col" style={{ height: '85vh' }}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {selectedDoc?.originalName || selectedDoc?.filename}
              </h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload(selectedDoc)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600">
                  <Download size={18} />
                </button>
                <button onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2 overflow-hidden">
              <iframe src={previewUrl} className="w-full h-full rounded-lg border border-gray-200"
                title="PDF Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};