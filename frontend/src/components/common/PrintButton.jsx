import React from 'react';
import { FiPrinter } from 'react-icons/fi';

const PrintButton = ({ 
  data, 
  title, 
  subtitle, 
  className = "bg-blue-600 hover:bg-blue-700",
  children 
}) => {
  const handlePrint = () => {
    // Store current window state
    const originalTitle = document.title;
    const originalFocus = document.activeElement;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (!printWindow) {
      alert('Please allow popups for printing to work properly');
      return;
    }
    
    // Generate the print content
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              @page {
                margin: 1in;
                size: A4;
              }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                font-size: 12px;
                line-height: 1.4;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 3px solid #2c3e50; 
                padding-bottom: 15px;
                page-break-after: avoid;
              }
              .title { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 8px;
                color: #2c3e50;
              }
              .subtitle { 
                font-size: 16px; 
                color: #7f8c8d; 
                margin-bottom: 5px;
              }
              .info-section {
                margin-bottom: 20px;
                padding: 15px;
                border: 2px solid #ecf0f1;
                border-radius: 8px;
                background-color: #f8f9fa;
                page-break-inside: avoid;
              }
              .info-label {
                font-weight: bold;
                color: #2c3e50;
                font-size: 14px;
                margin-bottom: 8px;
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 5px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-top: 10px;
              }
              .info-item {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #ecf0f1;
              }
              .info-item:last-child {
                border-bottom: none;
              }
              .info-key {
                font-weight: 600;
                color: #34495e;
              }
              .info-value {
                color: #2c3e50;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                page-break-inside: avoid;
              }
              th, td { 
                border: 1px solid #bdc3c7; 
                padding: 10px; 
                text-align: left; 
                font-size: 11px;
                vertical-align: top;
              }
              th { 
                background-color: #34495e; 
                color: white;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.5px;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              .status-present { 
                color: #27ae60; 
                font-weight: bold; 
                text-transform: uppercase;
                font-size: 10px;
              }
              .status-absent { 
                color: #e74c3c; 
                font-weight: bold; 
                text-transform: uppercase;
                font-size: 10px;
              }
              .status-late { 
                color: #f39c12; 
                font-weight: bold; 
                text-transform: uppercase;
                font-size: 10px;
              }
              .grade-A { 
                color: #27ae60; 
                font-weight: bold; 
                font-size: 14px;
              }
              .grade-B { 
                color: #3498db; 
                font-weight: bold; 
                font-size: 14px;
              }
              .grade-C { 
                color: #f39c12; 
                font-weight: bold; 
                font-size: 14px;
              }
              .grade-D { 
                color: #e67e22; 
                font-weight: bold; 
                font-size: 14px;
              }
              .grade-F { 
                color: #e74c3c; 
                font-weight: bold; 
                font-size: 14px;
              }
              .print-date {
                text-align: right;
                font-size: 10px;
                color: #7f8c8d;
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #ecf0f1;
                page-break-before: avoid;
              }
              .no-print { display: none; }
              .summary-stats {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
                padding: 15px;
                background-color: #ecf0f1;
                border-radius: 8px;
                page-break-inside: avoid;
              }
              .stat-item {
                text-align: center;
              }
              .stat-number {
                font-size: 24px;
                font-weight: bold;
                color: #2c3e50;
              }
              .stat-label {
                font-size: 12px;
                color: #7f8c8d;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Nidaamka Maamulka AL-MINHAAJ</div>
            <div class="subtitle">${title}</div>
            ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
          </div>
          
          ${children}
          
          <div class="print-date">
            <strong>La sameeyay:</strong> ${new Date().toLocaleDateString('so-SO', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} saacad ${new Date().toLocaleTimeString('so-SO', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </body>
      </html>
    `;
    
    try {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Handle print completion and cleanup
      const handlePrintComplete = () => {
        // Cleanup function
        const cleanup = () => {
          try {
            if (printWindow && !printWindow.closed) {
              printWindow.close();
            }
          } catch (e) {
            console.log('Print window already closed');
          }
          
          // Restore focus to original element
          if (originalFocus && originalFocus.focus) {
            try {
              originalFocus.focus();
            } catch (e) {
              // Focus restoration failed, focus body instead
              document.body.focus();
            }
          }
          
          // Restore original title
          document.title = originalTitle;
        };
        
        // Set up multiple cleanup triggers
        setTimeout(cleanup, 1000); // Fallback cleanup
        
        // Listen for print window events
        if (printWindow) {
          printWindow.addEventListener('beforeunload', cleanup);
          printWindow.addEventListener('unload', cleanup);
          
          // Handle focus events
          window.addEventListener('focus', () => {
            setTimeout(() => {
              if (printWindow && printWindow.closed) {
                cleanup();
              }
            }, 100);
          }, { once: true });
        }
      };
      
      // Wait for content to load then print
      printWindow.onload = () => {
        try {
          // Small delay to ensure content is fully rendered
          setTimeout(() => {
            printWindow.print();
            handlePrintComplete();
          }, 250);
        } catch (error) {
          console.error('Print error:', error);
          handlePrintComplete();
        }
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          try {
            printWindow.print();
            handlePrintComplete();
          } catch (error) {
            console.error('Fallback print error:', error);
            handlePrintComplete();
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Print setup error:', error);
      if (printWindow && !printWindow.closed) {
        printWindow.close();
      }
      // Restore focus
      if (originalFocus && originalFocus.focus) {
        originalFocus.focus();
      }
    }
  };

  return (
    <button
      onClick={handlePrint}
      className={`flex items-center px-4 py-2 text-white rounded-md transition-colors ${className}`}
      title="Print this report"
    >
      <FiPrinter className="mr-2" />
      Print Report
    </button>
  );
};

export default PrintButton;