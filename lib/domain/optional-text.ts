import { z } from "zod";

export function optionalText(max: number) {
  return z.string().trim().max(max).nullish();
}

export function optionalTextRule(max: number, check: (value: string) => boolean, message: string) {
  return z
    .string()
    .trim()
    .max(max)
    .refine(check, message)
    .nullish();
}
