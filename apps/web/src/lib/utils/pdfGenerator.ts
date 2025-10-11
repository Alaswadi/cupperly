import jsPDF from 'jspdf';
import { GreenBeanGrading } from '@/types';
import { formatDefectType, formatProcessingMethod } from './formatters';

interface PDFReportOptions {
  grading: GreenBeanGrading;
  sampleName?: string;
  sampleOrigin?: string;
  sampleRegion?: string;
  sampleVariety?: string;
  processingMethod?: string;
}

export async function generateGradingPDF(options: PDFReportOptions): Promise<void> {
  const { grading, sampleName, sampleOrigin, sampleRegion, sampleVariety, processingMethod } = options;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Colors
  const primaryColor = [217, 119, 6]; // Amber-600
  const darkGray = [31, 41, 55]; // Gray-800
  const mediumGray = [107, 114, 128]; // Gray-500
  const lightGray = [229, 231, 235]; // Gray-200

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to draw a horizontal line
  const drawLine = (y: number, color: number[] = lightGray) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // ============================================================================
  // HEADER
  // ============================================================================
  
  // Logo/Title Area
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(margin, yPosition, contentWidth, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GREEN COFFEE BEAN GRADING REPORT', pageWidth / 2, yPosition + 10, { align: 'center' });
  
  yPosition += 20;

  // Report Info Box - Calculate height based on content
  let infoLines = 2; // Grading System and Date are always shown
  if (sampleName) infoLines++;
  if (sampleOrigin) infoLines++;
  if (sampleRegion) infoLines++;
  if (sampleVariety) infoLines++;
  if (processingMethod) infoLines++;

  const infoBoxHeight = (infoLines * 6) + 8;

  pdf.setFillColor(249, 250, 251); // Gray-50
  pdf.rect(margin, yPosition, contentWidth, infoBoxHeight, 'F');
  pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(margin, yPosition, contentWidth, infoBoxHeight, 'S');

  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  let infoY = yPosition + 7;
  const labelX = margin + 5;
  const valueX = margin + 45;

  if (sampleName) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Sample:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sampleName, valueX, infoY);
    infoY += 6;
  }

  if (sampleOrigin) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Origin:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sampleOrigin, valueX, infoY);
    infoY += 6;
  }

  if (sampleRegion) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Region:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sampleRegion, valueX, infoY);
    infoY += 6;
  }

  if (sampleVariety) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Variety:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(sampleVariety, valueX, infoY);
    infoY += 6;
  }

  if (processingMethod) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Processing:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatProcessingMethod(processingMethod), valueX, infoY);
    infoY += 6;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.text('Grading System:', labelX, infoY);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SCA (Specialty Coffee Association)', valueX, infoY);
  infoY += 6;

  if (grading.gradedAt) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date:', labelX, infoY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date(grading.gradedAt).toLocaleDateString(), valueX, infoY);
  }

  yPosition += infoBoxHeight + 5;

  // ============================================================================
  // GRADE CLASSIFICATION - Large Badge
  // ============================================================================
  
  checkNewPage(25);
  
  const gradeColor = grading.classification === 'SPECIALTY_GRADE' ? [34, 197, 94] :
                     grading.classification === 'PREMIUM_GRADE' ? [59, 130, 246] :
                     grading.classification === 'EXCHANGE_GRADE' ? [251, 146, 60] :
                     [239, 68, 68];

  pdf.setFillColor(gradeColor[0], gradeColor[1], gradeColor[2]);
  pdf.roundedRect(margin, yPosition, contentWidth, 20, 3, 3, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`GRADE: ${grading.grade || 'N/A'}`, pageWidth / 2, yPosition + 8, { align: 'center' });
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const classificationText = grading.classification?.replace(/_/g, ' ') || 'Not Classified';
  pdf.text(classificationText, pageWidth / 2, yPosition + 15, { align: 'center' });
  
  yPosition += 25;

  // ============================================================================
  // QUALITY SCORE
  // ============================================================================
  
  checkNewPage(30);

  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Quality Score', margin, yPosition);
  yPosition += 8;

  const scoreColor = (grading.qualityScore || 0) >= 90 ? [34, 197, 94] :
                     (grading.qualityScore || 0) >= 80 ? [59, 130, 246] :
                     (grading.qualityScore || 0) >= 70 ? [251, 146, 60] :
                     [239, 68, 68];

  pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  pdf.rect(margin, yPosition, 60, 18, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${grading.qualityScore?.toFixed(1) || 'N/A'}`, margin + 30, yPosition + 12, { align: 'center' });

  pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Based on defects, moisture, water activity, density, and uniformity', margin + 65, yPosition + 10);

  yPosition += 25;

  // ============================================================================
  // DEFECT ANALYSIS
  // ============================================================================

  checkNewPage(60);

  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Defect Analysis', margin, yPosition);
  yPosition += 8;

  // Defect boxes
  const boxWidth = (contentWidth - 10) / 3;
  
  // Primary Defects
  pdf.setFillColor(254, 226, 226); // Red-100
  pdf.rect(margin, yPosition, boxWidth, 20, 'F');
  pdf.setDrawColor(252, 165, 165); // Red-300
  pdf.rect(margin, yPosition, boxWidth, 20, 'S');
  
  pdf.setTextColor(153, 27, 27); // Red-900
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Primary Defects (Cat 1)', margin + boxWidth / 2, yPosition + 6, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(String(grading.primaryDefects), margin + boxWidth / 2, yPosition + 14, { align: 'center' });
  
  // Secondary Defects
  pdf.setFillColor(254, 249, 195); // Yellow-100
  pdf.rect(margin + boxWidth + 5, yPosition, boxWidth, 20, 'F');
  pdf.setDrawColor(253, 224, 71); // Yellow-300
  pdf.rect(margin + boxWidth + 5, yPosition, boxWidth, 20, 'S');
  
  pdf.setTextColor(113, 63, 18); // Yellow-900
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Secondary Defects (Cat 2)', margin + boxWidth + 5 + boxWidth / 2, yPosition + 6, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(String(grading.secondaryDefects), margin + boxWidth + 5 + boxWidth / 2, yPosition + 14, { align: 'center' });
  
  // Full Defect Equivalents
  pdf.setFillColor(243, 244, 246); // Gray-100
  pdf.rect(margin + (boxWidth + 5) * 2, yPosition, boxWidth, 20, 'F');
  pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.rect(margin + (boxWidth + 5) * 2, yPosition, boxWidth, 20, 'S');

  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Full Defect Equivalents', margin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 6, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(grading.fullDefectEquivalents.toFixed(1), margin + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 14, { align: 'center' });
  
  yPosition += 25;

  // Defect Breakdown Table
  if (grading.defectBreakdown && grading.defectBreakdown.length > 0) {
    checkNewPage(15 + (grading.defectBreakdown.length * 7));
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Defect Breakdown', margin, yPosition);
    yPosition += 7;

    // Table header
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');

    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Defect Type', margin + 3, yPosition + 5.5);
    pdf.text('Category', margin + contentWidth - 50, yPosition + 5.5);
    pdf.text('Count', margin + contentWidth - 15, yPosition + 5.5, { align: 'right' });

    yPosition += 8;

    // Table rows
    pdf.setFont('helvetica', 'normal');
    grading.defectBreakdown.forEach((defect, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition, contentWidth, 7, 'F');
      }

      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text(formatDefectType(defect.type), margin + 3, yPosition + 5);

      const catColor = defect.category === 1 ? [220, 38, 38] : [202, 138, 4];
      pdf.setTextColor(catColor[0], catColor[1], catColor[2]);
      pdf.text(`Cat ${defect.category}`, margin + contentWidth - 50, yPosition + 5);

      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.text(String(defect.count), margin + contentWidth - 15, yPosition + 5, { align: 'right' });
      
      yPosition += 7;
    });
    
    yPosition += 5;
  }

  // ============================================================================
  // PHYSICAL & CHEMICAL PROPERTIES
  // ============================================================================
  
  checkNewPage(50);

  pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Physical & Chemical Properties', margin, yPosition);
  yPosition += 10;

  const propertyBoxWidth = (contentWidth - 5) / 2;
  let propertyX = margin;
  let propertyY = yPosition;
  let propertyCount = 0;

  const addProperty = (label: string, value: string, ideal: string, color: number[]) => {
    if (propertyCount > 0 && propertyCount % 2 === 0) {
      propertyY += 22;
      propertyX = margin;
      checkNewPage(22);
    }

    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(propertyX, propertyY, propertyBoxWidth, 20, 'F');
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(propertyX, propertyY, propertyBoxWidth, 20, 'S');

    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, propertyX + 3, propertyY + 6);

    pdf.setFontSize(14);
    pdf.text(value, propertyX + 3, propertyY + 14);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.text(ideal, propertyX + 3, propertyY + 18);
    
    propertyX += propertyBoxWidth + 5;
    propertyCount++;
  };

  if (grading.moistureContent) {
    addProperty('Moisture Content', `${grading.moistureContent.toFixed(1)}%`, 'Ideal: 10-12%', [219, 234, 254]);
  }

  if (grading.waterActivity) {
    addProperty('Water Activity (aw)', grading.waterActivity.toFixed(2), 'Ideal: 0.55-0.65', [207, 250, 254]);
  }

  if (grading.bulkDensity) {
    addProperty('Bulk Density', `${grading.bulkDensity.toFixed(1)} g/L`, 'Ideal: 650-750 g/L', [243, 232, 255]);
  }

  if (grading.beanColorAssessment) {
    addProperty('Bean Color Assessment', grading.beanColorAssessment, 'Visual assessment', [254, 243, 199]);
  }

  if (grading.uniformityScore) {
    addProperty('Uniformity Score', `${grading.uniformityScore}/10`, 'Bean consistency', [220, 252, 231]);
  }

  yPosition = propertyY + (propertyCount > 0 ? 25 : 0);

  // ============================================================================
  // SCREEN SIZE DISTRIBUTION
  // ============================================================================
  
  if (grading.screenSizeDistribution) {
    const sizes = [13, 14, 15, 16, 17, 18, 19, 20];
    const hasDistribution = sizes.some(size => (grading.screenSizeDistribution as any)?.[`size${size}`] > 0);
    
    if (hasDistribution) {
      checkNewPage(60);

      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Screen Size Distribution', margin, yPosition);
      yPosition += 10;

      sizes.forEach(size => {
        const percentage = (grading.screenSizeDistribution as any)?.[`size${size}`] || 0;
        if (percentage > 0) {
          checkNewPage(10);

          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
          pdf.text(`Screen ${size} (${size}/64 inch)`, margin, yPosition);
          pdf.text(`${percentage.toFixed(1)}%`, pageWidth - margin, yPosition, { align: 'right' });

          yPosition += 3;

          // Progress bar
          pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
          pdf.rect(margin, yPosition, contentWidth, 4, 'F');

          pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          const barWidth = (percentage / 100) * contentWidth;
          pdf.rect(margin, yPosition, barWidth, 4, 'F');
          
          yPosition += 8;
        }
      });

      if (grading.averageScreenSize) {
        yPosition += 2;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        pdf.text(`Average Screen Size: ${grading.averageScreenSize.toFixed(1)}`, margin, yPosition);
        yPosition += 10;
      }
    }
  }

  // ============================================================================
  // NOTES
  // ============================================================================

  if (grading.notes) {
    checkNewPage(30);

    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Additional Notes', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(grading.notes, contentWidth);
    pdf.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 10;
  }

  // ============================================================================
  // FOOTER - Certification
  // ============================================================================
  
  if (grading.certifiedBy || grading.gradedBy) {
    checkNewPage(25);
    
    drawLine(yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

    if (grading.gradedBy) {
      pdf.text('Graded By:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(grading.gradedBy, margin + 25, yPosition);
    }

    if (grading.certifiedBy) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Certified By:', pageWidth - margin - 60, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(grading.certifiedBy, pageWidth - margin - 30, yPosition);
    }

    if (grading.certificationDate) {
      yPosition += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      pdf.text(`Certification Date: ${new Date(grading.certificationDate).toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
    }
  }

  // ============================================================================
  // SAVE PDF
  // ============================================================================
  
  const filename = `Green_Bean_Grading_Report_${sampleName?.replace(/\s+/g, '_') || 'Sample'}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
}

