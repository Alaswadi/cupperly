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

export async function seedDefaultTemplates(organizationId: string, userId: string) {
  try {
    // Check if SCA Standard template already exists
    const existingTemplate = await prisma.cuppingTemplate.findFirst({
      where: {
        organizationId,
        name: "SCA Standard",
        isDefault: true
      }
    });

    if (existingTemplate) {
      console.log('SCA Standard template already exists:', existingTemplate.id);
      return existingTemplate;
    }

    // Create SCA Standard template
    const scaTemplate = await prisma.cuppingTemplate.create({
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

    console.log('Created SCA Standard template:', scaTemplate.id);
    return scaTemplate;
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
}

export async function ensureDefaultTemplate(organizationId: string, userId: string) {
  return await seedDefaultTemplates(organizationId, userId);
}
