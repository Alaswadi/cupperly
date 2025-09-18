import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

const scaStandardCategories = [
  {
    name: "Fragrance/Aroma",
    weight: 1,
    description: "The smell of the coffee when dry and when infused with hot water"
  },
  {
    name: "Flavor",
    weight: 1,
    description: "The taste of the coffee when sipped"
  },
  {
    name: "Aftertaste",
    weight: 1,
    description: "The length of positive flavor qualities emanating from the back of the palate"
  },
  {
    name: "Acidity",
    weight: 1,
    description: "The brightness and liveliness of the coffee"
  },
  {
    name: "Body",
    weight: 1,
    description: "The tactile feeling of the liquid in the mouth"
  },
  {
    name: "Balance",
    weight: 1,
    description: "How all the various aspects of flavor, aftertaste, acidity and body work together"
  },
  {
    name: "Uniformity",
    weight: 1,
    description: "How consistent the flavor is across multiple cups"
  },
  {
    name: "Clean Cup",
    weight: 1,
    description: "A lack of interfering negative impressions from ingestion to aftertaste"
  },
  {
    name: "Sweetness",
    weight: 1,
    description: "How much sweetness is perceived in the coffee"
  },
  {
    name: "Overall",
    weight: 1,
    description: "The holistic assessment of the sample as perceived by the individual panelist"
  }
];

export async function fixInvalidTemplates(organizationId: string, userId: string) {
  try {
    console.log('Checking for invalid templates...');
    
    // Find all templates for this organization
    const allTemplates = await prisma.cuppingTemplate.findMany({
      where: { organizationId }
    });
    
    console.log('Found templates:', allTemplates.map(t => ({ id: t.id, name: t.name })));
    
    // Check for templates with invalid IDs (not proper UUIDs)
    const invalidTemplates = allTemplates.filter(template => {
      // Check if ID is a proper cuid (starts with 'c' and has proper length)
      return !template.id.match(/^c[a-z0-9]{24}$/);
    });
    
    console.log('Invalid templates found:', invalidTemplates.map(t => ({ id: t.id, name: t.name })));
    
    // Delete invalid templates
    for (const template of invalidTemplates) {
      console.log(`Deleting invalid template: ${template.id} (${template.name})`);
      await prisma.cuppingTemplate.delete({
        where: { id: template.id }
      });
    }
    
    // Check if we have a valid SCA Standard template
    const scaTemplate = await prisma.cuppingTemplate.findFirst({
      where: {
        organizationId,
        name: "SCA Standard",
        isDefault: true
      }
    });
    
    if (!scaTemplate) {
      console.log('Creating new SCA Standard template with proper UUID...');
      const newTemplate = await prisma.cuppingTemplate.create({
        data: {
          organizationId,
          createdBy: userId,
          name: "SCA Standard",
          description: "Standard SCA cupping form with 10 categories",
          isDefault: true,
          isPublic: true,
          scoringSystem: "SCA",
          maxScore: 100,
          categories: scaStandardCategories
        }
      });
      console.log('Created new SCA Standard template:', newTemplate.id);
      return newTemplate;
    } else {
      console.log('Valid SCA Standard template exists:', scaTemplate.id);
      return scaTemplate;
    }
    
  } catch (error) {
    console.error('Error fixing templates:', error);
    throw error;
  }
}
