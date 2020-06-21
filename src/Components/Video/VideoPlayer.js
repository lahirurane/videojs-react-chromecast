import React, { useState, useContext, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import videojs from 'video.js';
import 'videojs-contrib-ads';
import 'videojs-ima';
import CastContext from '../Chromecast/CastContext';
import useCastPlayer from '../Chromecast/CastPlayer';
import '../../../node_modules/video.js/dist/video-js.min.css';
// eslint-disable-next-line no-unused-vars
import ChromecastTech from '../../Utils/Videojs/PlayerTech/ChromecastTech';

const VideoPlayer = (props) => {
  const [isOverlay, setIsOverlay] = useState(true);
  // const [playerId, setPlayerId] = useState('');
  const [player, setPlayer] = useState(null);

  let playerId = props.id;

  const { connected, initialized, deviceName, remotePlayer, remotePlayerController } = useContext(
    CastContext
  );

  const videoRef = useRef(null);
  const castRef = useRef(null);

  castRef.current = {
    connected: connected,
    initialized: initialized,
    deviceName: deviceName,
    remotePlayer: remotePlayer,
    playerController: remotePlayerController,
  };

  const {
    loadMedia,
    currentTime,
    duration,
    isPaused,
    isMediaLoaded,
    togglePlay,
    seek,
    isMuted,
    setVolume,
    toggleMute,
    playerState,
    title,
  } = useCastPlayer();

  useEffect(() => {
    if (props && playerId && player === null) {
      // instantiate Video.js
      const newPlayer = videojs(playerId, props, () => {});
      setPlayer(newPlayer);
    }

    return () => {
      if (player !== null) {
        player.dispose();
      }
    };
  }, [props, playerId, player]);

  const videoEventsHandler = (action, videoPlayer) => {};

  useEffect(() => {
    if (connected && player && title !== props.title) {
      const data = {
        sources: props.sources,
        poster: props.poster,
        title: props.title,
        isLive: props.liveui,
        currentTime: player.currentTime(),
      };
      loadMedia(data);
      videoEventsHandler('Cast Media', player);
    }
  }, [connected, player]);

  useEffect(() => {
    const switchPlayerToChromeTech = () => {
      if (player) {
        player.options_.ChromecastTech = {
          currentTime,
          duration: duration && duration > 0 ? duration : player.duration(),
          isPaused,
          togglePlay,
          seek,
          isMuted,
          setVolume,
          toggleMute,
        };
        player.loadTech_('ChromecastTech', player.currentSrc());

        player.options_.inactivityTimeout = 0;
        player.userActive(true);
        setIsOverlay(true);
        //TODO: hide playback and toggle full screen options while casting
        player.options_.controlBar.playbackRateMenuButton = false;
      }
    };

    const switchPlayerToHTMLTech = () => {
      // Save current status
      let src = props.sources;
      let currentTime = player.currentTime();
      let paused = player.paused();

      // Restore old status/settings
      player.loadTech_('Html5');
      player.src(src);

      if (!paused) {
        player.one('seeked', function () {
          player.play();
          return;
        });
      }

      player.currentTime(currentTime);
      player.options_.inactivityTimeout = 2000;
      player.userActive(true);
      setIsOverlay(true);
      player.controlBar.muteToggle = false;
    };

    if (player && player.techName_) {
      if (isMediaLoaded && player.techName_ !== 'ChromecastTech') {
        //Change videojs player to chromecasttech when cast media is loaded.

        //setting player options
        switchPlayerToChromeTech();
      } else if (!isMediaLoaded && player.techName_ && player.techName_ !== 'Html5') {
        //Change videojs player to html when the cast is switched off and not connected
        switchPlayerToHTMLTech();
      }
    }
  }, [player, connected, isMediaLoaded]);

  //Setting Cast player time on videojs player
  useEffect(() => {
    if (player && player.techName_ === 'ChromecastTech' && currentTime) {
      player.currentTime(currentTime);
    }
  }, [currentTime, player]);

  useEffect(() => {
    if (player && player.techName_ === 'ChromecastTech' && playerState) {
      if (playerState !== 'PLAYING') {
        //player.pause();
      }
    }
  }, [playerState, player]);

  useEffect(() => {
    const onSeek = (event) => {};

    const onPlay = () => {
      if (player.currentTime() < 2) {
        videoEventsHandler('Played video', player);
      } else {
        videoEventsHandler('Resumed video', player);
      }
    };

    const onPause = () => {
      videoEventsHandler('Paused video', player);
    };

    const onTouchStart = (e) => {
      if (parseInt(this.currentTime()) < 2) {
        videoEventsHandler('Played video', player);
      } else {
        videoEventsHandler('Resumed video', player);
      }
    };

    const onTimeUpdate = () => {
      var percentPlayed = Math.floor((player.currentTime() * 100) / player.duration());
      if (percentPlayed > 0 && percentPlayed % 5 === 0) videoEventsHandler(percentPlayed, player);
    };

    const onMediaLoad = () => {};

    if (player && player.player_ && playerId) {
      player.ready(() => {
        setIma(player);
        if (!player.controlBar.getChild('Button')) {
          var castButton = player.controlBar.addChild(
            'button',
            {
              text: '',
            },
            10
          );
          castButton.el().innerHTML = '<google-cast-launcher></google-cast-launcher>';
          castButton.setAttribute('id', 'cast-button-' + playerId);
          castButton.setAttribute('is', 'google-cast-button');
          castButton.addClass('vjs-cast-control');
        }
      });
      player.on('play', onPlay);
      player.on('touchstart', onTouchStart);
      player.on('pause', onPause);
      player.on('seeking', onSeek);
      player.on('timeupdate', onTimeUpdate);
      player.on('useractive', onUserActive);
      player.on('userinactive', onUserInactive);
      player.on('onloadedmetadata', onMediaLoad);
    }
  }, [player, playerId]);

  const handleOverlayClick = () => {
    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  };

  const onUserActive = () => {
    setIsOverlay(true);
  };

  const onUserInactive = () => {
    setIsOverlay(false);
  };

  const setIma = (videoPlayer) => {
    if (window.ima) {
      //Create IMA options
      const adUrl =
        'https://pubads.g.doubleclick.net/gampad/ads?iu=/67970281/THIRDPARTY_AU/RugbyAustralia/Desktop/CTP_Large&' +
        'description_url=' +
        encodeURIComponent(window.location.origin) +
        '&tfcd=0&npa=0&sz=1920x1080&' +
        'cust_params=' +
        encodeURIComponent('video_domain=' + window.location.origin) +
        '&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=';

      //IMA options
      const imaOptions = {
        adTagUrl: adUrl,
        showControlsForJSAds: true,
        contribAdsSettings: {
          prerollTimeout: 5000,
          timeout: 2000,
        },
      };

      if (typeof videoPlayer.ima === 'function') {
        videoPlayer.ima(imaOptions);
        videoPlayer.ima.initializeAdDisplayContainer();
      }
    }
  };

  return (
    <div className="h-100 w-100">
      <div className="h-100 w-100" data-vjs-player>
        <video id={playerId} className="video-js rugby-video-player" ref={videoRef}></video>
        {isMediaLoaded ? (
          <div
            onClick={handleOverlayClick}
            className={'video-custom-overlay ' + (isOverlay ? 'active' : '')}
          >
            <div className="pb-2 py-5 h-25 m-0 items--center align-items-baseline">
              <div className="" md="10" xm="10" xs="10">
                <h2 className="text-left overlay-header-title pl-1">{props.title}</h2>
              </div>
              <div className="text-right" md="2" xm="2" xs="2"></div>
            </div>
            <div className="py-5 h-50">
              <div md={12} className="items--center">
                <span style={{ fontSize: '3em' }}>Playing on {deviceName}</span>
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};
export default VideoPlayer;
