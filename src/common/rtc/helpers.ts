export enum Sound {
  Join = "join",
  Leave = "leave",
  Mute = "mute",
  Unmute = "unmute",
}

export const playSound = async (type: Sound) => {
  const audioElement = document.querySelector<HTMLAudioElement>(
    `audio#${type}`
  );

  if (!audioElement) {
    throw new Error("Audio element does not exists!");
  }

  audioElement.play();
};
