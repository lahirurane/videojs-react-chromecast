import { createContext } from 'react';

const CastContext = createContext({
  initialized: false,
  connected: false,
  deviceName: '',
  remotePlayer: null,
  playerController: null
});
export default CastContext;
