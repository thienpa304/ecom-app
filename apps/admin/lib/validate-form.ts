type ZodIssueLike = {
  path: (string | number)[];
  message: string;
};

type ZodErrorLike = {
  issues: ZodIssueLike[];
};

export function formatZodError(error: ZodErrorLike): string {
  const first = error.issues[0];
  if (!first) return "Dữ liệu không hợp lệ";
  const path = first.path.length ? `${first.path.join(".")}: ` : "";
  return `${path}${first.message}`;
}
