/* global chrome */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import CastContext from './CastContext';
import { CastLoader } from '../../Utils/Chromecast/CastLoader';

const CastProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [castInitialized, setCastInititalized] = useState(false);
  const [remotePlayer, setRemotePlayer] = useState(null);
  const [remotePlayerController, setRemotePlayerController] = useState(null);

  useEffect(() => {
    CastLoader.load().then(() => {
      setCastInititalized(true);
    });
  }, []);

  const resetCast = useCallback(() => {
    setConnected(false);
    setDeviceName('');
    setRemotePlayer(null);
    setRemotePlayerController(null);
  }, []);

  /* onCast Initalized */
  useEffect(() => {
    const onSessionStateChange = (data) => {
      if (
        data.sessionState === window.cast.framework.SessionState.SESSION_RESUMED ||
        data.sessionState === window.cast.framework.SessionState.SESSION_STARTED
      ) {
        const session = window.cast.framework.CastContext.getInstance().getCurrentSession();
        if (session) {
          setDeviceName(session.getSessionObj().receiver.friendlyName);
        }

        setConnected(true);
      }
      if (data.sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
        resetCast();
        setConnected(false);
      }
    };

    if (window.cast) {
      var options = {};
      options.receiverApplicationId = window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
      window.cast.framework.CastContext.getInstance().setOptions(options);
      const player = new window.cast.framework.RemotePlayer();
      setRemotePlayer(player);
      setRemotePlayerController(new window.cast.framework.RemotePlayerController(player));

      window.cast.framework.CastContext.getInstance().addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        onSessionStateChange
      );
    }
  }, [castInitialized, resetCast]);

  useEffect(() => {
    const onConnectedChange = (_data) => {
      setConnected(true);
      const session = window.cast.framework.CastContext.getInstance().getCurrentSession();
      if (session) {
        setDeviceName(session.getSessionObj().receiver.friendlyName);
      }
    };
    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
        onConnectedChange
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
          onConnectedChange
        );
      }
    };
  }, [remotePlayerController]);

  const value = useMemo(() => {
    const value = {
      connected,
      initialized: castInitialized,
      deviceName,
      remotePlayer,
      remotePlayerController,
    };
    return value;
  }, [castInitialized, connected, deviceName, remotePlayer, remotePlayerController]);

  return <CastContext.Provider value={value}>{children}</CastContext.Provider>;
};

export default CastProvider;
