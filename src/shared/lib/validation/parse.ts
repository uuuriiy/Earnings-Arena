import { ZodError, type ZodType } from "zod";

export function parseBody<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function zodIssues(err: unknown) {
  if (err instanceof ZodError) {
    return {
      error: "Validation failed",
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    };
  }
  return null;
}
