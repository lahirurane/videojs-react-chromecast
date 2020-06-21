import videojs from 'video.js';
const Tech = videojs.getTech('Tech');

class ChromecastTech extends Tech {
  constructor(options, ready) {
    super(options, ready);
    this.techName_ = 'ChromecastTech';
    this.featuresVolumeControl = true;
    this.movingMediaElementInDOM = false;
    this.featuresFullscreenResize = false;
    this.featuresProgressEvents = true;
    this.source = options.source;

    // Chromecast player
    //  currentTime,
    //    duration,
    //    isPaused,
    //    togglePlay,
    //    seek,
    //    isMuted,
    //    setVolume,
    //    toggleMute,
    this.currentDuration = options.duration;
    this.castSeek = options.seek;
    this.togglePlay = options.togglePlay;
    this._paused = options.isPaused;
    this._muted = options.isMuted;
    this.setCastVolume = options.setVolume;
    this.toggleCastMute = options.toggleMute;
    this.currentVolume = 1;
    this.currentMediaTime = options.currentTime;
    this.timer = null;
    this.timerStep = 1000;
    this.startProgressTimer(this.incrementMediaTime.bind(this));
    this.playerReady_ = true;
    this.triggerReady();
  }

  dispose() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    super.dispose();
  }

  createEl() {
    // createEL() is call before this.chromecast is define
    // due to call to super in first
    const el = videojs.createEl('div');

    el.className = 'vjs-tech vjs-tech-chromecast';
    el.innerHTML =
      `<div class='casting-image' style='background-image: url("` +
      this.options_.poster +
      `");background-repeat: no-repeat;background-size: 100% auto;height: 100%;filter: blur(10px);'></div>` +
      `<div class='casting-overlay'>` +
      `<div class='casting-information'><div class='casting-icon'>&#58880</div>` +
      `<div class='casting-description'></div></div></div>`;
    return el;
  }

  play() {
    if (this._paused) {
      this.togglePlay();
      this._paused = false;
      this.trigger('play');
    }
  }

  onPlaySuccess() {
    this._paused = false;
    this.trigger('play');
  }

  paused() {
    return this._paused;
  }

  pause() {
    if (!this._paused) {
      this.togglePlay();
      this._paused = true;
      this.trigger('pause');
    }
  }

  onPauseSuccess() {
    this._paused = true;
    this.trigger('pause');
  }

  currentTime(seconds) {
    if (seconds) {
      this.currentMediaTime = seconds;
    }
    return this.currentMediaTime;
  }

  setCurrentTime(seconds) {
    if (
      this.currentMediaTime - 2 > seconds ||
      this.currentMediaTime + 2 < seconds
    ) {
      this.castSeek(seconds);
      this.trigger('seekMedia');
    }
    this.currentMediaTime = seconds;
    this.trigger('timeupdate');
  }

  onSetCurrentTimeSuccess(seconds) {
    this.currentMediaTime = seconds;
    this.trigger('seekMedia');
  }

  volume() {
    return this.currentVolume;
  }

  setVolume(volume) {
    return this.setMediaVolume(volume, false);
  }

  muted() {
    return this._muted;
  }

  setMuted() {
    this.toggleCastMute();
    return this.setMediaVolume(this.volume(), !this.muted());
  }

  setMediaVolume(level, mute) {
    this.setCastVolume(level);
    this.onSetMediaVolumeSuccess(level, mute);
  }

  onSetMediaVolumeSuccess(level, mute) {
    this.currentVolume = level;
    this._muted = mute;

    this.trigger('volumechange');
  }

  supportsFullScreen() {
    return false;
  }

  duration() {
    if (this.currentDuration) {
      return this.currentDuration;
    }
    return 0;
  }

  currentSrc() {
    return this.source;
  }

  src(src) {
    if (typeof src === 'undefined') {
      return this.source;
    }

    if (src !== this.source) {
      this.source = src;
    }
  }

  seekable() {
    return this.createTimeRange(0, this.duration());
  }

  controls() {
    return null;
  }

  incrementMediaTime() {
    //TODO:Get Cast player status passed
    if (this._paused) {
      return;
    }
    if (this.currentMediaTime < this.duration()) {
      this.currentMediaTime += 1;
      this.trigger('timeupdate');
    } else {
      this.currentMediaTime = 0;
      clearInterval(this.timer);
    }
  }

  startProgressTimer(callback) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(callback.bind(this), this.timerStep);
  }

  mediaCommandSuccessCallback(information, event) {
    videojs.log(information);
  }

  onTrackChangeHandler() {
    let i = 1;
    let activeTrackIds = [];

    for (let t of this.textTracks().tracks_) {
      if (t.mode === 'showing') {
        activeTrackIds.push(i);
      }
      i++;
    }
  }

  onTrackSuccess() {
    videojs.log('onTrackSuccess');
  }

  onTrackError() {
    videojs.log('onTrackError');
  }

  onError() {
    videojs.log('chromecast error');
  }
}

ChromecastTech.isSupported = function () {
  return this.apiInitialized;
};

ChromecastTech.canPlaySource = function (source) {
  return (
    source.type === 'video/mp4' ||
    source.type === 'video/webm' ||
    source.type === 'application/x-mpegURL' ||
    source.type === 'application/vnd.apple.mpegURL'
  );
};

videojs.registerTech('ChromecastTech', ChromecastTech);
export default ChromecastTech;
