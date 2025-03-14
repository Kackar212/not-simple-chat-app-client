import { ClientSocketEvents } from "@common/interfaces/client-socket-events.interface";
import { ServerSocketEvents } from "@common/interfaces/server-socket.events.interface";
import { Socket as _Socket } from "socket.io-client";

export type Socket = _Socket<ServerSocketEvents, ClientSocketEvents>;
