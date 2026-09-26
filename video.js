(() => {
  // The page shows a styled thumbnail; YouTube's player only loads once the visitor presses play.
  document.querySelectorAll('.video-embed').forEach(embed => {
    const play = embed.querySelector('.video-play');
    if (!play) return;
    play.addEventListener('click', event => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${embed.dataset.videoId}?autoplay=1&rel=0`;
      iframe.title = embed.dataset.videoTitle;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      play.replaceWith(iframe);
      iframe.focus();
    });
  });
})();
