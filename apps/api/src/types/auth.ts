import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

