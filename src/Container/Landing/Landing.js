import React from 'react';
import CastProvider from '../../Components/Chromecast/CastProvider';
import VideoPlayer from '../../Components/Video/VideoPlayer';
import { getVideoType } from '../../Utils/Videojs/GetVideoType';
export default function Landing() {
  const asset = {
    id: '001',
    source: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumb: './Assets/BigBuckBunny.jpg',
    title: 'Big Buck Bunny',
  };
  const playerId =
    'video-player-' +
    new Date().getTime() +
    '--' +
    asset.title.toLowerCase().replace(/[^\w]/gi, '_') +
    '-' +
    asset.id;

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    sources: {
      src: asset.source,
      type: getVideoType(asset.source),
    },
    isFullscreen: true,
    poster: asset.thumb,
    preload: 'metadata',
    muted: false,
    playbackRates: [0.5, 1, 1.5, 2],
    controlBar: {
      pictureInPictureToggle: false,
      volumePanel: {
        inline: true,
      },
      remainingTimeDisplay: true,
      currentTimeDisplay: true,
      timeDivider: true,
      durationDisplay: true,
    },
    userActions: { hotkeys: true },
    ChromecastTech: {},
  };

  return (
    <CastProvider>
      <VideoPlayer id={playerId} {...videoJsOptions} title={asset.name} />
    </CastProvider>
  );
}
