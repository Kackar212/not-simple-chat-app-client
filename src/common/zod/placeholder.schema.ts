import { z } from "zod";

export const placeholderSchema =
  z.custom<`data:image/${string};base64,${string}`>((val: string) =>
    /^data:image\/\w+;base64,(.*)$/g.test(val)
  );
