import { insertScriptAsync } from '../DOMUtils/insertScript';

const SENDER_SDK_URL = '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

class CastLoader {
  static load() {
    return new Promise((resolve, reject) => {
      window.__onGCastApiAvailable = (isAvailable) =>
        CastLoader.onGCastApiAvailable(isAvailable, resolve);
      CastLoader.loadCastSDK()
        .then(() => {
          console.warn('Cast sender lib has been loaded successfully');
        })
        .catch((e) => {
          console.warn('Cast sender lib loading failed', e);
          reject(e);
        });
    });
  }

  static loadCastSDK() {
    if (window['cast'] && window['cast']['framework']) {
      return Promise.resolve();
    }
    return insertScriptAsync(SENDER_SDK_URL);
  }

  static onGCastApiAvailable(isAvailable, resolve) {
    if (isAvailable) {
      resolve();
    } else {
      console.warn(`Google cast API isn't available yet`);
    }
  }
}

export { CastLoader };
