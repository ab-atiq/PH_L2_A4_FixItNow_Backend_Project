import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";

export type TJwtPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const generateToken = (
  payload: TJwtPayload,
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (token: string, secret: Secret): TJwtPayload => {
  return jwt.verify(token, secret) as TJwtPayload;
};

export const jwtHelper = {
  generateToken,
  verifyToken,
};
