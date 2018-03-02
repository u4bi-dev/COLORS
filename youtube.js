var tag = document.createElement('script'), firstScriptTag = document.getElementsByTagName('script')[0],
    video = {
        host : null,
        reflection : null,
        _syncFlag : false
    };


tag.src = 'https://www.youtube.com/player_api';
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


function onYouTubePlayerAPIReady() {

    video = {
        host : new YT.Player('ytplayer_host', {
            height: '100%', width: '100%',
            videoId: '4uOPnyWRnWI',
            playerVars: { 'autoplay': 1, 'controls': 0 },
            events: {
                onStateChange : e => {
                    if(e.data === 1 && !video._syncFlag) video.host.pauseVideo();
                }
            }
        }),
        reflection : new YT.Player('ytplayer_reflection', {
            height: '100%', width: '100%',
            videoId: '4uOPnyWRnWI',
            playerVars: { 'autoplay': 1, 'controls': 0 },
            events: {
                onStateChange : e => {
                    if(e.data === 1 && !video._syncFlag) {
                        video._syncFlag = true;
                        video.reflection.mute();

                        video.reflection.seekTo(video.reflection.getMediaReferenceTime());
                        video.host.seekTo(video.reflection.getMediaReferenceTime());
                        video.reflection.playVideo();
                        video.host.playVideo();
                    }
                }
            }
        })
    };

}