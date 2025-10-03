
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  domain: 'domain',
  subdomain: 'subdomain',
  description: 'description',
  logo: 'logo',
  website: 'website',
  subscriptionStatus: 'subscriptionStatus',
  subscriptionPlan: 'subscriptionPlan',
  trialEndsAt: 'trialEndsAt',
  subscriptionEndsAt: 'subscriptionEndsAt',
  stripeCustomerId: 'stripeCustomerId',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  avatar: 'avatar',
  bio: 'bio',
  organizationId: 'organizationId',
  role: 'role',
  emailVerified: 'emailVerified',
  emailVerifiedAt: 'emailVerifiedAt',
  lastLoginAt: 'lastLoginAt',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  preferences: 'preferences',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvitationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  organizationId: 'organizationId',
  role: 'role',
  token: 'token',
  status: 'status',
  expiresAt: 'expiresAt',
  invitedBy: 'invitedBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SampleScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  code: 'code',
  origin: 'origin',
  region: 'region',
  farm: 'farm',
  producer: 'producer',
  variety: 'variety',
  altitude: 'altitude',
  processingMethod: 'processingMethod',
  harvestDate: 'harvestDate',
  roaster: 'roaster',
  roastDate: 'roastDate',
  roastLevel: 'roastLevel',
  moisture: 'moisture',
  density: 'density',
  screenSize: 'screenSize',
  notes: 'notes',
  imageUrl: 'imageUrl',
  tags: 'tags',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CuppingTemplateScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  createdBy: 'createdBy',
  name: 'name',
  description: 'description',
  isDefault: 'isDefault',
  isPublic: 'isPublic',
  scoringSystem: 'scoringSystem',
  maxScore: 'maxScore',
  categories: 'categories',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CuppingSessionScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  createdBy: 'createdBy',
  name: 'name',
  description: 'description',
  location: 'location',
  templateId: 'templateId',
  blindTasting: 'blindTasting',
  allowComments: 'allowComments',
  requireCalibration: 'requireCalibration',
  status: 'status',
  scheduledAt: 'scheduledAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt',
  notes: 'notes',
  tags: 'tags',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionParticipantScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt',
  isActive: 'isActive',
  isCalibrated: 'isCalibrated',
  calibratedAt: 'calibratedAt'
};

exports.Prisma.SessionSampleScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  sampleId: 'sampleId',
  position: 'position',
  isBlind: 'isBlind',
  blindCode: 'blindCode',
  grindSize: 'grindSize',
  waterTemp: 'waterTemp',
  brewRatio: 'brewRatio',
  steepTime: 'steepTime',
  addedAt: 'addedAt'
};

exports.Prisma.ScoreScalarFieldEnum = {
  id: 'id',
  sessionId: 'sessionId',
  sessionSampleId: 'sessionSampleId',
  sampleId: 'sampleId',
  userId: 'userId',
  totalScore: 'totalScore',
  maxScore: 'maxScore',
  scores: 'scores',
  aroma: 'aroma',
  flavor: 'flavor',
  aftertaste: 'aftertaste',
  acidity: 'acidity',
  body: 'body',
  balance: 'balance',
  sweetness: 'sweetness',
  cleanliness: 'cleanliness',
  uniformity: 'uniformity',
  overall: 'overall',
  defects: 'defects',
  notes: 'notes',
  privateNotes: 'privateNotes',
  voiceNotes: 'voiceNotes',
  voiceFileUrl: 'voiceFileUrl',
  isComplete: 'isComplete',
  isSubmitted: 'isSubmitted',
  submittedAt: 'submittedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GreenBeanGradingScalarFieldEnum = {
  id: 'id',
  sampleId: 'sampleId',
  gradingSystem: 'gradingSystem',
  primaryDefects: 'primaryDefects',
  secondaryDefects: 'secondaryDefects',
  fullDefectEquivalents: 'fullDefectEquivalents',
  defectBreakdown: 'defectBreakdown',
  screenSizeDistribution: 'screenSizeDistribution',
  averageScreenSize: 'averageScreenSize',
  uniformityPercentage: 'uniformityPercentage',
  moistureContent: 'moistureContent',
  waterActivity: 'waterActivity',
  bulkDensity: 'bulkDensity',
  uniformityScore: 'uniformityScore',
  grade: 'grade',
  classification: 'classification',
  qualityScore: 'qualityScore',
  gradedBy: 'gradedBy',
  gradedAt: 'gradedAt',
  certifiedBy: 'certifiedBy',
  certificationDate: 'certificationDate',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  beanColorAssessment: 'beanColorAssessment'
};

exports.Prisma.FlavorDescriptorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  description: 'description',
  isDefault: 'isDefault',
  organizationId: 'organizationId',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ScoreFlavorDescriptorScalarFieldEnum = {
  id: 'id',
  scoreId: 'scoreId',
  flavorDescriptorId: 'flavorDescriptorId',
  intensity: 'intensity',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.SubscriptionStatus = exports.$Enums.SubscriptionStatus = {
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  UNPAID: 'UNPAID'
};

exports.SubscriptionPlan = exports.$Enums.SubscriptionPlan = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
  CUSTOM: 'CUSTOM'
};

exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  CUPPER: 'CUPPER'
};

exports.InvitationStatus = exports.$Enums.InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REVOKED: 'REVOKED'
};

exports.ProcessingMethod = exports.$Enums.ProcessingMethod = {
  WASHED: 'WASHED',
  NATURAL: 'NATURAL',
  HONEY: 'HONEY',
  SEMI_WASHED: 'SEMI_WASHED',
  WET_HULLED: 'WET_HULLED',
  ANAEROBIC: 'ANAEROBIC',
  CARBONIC_MACERATION: 'CARBONIC_MACERATION',
  OTHER: 'OTHER'
};

exports.RoastLevel = exports.$Enums.RoastLevel = {
  LIGHT: 'LIGHT',
  MEDIUM_LIGHT: 'MEDIUM_LIGHT',
  MEDIUM: 'MEDIUM',
  MEDIUM_DARK: 'MEDIUM_DARK',
  DARK: 'DARK',
  FRENCH: 'FRENCH',
  ITALIAN: 'ITALIAN'
};

exports.ScoringSystem = exports.$Enums.ScoringSystem = {
  SCA: 'SCA',
  COE: 'COE',
  CUSTOM: 'CUSTOM'
};

exports.SessionStatus = exports.$Enums.SessionStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ARCHIVED: 'ARCHIVED'
};

exports.ParticipantRole = exports.$Enums.ParticipantRole = {
  CUPPER: 'CUPPER',
  HEAD_JUDGE: 'HEAD_JUDGE',
  OBSERVER: 'OBSERVER'
};

exports.GradingSystem = exports.$Enums.GradingSystem = {
  SCA: 'SCA'
};

exports.GradeClassification = exports.$Enums.GradeClassification = {
  SPECIALTY_GRADE: 'SPECIALTY_GRADE',
  PREMIUM_GRADE: 'PREMIUM_GRADE',
  EXCHANGE_GRADE: 'EXCHANGE_GRADE',
  BELOW_STANDARD: 'BELOW_STANDARD',
  OFF_GRADE: 'OFF_GRADE'
};

exports.FlavorCategory = exports.$Enums.FlavorCategory = {
  POSITIVE: 'POSITIVE',
  NEGATIVE: 'NEGATIVE'
};

exports.Prisma.ModelName = {
  Organization: 'Organization',
  User: 'User',
  Invitation: 'Invitation',
  Sample: 'Sample',
  CuppingTemplate: 'CuppingTemplate',
  CuppingSession: 'CuppingSession',
  SessionParticipant: 'SessionParticipant',
  SessionSample: 'SessionSample',
  Score: 'Score',
  GreenBeanGrading: 'GreenBeanGrading',
  FlavorDescriptor: 'FlavorDescriptor',
  ScoreFlavorDescriptor: 'ScoreFlavorDescriptor'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
