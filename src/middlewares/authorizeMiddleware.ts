import type { Request, Response, NextFunction } from "express";

type UserRole = "user" | "admin";

const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    next();
  };
};

export default authorize;
