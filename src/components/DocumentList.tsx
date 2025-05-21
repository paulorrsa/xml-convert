import { useState } from 'react';
import { XmlDocument } from '../lib/xmlParser';
import { FileText, Download, FileSpreadsheet, FileBarChart } from 'lucide-react';

interface DocumentListProps {
  documents: XmlDocument[];
  onSelectDocument: (document: XmlDocument) => void;
  onDownloadPdf?: (document: XmlDocument) => void;
  onDownloadExcel?: (document: XmlDocument) => void;
}

export default function DocumentList({ 
  documents, 
  onSelectDocument
}: DocumentListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (document: XmlDocument) => {
    setSelectedId(document.id);
    onSelectDocument(document);
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="card-container mt-6">
      <h2 className="text-xl font-semibold mb-4">Documentos Processados</h2>
      
      <div className="space-y-3">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className={`file-item cursor-pointer transition-colors ${
              selectedId === doc.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(doc)}
          >
            <div className="flex items-center">
              <FileText size={20} className="mr-3 text-muted-foreground" />
              <div>
                <div className="font-medium">{doc.fileName}</div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4">
                  <span>Tipo: {doc.tipo}</span>
                  {doc.numero && <span>Nº: {doc.numero}</span>}
                  {doc.data && <span>Data: {formatDate(doc.data)}</span>}
                  {doc.status !== 'Normal' && (
                    <span className="text-red-500">{doc.status}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="btn-outline p-2"
                title="Visualizar PDF"
              >
                <Download size={18} />
              </button>
              <button 
                className="btn-outline p-2"
                title="Exportar Excel"
              >
                <FileSpreadsheet size={18} />
              </button>
              <button 
                className="btn-outline p-2"
                title="Ver Relatório"
              >
                <FileBarChart size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateStr;
  }
}
