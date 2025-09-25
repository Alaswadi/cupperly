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

export class PDFExporter {
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
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addSubtitle(text: string, fontSize: number = 12): void {
    this.addNewPageIfNeeded(10);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += 8;
  }

  private addText(text: string, fontSize: number = 10, style: 'normal' | 'bold' = 'normal'): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', style);
    
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

  private addKeyValue(key: string, value: string): void {
    this.addNewPageIfNeeded(8);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${key}:`, this.margin, this.currentY);
    
    this.pdf.setFont('helvetica', 'normal');
    const keyWidth = this.pdf.getTextWidth(`${key}: `);
    this.pdf.text(value, this.margin + keyWidth, this.currentY);
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

  private addSessionHeader(session: SessionData): void {
    // Header with logo area
    this.pdf.setFillColor(245, 245, 245);
    this.pdf.rect(this.margin, 10, this.pageWidth - (this.margin * 2), 25, 'F');
    
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Coffee Cupping Report', this.margin + 5, 25);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, this.pageWidth - this.margin - 50, 30);
    
    this.currentY = 45;
    
    // Session Information
    this.addTitle(session.name, 18);
    if (session.description) {
      this.addText(session.description);
    }
    
    this.addSeparator();
    
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
  }

  private addParticipantsList(session: SessionData): void {
    this.addSubtitle('Participants');
    session.participants.forEach((participant, index) => {
      this.addText(`${index + 1}. ${participant.user.firstName} ${participant.user.lastName}`);
    });
    this.addSeparator();
  }

  private addSampleAnalysis(session: SessionData, scores: ScoreData[], sampleId: string): void {
    const sample = session.samples.find(s => s.sample.id === sampleId);
    if (!sample) return;

    const sampleScores = scores.filter(score => score.sampleId === sampleId);
    if (sampleScores.length === 0) return;

    this.addTitle(`Sample Analysis: ${sample.sample.name}`, 14);
    
    // Sample Information
    this.addSubtitle('Sample Information');
    this.addKeyValue('Name', sample.sample.name);
    if (sample.sample.origin) this.addKeyValue('Origin', sample.sample.origin);
    if (sample.sample.variety) this.addKeyValue('Variety', sample.sample.variety);
    if (sample.sample.processingMethod) this.addKeyValue('Processing Method', sample.sample.processingMethod);
    if (sample.sample.roastLevel) this.addKeyValue('Roast Level', sample.sample.roastLevel);
    if (sample.sample.producer) this.addKeyValue('Producer', sample.sample.producer);
    if (sample.sample.farm) this.addKeyValue('Farm', sample.sample.farm);
    if (sample.sample.altitude) this.addKeyValue('Altitude', sample.sample.altitude);
    
    this.currentY += 5;
    
    // Scoring Summary
    this.addSubtitle('Scoring Summary');
    const avgScore = sampleScores.reduce((sum, score) => sum + score.totalScore, 0) / sampleScores.length;
    this.addKeyValue('Average Score', `${avgScore.toFixed(1)}/100`);
    this.addKeyValue('SCAA Grade', this.calculateScaaGrade(avgScore));
    this.addKeyValue('Number of Evaluations', sampleScores.length.toString());
    
    this.currentY += 5;
    
    // Individual Scores
    this.addSubtitle('Individual Evaluations');
    sampleScores.forEach(score => {
      this.addText(`${score.user.firstName} ${score.user.lastName}: ${score.totalScore.toFixed(1)}/100 (${this.calculateScaaGrade(score.totalScore)})`, 10, 'bold');
    });
    
    this.currentY += 5;
    
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
    if (sample.aiSummary) {
      this.addSubtitle('Professional Analysis Summary');

      // Add summary text with proper formatting (no background to avoid black issue)
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(60, 60, 60);

      // Calculate summary text
      const maxWidth = this.pageWidth - (this.margin * 2);
      const lines = this.pdf.splitTextToSize(sample.aiSummary, maxWidth);

      // Add each line with proper spacing
      for (const line of lines) {
        this.addNewPageIfNeeded(6);
        this.pdf.text(line, this.margin, this.currentY);
        this.currentY += 6;
      }

      this.currentY += 5;

      if (sample.aiGeneratedAt) {
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(128, 128, 128);
        this.pdf.text(`Analysis generated on ${format(new Date(sample.aiGeneratedAt), 'MMMM dd, yyyy HH:mm')}`, this.margin, this.currentY);
        this.currentY += 10;
      }
    }
    
    this.addSeparator();
  }

  async exportSessionReport(session: SessionData, scores: ScoreData[]): Promise<void> {
    // Add session header
    this.addSessionHeader(session);
    
    // Add participants list
    this.addParticipantsList(session);
    
    // Add analysis for each sample
    for (const sessionSample of session.samples) {
      this.addSampleAnalysis(session, scores, sessionSample.sample.id);
    }
    
    // Add footer
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(128, 128, 128);
    const footerText = `Generated by CuppingLab • ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`;
    this.pdf.text(footerText, this.margin, this.pageHeight - 10);
    
    // Save the PDF
    const fileName = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    this.pdf.save(fileName);
  }
}

export const exportSessionToPDF = async (session: SessionData, scores: ScoreData[]): Promise<void> => {
  const exporter = new PDFExporter();
  await exporter.exportSessionReport(session, scores);
};
