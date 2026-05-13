import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type Rol = "estudiante" | "evaluador" | "administrador";

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  rol: Rol;
  universidad_id: number | null;
  carrera_id: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing token" });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser & { iat?: number; exp?: number };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      rol: decoded.rol,
      universidad_id: decoded.universidad_id ?? null,
      carrera_id: decoded.carrera_id ?? null,
    };
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

export function requireRole(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "no auth" });
    if (!roles.includes(req.user.rol)) return res.status(403).json({ error: "rol no autorizado" });
    next();
  };
}
