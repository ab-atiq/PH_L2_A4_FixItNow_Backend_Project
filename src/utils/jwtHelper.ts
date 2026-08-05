// import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export type TJwtPayload = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

// const generateToken = (
//   payload: TJwtPayload,
//   secret: Secret,
//   expiresIn: SignOptions["expiresIn"]
// ): string => {
//   return jwt.sign(payload, secret, { expiresIn } as SignOptions);
// };

// const verifyToken = (token: string, secret: Secret): TJwtPayload => {
//   return jwt.verify(token, secret) as TJwtPayload;
// };

// export const jwtHelper = {
//   generateToken,
//   verifyToken,
// };

const createToken = (
  // payload: JwtPayload,
  payload: TJwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: any) {
    console.log("Token verification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtHelper = {
  createToken,
  verifyToken,
};
