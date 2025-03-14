"use client";

import { io } from "socket.io-client";
import { Socket } from "./socket.type";

export const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  autoConnect: false,
  withCredentials: true,
});
