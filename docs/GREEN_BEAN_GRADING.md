# Green Coffee Bean Grading Feature

## Overview

The Green Coffee Bean Grading feature allows users to grade green (unroasted) coffee beans according to professional standards, primarily the SCA (Specialty Coffee Association) grading system. This feature helps coffee professionals assess the quality of green coffee beans before roasting.

## Features

### ✅ Implemented (Phase 1 & 2)

1. **SCA Grading System**
   - Primary defects (Category 1) counting
   - Secondary defects (Category 2) counting
   - Automatic full defect equivalent calculation
   - Grade classification (Specialty, Premium, Exchange, Below Standard)

2. **Defect Calculator**
   - Interactive defect entry with type selection
   - Real-time calculation of full defect equivalents
   - Visual grade classification with color coding
   - Support for multiple defect types per category

3. **Additional Quality Assessments**
   - Moisture content (% with ideal range 10-12%)
   - Water activity (aw value with ideal range 0.55-0.65)
   - Bulk density (g/L)
   - Color score (1-10 scale)
   - Uniformity score (1-10 scale)

4. **Quality Score Calculation**
   - Automatic calculation based on all factors
   - 0-100 scale
   - Considers defects, moisture, water activity, color, and uniformity

5. **User Interface**
   - Tab-based interface in sample detail page
   - Intuitive defect entry with add/remove functionality
   - Visual grade badges and indicators
   - Responsive design matching existing platform style

6. **Database & API**
   - Separate `green_bean_gradings` table
   - RESTful API endpoints
   - Full CRUD operations
   - Grade preview calculation without saving

### 🚧 Planned (Phase 3 & 4)

1. **Screen Size Distribution**
   - Input for screen sizes 14-20
   - Visual distribution chart
   - Average screen size calculation
   - Uniformity percentage

2. **Regional Grading Systems**
   - Ethiopian grading system
   - Colombian grading system
   - Brazilian grading system
   - Kenyan grading system

3. **Advanced Features**
   - PDF report generation
   - Grading history/audit trail
   - Comparison between grading systems
   - Certification tracking

## Database Schema

### GreenBeanGrading Table

```sql
CREATE TABLE green_bean_gradings (
  id                      TEXT PRIMARY KEY,
  sampleId                TEXT UNIQUE NOT NULL,
  gradingSystem           grading_system DEFAULT 'SCA',
  primaryDefects          INTEGER DEFAULT 0,
  secondaryDefects        INTEGER DEFAULT 0,
  fullDefectEquivalents   FLOAT DEFAULT 0,
  defectBreakdown         JSON DEFAULT '[]',
  screenSizeDistribution  JSON,
  averageScreenSize       FLOAT,
  uniformityPercentage    FLOAT,
  moistureContent         FLOAT,
  waterActivity           FLOAT,
  bulkDensity             FLOAT,
  colorScore              INTEGER,
  uniformityScore         INTEGER,
  grade                   TEXT,
  classification          grade_classification,
  qualityScore            FLOAT,
  gradedBy                TEXT,
  gradedAt                TIMESTAMP,
  certifiedBy             TEXT,
  certificationDate       TIMESTAMP,
  notes                   TEXT,
  createdAt               TIMESTAMP DEFAULT NOW(),
  updatedAt               TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (sampleId) REFERENCES samples(id) ON DELETE CASCADE
);
```

## API Endpoints

### Get Grading
```
GET /api/samples/:sampleId/grading
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "sampleId": "...",
    "gradingSystem": "SCA",
    "primaryDefects": 3,
    "secondaryDefects": 10,
    "fullDefectEquivalents": 5.0,
    "classification": "SPECIALTY_GRADE",
    "grade": "Grade 1",
    "qualityScore": 92.5,
    ...
  }
}
```

### Create Grading
```
POST /api/samples/:sampleId/grading
```

**Request Body:**
```json
{
  "gradingSystem": "SCA",
  "primaryDefects": 3,
  "secondaryDefects": 10,
  "defectBreakdown": [
    { "type": "full_black", "count": 2, "category": 1 },
    { "type": "full_sour", "count": 1, "category": 1 },
    { "type": "partial_black", "count": 5, "category": 2 },
    { "type": "parchment", "count": 5, "category": 2 }
  ],
  "moistureContent": 11.2,
  "waterActivity": 0.60,
  "colorScore": 8,
  "uniformityScore": 9,
  "notes": "Excellent quality beans from high altitude farm"
}
```

### Update Grading
```
PUT /api/samples/:sampleId/grading
```

### Delete Grading
```
DELETE /api/samples/:sampleId/grading
```

### Calculate Preview
```
POST /api/samples/:sampleId/grading/calculate
```

**Request Body:**
```json
{
  "primaryDefects": 3,
  "secondaryDefects": 10,
  "moistureContent": 11.2,
  "waterActivity": 0.60,
  "colorScore": 8,
  "uniformityScore": 9
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fullDefectEquivalents": 5.0,
    "classification": "SPECIALTY_GRADE",
    "grade": "Grade 1",
    "qualityScore": 92.5
  }
}
```

## SCA Grading Standards

### Defect Categories

**Primary Defects (Category 1)** - 1 defect = 1 full defect equivalent:
- Full Black
- Full Sour
- Dried Cherry/Pod
- Fungus Damage
- Foreign Matter
- Severe Insect Damage

**Secondary Defects (Category 2)** - 5 defects = 1 full defect equivalent:
- Partial Black
- Partial Sour
- Parchment
- Floater
- Immature/Unripe
- Withered
- Shell
- Broken/Chipped/Cut
- Hull/Husk
- Slight Insect Damage

### Grade Classifications

| Classification | Full Defect Equivalents | Grade Label |
|---------------|------------------------|-------------|
| Specialty Grade | 0-5 | Grade 1 |
| Premium Grade | 6-8 | Grade 2 |
| Exchange Grade | 9-23 | Grade 3 |
| Below Standard | 24+ | Below Standard |

## Usage Guide

### Accessing Green Bean Grading

1. Navigate to **Samples** in the dashboard
2. Click on a sample to view details
3. Click the **"Green Bean Grading"** tab
4. Fill in the grading information

### Adding Defects

1. Click **"Add Primary Defect"** or **"Add Secondary Defect"**
2. Select the defect type from the dropdown
3. Enter the count
4. The full defect equivalents and grade are calculated automatically
5. Add more defects as needed or remove unwanted entries

### Entering Quality Metrics

1. Enter moisture content (ideal: 10-12%)
2. Enter water activity (ideal: 0.55-0.65)
3. Enter bulk density if measured
4. Rate color uniformity (1-10 scale)
5. Rate overall uniformity (1-10 scale)

### Saving Grading

1. Review the calculated grade and quality score
2. Add any notes
3. Click **"Save Grading"** to create or **"Update Grading"** to modify

## Component Architecture

```
apps/web/src/components/samples/grading/
├── DefectCalculator.tsx           # Interactive defect entry and calculation
├── GradeClassificationBadge.tsx   # Visual grade indicator
├── GreenBeanGradingForm.tsx       # Main grading form
└── GradingSummaryCard.tsx         # Read-only summary display
```

## Backend Architecture

```
apps/api/src/
├── services/
│   └── greenBeanGradingService.ts  # Business logic and calculations
└── routes/
    └── greenBeanGrading.ts         # API endpoints
```

## Future Enhancements

1. **Screen Size Distribution** (Phase 3)
   - Visual bar chart for size distribution
   - Automatic uniformity calculation
   - Average screen size display

2. **Regional Systems** (Phase 4)
   - Ethiopian: Q1, Q2, UG grades
   - Colombian: Supremo, Excelso, UGQ
   - Brazilian: NY 2-8 grading
   - Kenyan: AA, AB, C, E, PB, TT grades

3. **Reporting**
   - PDF export with charts
   - Comparison reports
   - Historical tracking

4. **Certification**
   - Official certification tracking
   - Certifier information
   - Certification date and validity

## Testing

To test the feature:

1. Start the development environment
2. Navigate to a sample
3. Click the "Green Bean Grading" tab
4. Add some defects and quality metrics
5. Verify the grade calculation is correct
6. Save and reload to verify persistence

## Support

For issues or questions about the green bean grading feature, please contact the development team or create an issue in the repository.

