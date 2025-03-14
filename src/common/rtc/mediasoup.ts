import { User } from "@common/api/schemas/user.schema";
import {
  createAudioContext,
  createAudioWorklet,
  onAudioWorkletMessage,
} from "@common/hooks/use-microphone/use-microphone.helpers";
import { socket } from "@common/socket";
import { Device } from "mediasoup-client";
import {
  Consumer,
  Producer,
  RtpCapabilities,
  Transport,
  TransportOptions,
} from "mediasoup-client/lib/types";

interface MediasoupStorage {
  consumers: Consumer[];
  producer: Producer | null;
  produceTransport: Transport | null;
  consumeTransport: Transport | null;
  members: Map<
    string,
    {
      user: User;
      consumer: Consumer;
      isMuted: boolean;
      audio: HTMLAudioElement;
    }
  >;
  destroy: () => void;
}

const iceServers = [
  { urls: "stun:stun.relay.metered.ca:80" },
  {
    urls: "turn:global.relay.metered.ca:80",
    username: "93ad1d9d5a0875125ed41635",
    credential: "fEYdtDWPa0jHe95l",
  },
  {
    urls: "turn:global.relay.metered.ca:80?transport=tcp",
    username: "93ad1d9d5a0875125ed41635",
    credential: "fEYdtDWPa0jHe95l",
  },
  {
    urls: "turn:global.relay.metered.ca:443",
    username: "93ad1d9d5a0875125ed41635",
    credential: "fEYdtDWPa0jHe95l",
  },
  {
    urls: "turns:global.relay.metered.ca:443?transport=tcp",
    username: "93ad1d9d5a0875125ed41635",
    credential: "fEYdtDWPa0jHe95l",
  },
];

export const mediasoupStorage: MediasoupStorage = {
  consumers: [],
  producer: null,
  produceTransport: null,
  consumeTransport: null,
  members: new Map(),
  destroy() {
    this.producer?.close();
    this.producer?.track?.stop();
    this.consumers.forEach((consumer) => consumer.close());
    this.produceTransport?.close();
    this.consumeTransport?.close();

    this.produceTransport = null;
    this.consumeTransport = null;
    this.consumers = [];
    this.members = new Map();
    this.producer = null;
  },
};

let device: Device;
export function getDevice() {
  if (device) {
    return device;
  }

  device = new Device();

  return device;
}

export enum TransportType {
  Produce = "Produce",
  Consume = "Consume",
}

interface CreateTransportProps {
  type: TransportType;
  rtpCapabilities: RtpCapabilities;
  channelId: number;
  isMuted?: boolean;
}

export const toggleProducer = (channelId: number) => {
  const { producer } = mediasoupStorage;

  if (!producer) {
    return;
  }

  const { paused } = producer;

  producer.pause();

  if (paused) {
    producer.resume();
  }

  socket.emit("changeProducerState", { isMuted: !producer.paused, channelId });
};

const getTransport = (
  type: TransportType,
  transportOptions: TransportOptions
) => {
  if (type === TransportType.Consume) {
    return device.createRecvTransport(transportOptions);
  }

  return device.createSendTransport(transportOptions);
};

export async function createTransport({
  type,
  rtpCapabilities,
  channelId,
  isMuted = true,
}: CreateTransportProps): Promise<Transport> {
  return new Promise((resolve) => {
    socket.once(
      `create${type}Transport`,
      async ({ params: transportOptions }) => {
        const mergedTransportOptions = {
          ...transportOptions,
          iceServers,
        };

        const transport = getTransport(type, mergedTransportOptions);

        transport.on("connect", ({ dtlsParameters }, resolve, reject) => {
          socket.on("transportConnected", ({ success }) => {
            if (!success) {
              reject(new Error());
            }

            resolve();
          });

          socket.emit("connectTransport", {
            dtlsParameters,
            channelId,
            isProducer: type === TransportType.Produce,
          });
        });

        transport.on("produce", (producerOptions, onSuccess, onError) => {
          socket.on("produce", (producerId: string) => {
            onSuccess({ id: producerId });
          });

          socket.emit("produce", { channelId, producerOptions, isMuted });
        });

        resolve(transport);
      }
    );

    socket.emit("createTransport", {
      isProducer: type === TransportType.Produce,
      rtpCapabilities,
      channelId,
    });
  });
}

export const createConsumer = async (
  channelId: number,
  rtpCapabilities: RtpCapabilities
) => {
  return new Promise<Consumer<{ user: User }> | null>((resolve) => {
    socket.off("consume");
    socket.on("consume", async (consumeParameters) => {
      if (!consumeParameters || !mediasoupStorage.consumeTransport) {
        resolve(null);

        return;
      }

      const { rtpParameters, id, kind, producerId, user, resumeConsumer } =
        consumeParameters;

      const consumer = await mediasoupStorage.consumeTransport.consume<{
        user: User;
      }>({
        rtpParameters,
        id,
        kind,
        producerId,
      });

      consumer.appData.user = user;

      if (resumeConsumer) {
        socket.emit("changeConsumerState", {
          consumerId: id,
          channelId,
          paused: false,
        });
      }

      const audio = new Audio();

      audio.srcObject = new MediaStream([consumer.track]);
      audio.controls = true;
      audio.dataset.id = consumer.id;
      audio.className = "sr-only";

      document.body.appendChild(audio);

      audio.load();

      mediasoupStorage.members.set(user.username, {
        user,
        consumer,
        isMuted: false,
        audio,
      });

      const remoteStream = new MediaStream([consumer.track]);
      const audioContext = createAudioContext();
      const streamSource = audioContext.createMediaStreamSource(remoteStream);

      const node = await createAudioWorklet(audioContext, streamSource);

      node.port.onmessage = onAudioWorkletMessage(audio, user.username);

      mediasoupStorage.consumers.push(consumer);

      const onInteraction = () => {
        audioContext.resume();

        window.removeEventListener("click", onInteraction);
      };

      window.addEventListener("click", onInteraction);

      resolve(consumer);
    });

    socket.emit("consume", { channelId, rtpCapabilities });
  });
};

export const createProducer = async (stream: MediaStream) => {
  if (!mediasoupStorage.produceTransport) {
    return;
  }

  const track = stream.getAudioTracks()[0];

  track.enabled = false;

  return mediasoupStorage.produceTransport.produce({ track });
};
