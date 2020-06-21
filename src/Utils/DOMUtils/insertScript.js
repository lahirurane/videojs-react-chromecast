export const insertScript = url => {
  const script = document.createElement('script');

  script.src = url;
  script.async = true;

  document.body.appendChild(script);
};

export function insertScriptAsync(url) {
  return new Promise((resolve, reject) => {
    let r = false,
      t = document.getElementsByTagName('script')[0],
      s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = url;
    s.async = true;
    s.onload = s.onreadystatechange = function() {
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve(this);
      }
    };
    s.onerror = s.onabort = reject;
    if (t && t.parentNode) {
      t.parentNode.insertBefore(s, t);
    }
  });
}
