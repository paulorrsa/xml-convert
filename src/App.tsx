import { useState } from 'react';
import { XmlDocument } from './lib/xmlParser';
import FileUpload from './components/FileUpload';
import DocumentList from './components/DocumentList';
import DocumentDetails from './components/DocumentDetails';
import Dashboard from './components/Dashboard';
import { downloadPdf, downloadExcel } from './lib/downloadHelpers';
import { FileText, BarChart3 } from 'lucide-react';

function App() {
  const [documents, setDocuments] = useState<XmlDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<XmlDocument | null>(null);
  const [activeView, setActiveView] = useState<'documents' | 'reports'>('documents');

  const handleFilesProcessed = (newDocuments: XmlDocument[]) => {
    setDocuments(prev => [...prev, ...newDocuments]);
  };

  const handleSelectDocument = (document: XmlDocument) => {
    setSelectedDocument(document);
  };

  const handleDownloadPdf = (document: XmlDocument) => {
    downloadPdf(document);
  };

  const handleDownloadExcel = (document: XmlDocument) => {
    downloadExcel(document);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-2xl font-bold mb-2 md:mb-0">XML Converter</h1>
            
            <div className="flex gap-4">
              <button 
                className={`btn-outline flex items-center ${activeView === 'documents' ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => setActiveView('documents')}
              >
                <FileText size={18} className="mr-2" />
                Documentos
              </button>
              <button 
                className={`btn-outline flex items-center ${activeView === 'reports' ? 'bg-accent text-accent-foreground' : ''}`}
                onClick={() => setActiveView('reports')}
              >
                <BarChart3 size={18} className="mr-2" />
                Relatórios
              </button>
              <a 
                href="https://github.com/seu-usuario/xml-converter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline flex items-center"
                title="Código-fonte no GitHub"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* AdSense Banner Top */}
      <div className="container mx-auto px-4 py-2">
        <div className="adsense-container">
          Espaço reservado para anúncios (Banner Superior)
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeView === 'documents' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <FileUpload onFilesProcessed={handleFilesProcessed} />
              
              {/* AdSense Sidebar */}
              <div className="adsense-container mt-6 hidden lg:block">
                Espaço reservado para anúncios (Lateral)
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <DocumentList 
                documents={documents} 
                onSelectDocument={handleSelectDocument}
                onDownloadPdf={handleDownloadPdf}
                onDownloadExcel={handleDownloadExcel}
              />
              
              <DocumentDetails 
                document={selectedDocument}
                onDownloadPdf={selectedDocument ? () => handleDownloadPdf(selectedDocument) : undefined}
                onDownloadExcel={selectedDocument ? () => handleDownloadExcel(selectedDocument) : undefined}
              />
            </div>
          </div>
        ) : (
          <Dashboard documents={documents} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-2 md:mb-0">
              &copy; 2025 XML Converter - Ferramenta para conversão de NF-e/CT-e
            </p>
            
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Termos de Uso
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacidade
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Contato
              </a>
            </div>
          </div>
          
          {/* AdSense Footer */}
          <div className="adsense-container mt-4">
            Espaço reservado para anúncios (Rodapé)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
