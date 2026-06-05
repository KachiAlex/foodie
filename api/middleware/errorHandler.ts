import { Prisma } from "../generated/prisma/client";
import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

const CONNECTION_ERROR_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server was reached but timed out
  "P1003", // Database does not exist
  "P1008", // Operations timed out
  "P1009", // Database already exists
  "P1010", // User was denied access
  "P1011", // Error opening a TLS connection
]);

function getPrismaErrorCode(err: ApiError): string | undefined {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code;
  }
  return undefined;
}

function isDbConnectionError(err: ApiError): boolean {
  const code = getPrismaErrorCode(err);
  const msg = err.message || "";
  return (
    err instanceof Prisma.PrismaClientInitializationError ||
    (code && CONNECTION_ERROR_CODES.has(code)) ||
    msg.includes("No database host") ||
    msg.includes("connection string") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("Connection refused")
  );
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // eslint-disable-next-line no-console
  console.error("[errorHandler]", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "INTERNAL_ERROR";

  const prismaCode = getPrismaErrorCode(err);

  if (statusCode >= 500 && isDbConnectionError(err)) {
    message = "Database connection failed. Please check the server configuration.";
    code = "DB_CONNECTION_ERROR";
  }

  // P2025 = Record to update/delete does not exist — return 404
  if (prismaCode === "P2025") {
    statusCode = 404;
    message = "Record not found";
    code = "NOT_FOUND";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
}
