import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Definimos o Worker via CDN para evitar conflitos de build com o Vite 7 e Rollup
const PDF_JS_VERSION = '4.10.38'; // Versão estável compatível
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDF_JS_VERSION}/build/pdf.worker.min.mjs`;

export default function PdfThumbnail({ fileUrl }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!fileUrl) return;
      
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          // Necessário para permitir carregar arquivos do seu domínio via CDN externo
          withCredentials: false 
        });
        
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        // Escala 0.3 para gerar miniaturas leves e rápidas
        const viewport = page.getViewport({ scale: 0.3 });
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error("Erro PDF.js:", err);
        setError(true);
        setLoading(false);
      }
    };

    renderThumbnail();
  }, [fileUrl]);

  if (error) return <div style={{ fontSize: '10px', color: '#ccc' }}>Capa indisponível</div>;
  
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading && <div style={{ fontSize: '10px' }}>Carregando capa...</div>}
      <canvas ref={canvasRef} style={{ 
        maxWidth: '100%', 
        maxHeight: '100%', 
        display: loading ? 'none' : 'block',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }} />
    </div>
  );
}