export class MediaStream {
  id: string = "media-stream-1";
  active: boolean = true;
  onaddtrack = null;
  onremovetrack = null;

  getTrackById = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
  getTracks = jest.fn().mockReturnValue([]);
  getAudioTracks = jest.fn().mockReturnValue([]);
  getVideoTracks = jest.fn().mockReturnValue([]);
  addTrack = jest.fn();
  removeTrack = jest.fn();
  clone = jest.fn();
}
