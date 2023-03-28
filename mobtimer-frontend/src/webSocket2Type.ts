export type WebSocket2Type = {
  // onmessage: (message: { data: string }) => void;
  close: () => void;
  isClosed: () => boolean;
  isOpen: () => boolean;
  send: (message: string) => void;
};
