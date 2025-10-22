/**
 * EXPORT SERVICE
 * Handles CSV and PDF export functionality
 */

// Static imports for dependencies
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export interface ExportOptions {
  format: 'csv' | 'pdf';
  data: any[];
  filename: string;
  title?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  includeCharts?: boolean;
}

export interface AnalyticsData {
  visitors: any[];
  sessions: any[];
  pageViews: any[];
  conversions: any[];
  sources: any[];
  devices: any[];
  locations: any[];
}

export class ExportService {
  /**
   * Export data to CSV
   */
  static exportToCSV(data: any[], filename: string): void {
    if (!Papa) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Export data to PDF
   */
  static exportToPDF(options: ExportOptions): void {
    if (!jsPDF) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight(); // Unused for now
    
    // Add title
    if (options.title) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(options.title, pageWidth / 2, 20, { align: 'center' });
    }

    // Add date range
    if (options.dateRange) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const dateText = `${new Date(options.dateRange.startDate).toLocaleDateString()} - ${new Date(options.dateRange.endDate).toLocaleDateString()}`;
      doc.text(dateText, pageWidth / 2, 30, { align: 'center' });
    }

    // Add generated timestamp
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 40, { align: 'center' });

    // Add data table
    if (options.data.length > 0) {
      const headers = Object.keys(options.data[0]);
      const rows = options.data.map(row => headers.map(header => row[header] || ''));
      
      autoTable && autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 50,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [74, 144, 226],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        margin: { left: 10, right: 10 },
      });
    }

    // Add footer
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Analytics Hub - AliceSolutions Group', pageWidth / 2, finalY + 20, { align: 'center' });

    // Save the PDF
    doc.save(`${options.filename}.pdf`);
  }

  /**
   * Export comprehensive analytics report
   */
  static exportAnalyticsReport(data: AnalyticsData, options: {
    filename: string;
    dateRange: { startDate: string; endDate: string };
    format: 'csv' | 'pdf';
  }): void {
    if (options.format === 'csv') {
      // Export each dataset as separate CSV files
      Object.entries(data).forEach(([key, value]) => {
        if (value.length > 0) {
          this.exportToCSV(value, `${options.filename}_${key}`);
        }
      });
    } else {
      // Export as comprehensive PDF report
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Title page
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Analytics Report', pageWidth / 2, 50, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('AliceSolutions Group', pageWidth / 2, 70, { align: 'center' });
      
      doc.setFontSize(12);
      const dateText = `${new Date(options.dateRange.startDate).toLocaleDateString()} - ${new Date(options.dateRange.endDate).toLocaleDateString()}`;
      doc.text(dateText, pageWidth / 2, 90, { align: 'center' });
      
      doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, 100, { align: 'center' });
      
      // Add new page for each dataset
      Object.entries(data).forEach(([key, value], index) => {
        if (value.length > 0) {
          if (index > 0) {
            doc.addPage();
          }
          
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(key.charAt(0).toUpperCase() + key.slice(1), 20, 30);
          
          const headers = Object.keys(value[0]);
          const rows = (value as any[]).map((row: any) => headers.map((header) => (row as any)[header] || ''));
          
          autoTable(doc, {
            head: [headers],
            body: rows,
            startY: 40,
            styles: {
              fontSize: 8,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [74, 144, 226],
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: {
              fillColor: [248, 249, 250],
            },
            margin: { left: 10, right: 10 },
          });
        }
      });
      
      // Add summary page
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      let yPos = 50;
      Object.entries(data).forEach(([key, value]) => {
        doc.text(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.length} records`, 20, yPos);
        yPos += 10;
      });
      
      doc.save(`${options.filename}.pdf`);
    }
  }

  /**
   * Export specific page analytics
   */
  static exportPageAnalytics(pages: any[], options: {
    filename: string;
    dateRange: { startDate: string; endDate: string };
    format: 'csv' | 'pdf';
  }): void {
    const processedData = pages.map(page => ({
      'Page URL': page.pageUrl,
      'Page Title': page.pageTitle,
      'Page Views': page.pageViews,
      'Unique Visitors': page.uniqueVisitors,
      'Bounce Rate': `${(page.bounceRate * 100).toFixed(1)}%`,
      'Avg. Time on Page': `${Math.round(page.avgTimeOnPage / 60)}m ${page.avgTimeOnPage % 60}s`,
      'Conversion Rate': `${(page.conversionRate * 100).toFixed(1)}%`,
    }));

    if (options.format === 'csv') {
      this.exportToCSV(processedData, options.filename);
    } else {
      this.exportToPDF({
        format: 'pdf',
        data: processedData,
        filename: options.filename,
        title: 'Page Analytics Report',
        dateRange: options.dateRange,
      });
    }
  }

  /**
   * Export visitor insights
   */
  static exportVisitorInsights(visitors: any[], options: {
    filename: string;
    dateRange: { startDate: string; endDate: string };
    format: 'csv' | 'pdf';
  }): void {
    const processedData = visitors.map(visitor => ({
      'Country': visitor.country,
      'City': visitor.city,
      'Device Type': visitor.deviceType,
      'Browser': visitor.browser,
      'OS': visitor.os,
      'Sessions': visitor.sessions,
      'Page Views': visitor.pageViews,
      'Avg. Session Duration': `${Math.round(visitor.avgSessionDuration / 60)}m`,
      'Bounce Rate': `${(visitor.bounceRate * 100).toFixed(1)}%`,
    }));

    if (options.format === 'csv') {
      this.exportToCSV(processedData, options.filename);
    } else {
      this.exportToPDF({
        format: 'pdf',
        data: processedData,
        filename: options.filename,
        title: 'Visitor Insights Report',
        dateRange: options.dateRange,
      });
    }
  }

  /**
   * Export conversion goals
   */
  static exportConversionGoals(goals: any[], options: {
    filename: string;
    dateRange: { startDate: string; endDate: string };
    format: 'csv' | 'pdf';
  }): void {
    const processedData = goals.map(goal => ({
      'Goal Name': goal.name,
      'Goal Type': goal.type,
      'Conversions': goal.conversions,
      'Conversion Rate': `${(goal.conversionRate * 100).toFixed(1)}%`,
      'Total Value': `$${goal.totalValue.toFixed(2)}`,
      'Avg. Value': `$${goal.avgValue.toFixed(2)}`,
      'Status': goal.isActive ? 'Active' : 'Inactive',
    }));

    if (options.format === 'csv') {
      this.exportToCSV(processedData, options.filename);
    } else {
      this.exportToPDF({
        format: 'pdf',
        data: processedData,
        filename: options.filename,
        title: 'Conversion Goals Report',
        dateRange: options.dateRange,
      });
    }
  }

  /**
   * Export traffic sources
   */
  static exportTrafficSources(sources: any[], options: {
    filename: string;
    dateRange: { startDate: string; endDate: string };
    format: 'csv' | 'pdf';
  }): void {
    const processedData = sources.map(source => ({
      'Source': source.source,
      'Medium': source.medium,
      'Campaign': source.campaign || 'N/A',
      'Sessions': source.sessions,
      'Page Views': source.pageViews,
      'Bounce Rate': `${(source.bounceRate * 100).toFixed(1)}%`,
      'Conversion Rate': `${(source.conversionRate * 100).toFixed(1)}%`,
      'Revenue': `$${source.revenue?.toFixed(2) || '0.00'}`,
    }));

    if (options.format === 'csv') {
      this.exportToCSV(processedData, options.filename);
    } else {
      this.exportToPDF({
        format: 'pdf',
        data: processedData,
        filename: options.filename,
        title: 'Traffic Sources Report',
        dateRange: options.dateRange,
      });
    }
  }
}
