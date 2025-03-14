import { zodResolver as _zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, UseFormProps } from "react-hook-form";
import { z } from "zod";

const createDefaultSettings = <
  T extends FieldValues = FieldValues,
  Schema extends z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T> = z.ZodEffects<
    z.ZodObject<T>
  >
>(
  schema: Schema
) => {
  return {
    resolver: _zodResolver(schema, {
      errorMap: (issue, ctx) => {
        const name = issue.path.at(-1);
        const transformedDefaultMessage = ctx.defaultError.startsWith("String")
          ? ctx.defaultError.substring(6)
          : ctx.defaultError;

        return {
          message: issue.message || transformedDefaultMessage,
        };
      },
    }),
  };
};

export const createConfig = <
  T extends FieldValues = FieldValues,
  Schema extends z.ZodEffects<z.ZodObject<T>> | z.ZodObject<T> = z.ZodEffects<
    z.ZodObject<T>
  >
>(
  schema: Schema,
  config?: UseFormProps<z.infer<typeof schema>>
) => {
  return {
    ...createDefaultSettings<T, Schema>(schema),
    ...config,
  };
};
