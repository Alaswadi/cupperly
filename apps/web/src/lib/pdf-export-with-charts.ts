import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface SessionData {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  creator: {
    firstName: string;
    lastName: string;
  };
  participants: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  samples: Array<{
    id: string;
    sample: {
      id: string;
      name: string;
      origin?: string;
      variety?: string;
      processingMethod?: string;
      roastLevel?: string;
      producer?: string;
      farm?: string;
      altitude?: string;
    };
    aiSummary?: string;
    aiGeneratedAt?: string;
  }>;
}

interface ScoreData {
  id: string;
  sampleId: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
  };
  totalScore: number;
  aroma?: number;
  flavor?: number;
  aftertaste?: number;
  acidity?: number;
  body?: number;
  balance?: number;
  sweetness?: number;
  cleanliness?: number;
  uniformity?: number;
  overall?: number;
  notes?: string;
  privateNotes?: string;
  createdAt: string;
  flavorDescriptors?: Array<{
    flavorDescriptor: {
      name: string;
      category: 'POSITIVE' | 'NEGATIVE';
    };
    intensity: number;
  }>;
}

export class EnhancedPDFExporter {
  private pdf: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
  }

  private addNewPageIfNeeded(requiredHeight: number): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(text: string, fontSize: number = 16): void {
    this.addNewPageIfNeeded(15);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSubtitle(text: string, fontSize: number = 12): void {
    this.addNewPageIfNeeded(10);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, fontSize: number = 10, style: 'normal' | 'bold' = 'normal'): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', style);
    this.pdf.setTextColor(0, 0, 0);
    
    // Handle long text by wrapping
    const maxWidth = this.pageWidth - (this.margin * 2);
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.addNewPageIfNeeded(6);
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += 6;
    }
    this.currentY += 2;
  }

  private addKeyValue(key: string, value: string | number): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`${key}:`, this.margin, this.currentY);

    this.pdf.setFont('helvetica', 'normal');
    const keyWidth = this.pdf.getTextWidth(`${key}: `);
    this.pdf.text(String(value), this.margin + keyWidth, this.currentY);
    this.currentY += 6;
  }

  private addSeparator(): void {
    this.addNewPageIfNeeded(10);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private addTable(headers: string[], rows: string[][], title?: string): void {
    if (title) {
      this.addSubtitle(title);
    }

    const tableWidth = this.pageWidth - (this.margin * 2);
    const colWidth = tableWidth / headers.length;
    const rowHeight = 8;

    this.addNewPageIfNeeded((rows.length + 2) * rowHeight);

    // Table header
    this.pdf.setFillColor(59, 130, 246); // Blue header
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);

    this.pdf.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');

    headers.forEach((header, index) => {
      const x = this.margin + (index * colWidth) + 2;
      this.pdf.text(header, x, this.currentY + 5.5);
    });

    this.currentY += rowHeight;

    // Table rows
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'normal');

    rows.forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(248, 250, 252); // Light gray
        this.pdf.rect(this.margin, this.currentY, tableWidth, rowHeight, 'F');
      }

      row.forEach((cell, colIndex) => {
        const x = this.margin + (colIndex * colWidth) + 2;
        this.pdf.text(cell, x, this.currentY + 5.5);
      });

      this.currentY += rowHeight;
    });

    // Table border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.rect(this.margin, this.currentY - (rows.length + 1) * rowHeight, tableWidth, (rows.length + 1) * rowHeight);

    // Column separators
    for (let i = 1; i < headers.length; i++) {
      const x = this.margin + (i * colWidth);
      this.pdf.line(x, this.currentY - (rows.length + 1) * rowHeight, x, this.currentY);
    }

    this.currentY += 10;
  }

  private calculateScaaGrade(score: number): string {
    if (score >= 90) return 'Outstanding';
    if (score >= 85) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 75) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Below Standard';
  }

  async captureRadarChart(sampleId: string): Promise<string | null> {
    try {
      // Find the radar chart element for the specific sample
      const chartContainer = document.querySelector(`[data-sample-id="${sampleId}"]`) as HTMLElement;
      if (!chartContainer) {
        console.warn(`Chart container not found for sample ${sampleId}`);
        // Try to find any visible radar chart as fallback
        const fallbackChart = document.querySelector('.recharts-wrapper') as HTMLElement;
        if (fallbackChart) {
          console.log('Using fallback chart');
          return await this.captureChartElement(fallbackChart);
        }
        return null;
      }

      // Find the actual chart within the container
      const chartElement = chartContainer.querySelector('.recharts-wrapper') as HTMLElement;
      if (!chartElement) {
        console.warn(`Radar chart not found for sample ${sampleId}`);
        return null;
      }

      return await this.captureChartElement(chartElement);
    } catch (error) {
      console.error('Error capturing radar chart:', error);
      return null;
    }
  }

  private async captureChartElement(chartElement: HTMLElement): Promise<string | null> {
    try {
      // Wait for chart to be fully rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Ensure the chart is visible
      if (chartElement.offsetWidth === 0 || chartElement.offsetHeight === 0) {
        console.warn('Chart element has no dimensions');
        return null;
      }

      // Capture the chart as canvas with high quality settings
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Reduced scale for better compatibility
        logging: true, // Enable logging for debugging
        useCORS: true,
        allowTaint: true,
        width: chartElement.offsetWidth,
        height: chartElement.offsetHeight,
        foreignObjectRendering: false, // Disable for better compatibility
        removeContainer: false
      });

      // Convert to base64 image
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('Error in captureChartElement:', error);
      return null;
    }
  }

  async addRadarChartImage(imageData: string, sampleName: string): Promise<void> {
    try {
      this.addNewPageIfNeeded(90);

      this.addSubtitle(`SCAA Scoring Analysis - ${sampleName}`);

      // Calculate image dimensions to fit within page while maintaining aspect ratio
      const maxWidth = this.pageWidth - (this.margin * 2);
      const maxHeight = 80; // mm

      // Center the image
      const imageWidth = maxWidth * 0.8; // Use 80% of available width
      const imageHeight = maxHeight;
      const xPosition = this.margin + (maxWidth - imageWidth) / 2;

      // Add image to PDF with better quality
      this.pdf.addImage(
        imageData,
        'PNG',
        xPosition,
        this.currentY,
        imageWidth,
        imageHeight,
        undefined,
        'SLOW' // Better quality rendering
      );

      this.currentY += imageHeight + 15;
    } catch (error) {
      console.error('Error adding radar chart to PDF:', error);
      this.addText('Note: Radar chart visualization could not be captured for this export.');
      this.currentY += 10;
    }
  }

  private addChartPlaceholder(sampleName: string): void {
    this.addNewPageIfNeeded(50);

    this.addSubtitle(`SCAA Scoring Analysis - ${sampleName}`);

    // Add a simple text-based representation
    this.pdf.setFillColor(245, 245, 245);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 40, 'F');

    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);

    const centerX = this.pageWidth / 2;
    this.pdf.text('Radar Chart Visualization', centerX, this.currentY + 15, { align: 'center' });
    this.pdf.text('(Chart capture not available in this export)', centerX, this.currentY + 25, { align: 'center' });
    this.pdf.text('Please refer to the detailed scoring tables below', centerX, this.currentY + 35, { align: 'center' });

    this.currentY += 50;
  }

  private addSessionHeader(session: SessionData): void {
    // Header with branding
    this.pdf.setFillColor(59, 130, 246); // Blue background
    this.pdf.rect(0, 0, this.pageWidth, 35, 'F');
    
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('Coffee Cupping Report', this.margin, 20);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, this.margin, 28);
    
    this.currentY = 45;
    
    // Session Information
    this.addTitle(session.name, 18);
    if (session.description) {
      this.addText(session.description);
    }
    
    this.addSeparator();
  }

  async exportSessionReportWithCharts(session: SessionData, scores: ScoreData[]): Promise<void> {
    // Add session header
    this.addSessionHeader(session);
    
    // Session Details
    this.addSubtitle('Session Details');
    this.addKeyValue('Status', session.status);
    this.addKeyValue('Created by', `${session.creator.firstName} ${session.creator.lastName}`);
    this.addKeyValue('Participants', session.participants.length.toString());
    this.addKeyValue('Samples', session.samples.length.toString());
    
    if (session.completedAt) {
      this.addKeyValue('Completed', format(new Date(session.completedAt), 'MMMM dd, yyyy HH:mm'));
    } else if (session.startedAt) {
      this.addKeyValue('Started', format(new Date(session.startedAt), 'MMMM dd, yyyy HH:mm'));
    }
    
    if (session.location) {
      this.addKeyValue('Location', session.location);
    }
    
    this.addSeparator();
    
    // Participants
    this.addSubtitle('Participants');
    session.participants.forEach((participant, index) => {
      this.addText(`${index + 1}. ${participant.user.firstName} ${participant.user.lastName}`);
    });
    this.addSeparator();
    
    // Process each sample
    for (const sessionSample of session.samples) {
      const sampleScores = scores.filter(score => score.sampleId === sessionSample.sample.id);
      if (sampleScores.length === 0) continue;

      // Start new page for each sample
      this.pdf.addPage();
      this.currentY = this.margin;
      
      this.addTitle(`Sample Analysis: ${sessionSample.sample.name}`, 16);
      
      // Sample Information
      this.addSubtitle('Sample Information');
      this.addKeyValue('Name', sessionSample.sample.name);
      if (sessionSample.sample.origin) this.addKeyValue('Origin', sessionSample.sample.origin);
      if (sessionSample.sample.variety) this.addKeyValue('Variety', sessionSample.sample.variety);
      if (sessionSample.sample.processingMethod) this.addKeyValue('Processing Method', sessionSample.sample.processingMethod);
      if (sessionSample.sample.roastLevel) this.addKeyValue('Roast Level', sessionSample.sample.roastLevel);
      if (sessionSample.sample.producer) this.addKeyValue('Producer', sessionSample.sample.producer);
      if (sessionSample.sample.farm) this.addKeyValue('Farm', sessionSample.sample.farm);
      if (sessionSample.sample.altitude) this.addKeyValue('Altitude', sessionSample.sample.altitude);
      
      this.currentY += 5;
      
      // Scoring Summary
      this.addSubtitle('Scoring Summary');
      const avgScore = sampleScores.reduce((sum, score) => sum + score.totalScore, 0) / sampleScores.length;
      this.addKeyValue('Average Score', `${avgScore.toFixed(1)}/100`);
      this.addKeyValue('SCAA Grade', this.calculateScaaGrade(avgScore));
      this.addKeyValue('Number of Evaluations', sampleScores.length.toString());
      
      this.currentY += 5;
      
      // Try to capture and add radar chart
      const chartImage = await this.captureRadarChart(sessionSample.sample.id);
      if (chartImage) {
        await this.addRadarChartImage(chartImage, sessionSample.sample.name);
      } else {
        // Add placeholder if chart capture failed
        this.addChartPlaceholder(sessionSample.sample.name);
      }
      
      // Category Breakdown as Table
      const categories = ['aroma', 'flavor', 'aftertaste', 'acidity', 'body', 'balance', 'sweetness', 'cleanliness', 'uniformity', 'overall'];
      const categoryRows = categories.map(category => {
        const categoryScores = sampleScores.map(score => score[category as keyof ScoreData] as number || 0);
        const avgCategoryScore = categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length;
        return [
          category.charAt(0).toUpperCase() + category.slice(1),
          `${avgCategoryScore.toFixed(1)}/10`,
          avgCategoryScore >= 8 ? 'Excellent' : avgCategoryScore >= 7 ? 'Good' : avgCategoryScore >= 6 ? 'Fair' : 'Below Average'
        ];
      });

      this.addTable(['Category', 'Average Score', 'Rating'], categoryRows, 'SCAA Category Breakdown');
      
      this.currentY += 5;
      
      // Individual Scores
      this.addSubtitle('Individual Evaluations');
      sampleScores.forEach(score => {
        this.addText(`${score.user.firstName} ${score.user.lastName}: ${score.totalScore.toFixed(1)}/100 (${this.calculateScaaGrade(score.totalScore)})`, 10, 'bold');
      });
      
      this.currentY += 5;
      
      // Flavor Descriptors
      const allDescriptors: Array<{ name: string; category: 'POSITIVE' | 'NEGATIVE'; intensity: number }> = [];
      sampleScores.forEach(score => {
        score.flavorDescriptors?.forEach(fd => {
          const existing = allDescriptors.find(d => d.name === fd.flavorDescriptor.name);
          if (existing) {
            existing.intensity = Math.max(existing.intensity, fd.intensity);
          } else {
            allDescriptors.push({
              name: fd.flavorDescriptor.name,
              category: fd.flavorDescriptor.category,
              intensity: fd.intensity
            });
          }
        });
      });
      
      if (allDescriptors.length > 0) {
        const positiveDescriptors = allDescriptors.filter(d => d.category === 'POSITIVE').sort((a, b) => b.intensity - a.intensity);
        const negativeDescriptors = allDescriptors.filter(d => d.category === 'NEGATIVE').sort((a, b) => b.intensity - a.intensity);

        // Create flavor profile table
        const flavorRows: string[][] = [];

        // Add positive flavors
        positiveDescriptors.forEach(descriptor => {
          flavorRows.push([descriptor.name, 'Positive', descriptor.intensity.toString()]);
        });

        // Add negative flavors
        negativeDescriptors.forEach(descriptor => {
          flavorRows.push([descriptor.name, 'Negative', descriptor.intensity.toString()]);
        });

        if (flavorRows.length > 0) {
          this.addTable(['Flavor Descriptor', 'Category', 'Intensity'], flavorRows, 'Flavor Profile Analysis');
        }
      }
      
      this.currentY += 5;
      
      // Cupping Notes
      const notesExist = sampleScores.some(score => score.notes || score.privateNotes);
      if (notesExist) {
        this.addSubtitle('Cupping Notes');
        sampleScores.forEach(score => {
          if (score.notes || score.privateNotes) {
            this.addText(`${score.user.firstName} ${score.user.lastName} (${format(new Date(score.createdAt), 'MMM d, yyyy')}):`, 10, 'bold');
            if (score.notes) {
              this.addText(`Notes: ${score.notes}`);
            }
            if (score.privateNotes) {
              this.addText(`Private Notes: ${score.privateNotes}`);
            }
            this.currentY += 3;
          }
        });
      }
      
      // Professional Summary
      if (sessionSample.aiSummary) {
        this.addSubtitle('Professional Analysis Summary');

        // Add summary text with proper formatting (no background to avoid black issue)
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(60, 60, 60);

        // Calculate summary text
        const maxWidth = this.pageWidth - (this.margin * 2);
        const lines = this.pdf.splitTextToSize(sessionSample.aiSummary, maxWidth);

        // Add each line with proper spacing
        for (const line of lines) {
          this.addNewPageIfNeeded(6);
          this.pdf.text(line, this.margin, this.currentY);
          this.currentY += 6;
        }

        this.currentY += 5;

        if (sessionSample.aiGeneratedAt) {
          this.pdf.setFontSize(8);
          this.pdf.setTextColor(128, 128, 128);
          this.pdf.text(`Analysis generated on ${format(new Date(sessionSample.aiGeneratedAt), 'MMMM dd, yyyy HH:mm')}`, this.margin, this.currentY);
          this.currentY += 10;
        }
      }
    }
    
    // Add footer to last page
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(128, 128, 128);
    const footerText = `Generated by Cupperly • ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`;
    this.pdf.text(footerText, this.margin, this.pageHeight - 10);
    
    // Save the PDF
    const fileName = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.pdf.save(fileName);
  }
}

export const exportSessionToPDFWithCharts = async (session: SessionData, scores: ScoreData[]): Promise<void> => {
  const exporter = new EnhancedPDFExporter();
  await exporter.exportSessionReportWithCharts(session, scores);
};
