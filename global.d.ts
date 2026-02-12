interface Window {
  onSpotifyWebPlaybackSDKReady: () => void;
  Spotify: typeof Spotify;
}

declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
  }

  interface Player {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (event: string, cb: (data?: any) => void) => void;
    connect: () => Promise<boolean>;
  }
}
