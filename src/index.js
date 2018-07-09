/* global $ videojs */

$(() => {
  const oPlayer = new OverlayPlayer()
  $('.main-body').on('click', 'a.video', oPlayer.playClickHandler)
})

class OverlayPlayer {
  static instances = {}

  constructor(overlay = '.video-overlay') {
    if (OverlayPlayer.instances[overlay])
      return OverlayPlayer.instances[overlay]
    this.overlay = $(overlay)
    this.video = this.overlay.find('.video')
    OverlayPlayer.instances[overlay] = this
    this.player = null
    this.active = false
    this.type = null

    this.overlay.on('click', '.close', e => {
      e.preventDefault()
      this.closeVideo()
    })
  }

  playClickHandler = e => {
    e.preventDefault()
    this.playFromElement(e.currentTarget)
  }

  playFromElement(el) {
    const target = $(el).first()
    if (target.data('video')) {
      let type = 'video'
      if (target.data('type')) type = target.data('type')
      if (!!target.data('youtube')) type = 'youtube'
      if (!!target.data('iframe')) type = 'iframe'
      this.playVideo(target.data('video'), type)
    }
  }

  playVideo(video, type = 'video') {
    if (this.active) this.closeVideo()
    this.active = true
    this.type = type
    if (this.type === 'iframe') {
      this._setupIframe(video)
    } else {
      if (this.type === 'youtube') this.type = 'video/youtube'
      this._setupVideo(video, this.type)
    }
  }

  closeVideo() {
    if (this.player) {
      if (this.type === 'iframe') {
        this.player.remove()
      } else {
        this.player.dispose()
      }
      this.player = null
    }
    this.active = false
    this.overlay.removeClass('overlay')
  }

  _setupVideo(src, type = 'video') {
    const classes = 'video-js vjs-16-9 vjs-big-play-centered'
    const source = type !== 'video' ? { type, src } : { src }
    const inner = $(
      `<video class="${classes}" data-setup='${JSON.stringify({
        fluid: true,
        sources: [source]
      })}' controls></video>`
    )
    this.video.append(inner)
    this.player = videojs(inner[0])
    this.player.ready(() => {
      this.overlay.addClass('overlay')
      this.player.play()
    })
  }

  _setupIframe(src) {
    const outerStyle = 'width:100%;max-width:100%;height:0;padding-top:56.25%'
    const innerStyle =
      'position: absolute;top: 0;left: 0;width: 100%;height: 100%;'
    const inner = `<iframe src="${src}" style="${innerStyle}" allowfullscreen mozallowfullscreen webkitallowfullscreen></iframe>`
    this.player = $(
      `<div class="iframe-wrapper" style="${outerStyle}">${inner}</div>`
    )
    this.video.append(this.player)
    this.overlay.addClass('overlay')
  }
}
