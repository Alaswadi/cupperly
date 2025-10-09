import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../middleware/auth';

export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};

export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};

export const generateTokens = (payload: Omit<JWTPayload, 'iat' | 'exp'>) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return { accessToken, refreshToken };
};
