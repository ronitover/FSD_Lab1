/** The parts of a zod error that forms need, without depending on zod directly. */
interface ValidationError {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** The first message for each top-level field, ready to show under its input. */
export function fieldErrors<T>(error: ValidationError): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof T | undefined;
    if (field !== undefined && errors[field] === undefined) errors[field] = issue.message;
  }
  return errors;
}
