import * as msw from "msw/node";
import { handlers } from "./handlers";

export const server = msw.setupServer(...handlers);
