type SoundApi = {
  playHover: () => void;
  playClick: () => void;
  setEnabled?: (enabled: boolean) => void;
};

export default function useSound(): SoundApi {
  // Audio disabled for now (prevents Safari autoplay + audio pool exhausted)
  return {
    playHover: () => {},
    playClick: () => {},
    setEnabled: () => {},
  };
}
