import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = new Error(
        result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")
      );
      (error as Error & { statusCode?: number }).statusCode = 400;
      return next(error);
    }
    req.body = result.data;
    next();
  };
}
