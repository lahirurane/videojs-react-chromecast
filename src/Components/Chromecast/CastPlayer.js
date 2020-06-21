import { useMemo, useCallback, useState, useEffect, useContext } from 'react';
import CastContext from '../Chromecast/CastContext';

let breakClipsJSON = [
  {
    id: 'bc0',
    vastAdsRequest: {
      adTagUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=',
    },
  },
];

/**
 * Sample breaks json objects
 */
let breaksJSON = [
  {
    id: 'b0',
    breakClipIds: ['bc0'],
    position: 0, // preroll
  },
];

const useCastPlayer = () => {
  const { connected, remotePlayer, remotePlayerController } = useContext(CastContext);
  const [tracks, setTracks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [title, setTitle] = useState('No title');
  const [thumbnail, setThumbnail] = useState('');
  const [playerState, setPlayerState] = useState('');

  function resetValues() {
    setTracks([]);
    setCurrentTime(0);
    setDuration(0);
    setIsMediaLoaded(false);
    setIsPaused(false);
    setIsMuted(false);
    setThumbnail('');
    setTitle('No title');
    setPlayerState('');
  }

  useEffect(() => {
    if (!connected) {
      resetValues();
    }
  }, [connected]);

  /*
   * CurrentTime Event Listener
   */
  useEffect(() => {
    function onCurrentTimeChange(data) {
      setCurrentTime(data.value);
    }

    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
        onCurrentTimeChange
      );
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.ANY_CHANGE,
        (event) => {
          if (event.field === 'currentTime') {
            setCurrentTime(event.value);
          } else if (event.field === 'playerState') {
            setPlayerState(event.value);
            if (event.value === 'IDLE') {
              setIsMediaLoaded(false);
            }
          }
        }
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED,
          onCurrentTimeChange
        );
      }
    };
  }, [remotePlayerController, setCurrentTime]);

  /*
   * Duration Event Listener
   */
  useEffect(() => {
    function onDurationChange(data) {
      setDuration(data.value);
    }
    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.DURATION_CHANGED,
        onDurationChange
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.DURATION_CHANGED,
          onDurationChange
        );
      }
    };
  }, [remotePlayerController, setDuration]);

  /*
   * IsMediaLoaded Event Listener
   */
  useEffect(() => {
    function onMediaLoadedChange(data) {
      setIsMediaLoaded(data.value);
    }
    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED,
        onMediaLoadedChange
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED,
          onMediaLoadedChange
        );
      }
    };
  }, [remotePlayerController, setIsMediaLoaded]);

  /*
   * isPaused Event Listener
   */
  useEffect(() => {
    function onIsPausedChange(data) {
      setIsPaused(data.value);
    }
    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
        onIsPausedChange
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED,
          onIsPausedChange
        );
      }
    };
  }, [remotePlayerController, setIsPaused]);
  /*
   * isMuted Event Listener
   */
  useEffect(() => {
    function onIsMutedChange(data) {
      setIsMuted(data.value);
    }
    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED,
        onIsMutedChange
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED,
          onIsMutedChange
        );
      }
    };
  }, [remotePlayerController, setIsMuted]);

  useEffect(() => {
    function onMediaInfoChanged(data) {
      // We make the check what we update so we dont update on every player changed event since it happens often
      const newTitle = 'title';
      const newThumbnail = 'th';
      const newTracks = 'tracks';
      if (tracks.length !== newTracks.length) {
        setTracks(newTracks);
      }
      if (title !== newTitle) {
        setTitle(newTitle);
      }
      if (thumbnail !== newThumbnail) {
        setThumbnail(newThumbnail);
      }
    }

    if (remotePlayerController) {
      remotePlayerController.addEventListener(
        window.cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
        onMediaInfoChanged
      );
    }
    return () => {
      if (remotePlayerController) {
        remotePlayerController.removeEventListener(
          window.cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED,
          onMediaInfoChanged
        );
      }
    };
  }, [remotePlayerController, setTitle, title, setTracks, tracks, thumbnail, setThumbnail]);

  const loadMedia = useCallback((requestData) => {
    let mediaInfo = new window.chrome.cast.media.MediaInfo(
      requestData.sources.src,
      requestData.sources.type
    );
    mediaInfo.streamType = window.chrome.cast.media.StreamType.BUFFERED;
    mediaInfo.metadata = new window.chrome.cast.media.TvShowMediaMetadata();
    mediaInfo.metadata.title = requestData.title;
    mediaInfo.metadata.images = [
      {
        url: requestData.poster,
      },
    ];

    let request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    request.currentTime = requestData.currentTime;

    if (breakClipsJSON && breaksJSON) {
      // Add sample breaks and breakClips.
      mediaInfo.breakClips = breakClipsJSON;
      mediaInfo.breaks = breaksJSON;
    } else if (requestData.isLive) {
      // Change the streamType and add live specific metadata.
      mediaInfo.streamType = window.chrome.cast.media.StreamType.LIVE;

      // TODO: Start time, is a fake timestamp. Use correct values for your implementation.
      let currentTime = new Date();
      // Convert from milliseconds to seconds.
      currentTime = currentTime / 1000;
      let sectionStartAbsoluteTime = currentTime;

      // Duration should be -1 for live streams.
      mediaInfo.duration = -1;
      // TODO: Set on the receiver for your implementation.
      mediaInfo.startAbsoluteTime = currentTime;
      mediaInfo.metadata.sectionStartAbsoluteTime = sectionStartAbsoluteTime;
      // TODO: Set on the receiver for your implementation.
      mediaInfo.metadata.sectionStartTimeInMedia = 0;
      //  mediaInfo.metadata.sectionDuration = this.mediaContents[
      //    mediaIndex
      //  ]['duration'];

      let item = new window.chrome.cast.media.QueueItem(mediaInfo);
      request.queueData = new window.chrome.cast.media.QueueData();
      request.queueData.items = [item];
      request.queueData.name = requestData.title + ' Live';
    }

    // Do not immediately start playing if the player was previously PAUSED.
    // if (
    //   !this.playerStateBeforeSwitch ||
    //   this.playerStateBeforeSwitch == PLAYER_STATE.PAUSED
    // ) {
    //   request.autoplay = false;
    // } else {
    //   request.autoplay = true;
    // }

    const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
      // setIsMediaLoaded(true);

      return castSession.loadMedia(request);
    } else {
      return Promise.reject('No CastSession has been created');
    }
  });

  const togglePlay = useCallback(() => {
    if (remotePlayerController) {
      remotePlayerController.playOrPause();
    }
  }, [remotePlayerController]);

  const toggleMute = useCallback(() => {
    if (remotePlayerController) {
      remotePlayerController.muteOrUnmute();
    }
  }, [remotePlayerController]);

  const seek = useCallback(
    (time) => {
      if (remotePlayer && remotePlayerController) {
        remotePlayer.currentTime = time;
        remotePlayerController.seek();
      }
    },
    [remotePlayer, remotePlayerController]
  );

  const setVolume = useCallback(
    (volume) => {
      if (remotePlayer && remotePlayerController) {
        remotePlayer.volumeLevel = volume;
        remotePlayerController.setVolumeLevel();
      }
    },
    [remotePlayer, remotePlayerController]
  );

  const editTracks = useCallback((activeTrackIds, textTrackStyle) => {
    const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
    if (castSession) {
      const trackStyle = textTrackStyle;
      const tracksInfoRequest = new window.chrome.cast.media.EditTracksInfoRequest(
        activeTrackIds,
        trackStyle
      );
      const media = castSession.getMediaSession();
      if (media) {
        return new Promise((resolve, reject) => {
          media.editTracksInfo(tracksInfoRequest, resolve, reject);
        });
      } else {
        return Promise.reject('No active media');
      }
    }
    return Promise.reject('No active cast session');
  }, []);

  const value = useMemo(
    () => ({
      loadMedia,
      tracks,
      editTracks,
      currentTime,
      duration,
      toggleMute,
      setVolume,
      togglePlay,
      seek,
      isMediaLoaded,
      isPaused,
      isMuted,
      title,
      thumbnail,
      playerState,
    }),
    [
      loadMedia,
      tracks,
      editTracks,
      currentTime,
      duration,
      toggleMute,
      setVolume,
      togglePlay,
      seek,
      isMediaLoaded,
      isPaused,
      isMuted,
      title,
      thumbnail,
      playerState,
    ]
  );
  return value;
};
export default useCastPlayer;
