var _youtube = {
        tag : document.createElement('script'),
        elementId : {
            host : 'ytplayer_host',
            reflection : 'ytplayer_reflection'
        },
        nextDirection : 1, // 0 left , 1 right
        host : null,
        reflection : null,
        _syncFlag : false,
        isRandPlayer : false,
        accesskey : 'AIzaSyAUEd6XlWygeiKrvgJc4tV7jYRxw7DdaKM',
        channelId : 'UC2Qw1dzXDBAZPwS7zm37g8g',
        playlist : {
            count : 5,
            itemCount : 0,
            data : []
        },
        items : [],
        attachVideoData : function(playlistCount, nextPageToken) {
            return fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${ this.playlist.data[ this.playlist.count = playlistCount ].id }&maxResults=50${ nextPageToken ? '&pageToken=' + nextPageToken : '' }&key=${ this.accesskey }`)
                        .then(e => e.json())
                        .then(e => {
 
                            e.items.forEach(e => {

                                this.items.push({
                                    videoId : e.snippet.resourceId.videoId,
                                    datetime : e.snippet.publishedAt,
                                    title : e.snippet.title,
                                    description : e.snippet.description,
                                    image : `https://i.ytimg.com/vi/${ e.snippet.resourceId.videoId }/mqdefault.jpg`
                                });
                            });

                            e.nextPageToken ? this.attachVideoData(playlistCount, e.nextPageToken) 
                            :
                            ( (tag) => {
                                if(!tag.src) {

                                    let first = document.getElementsByTagName('script')[0];

                                    tag.src = 'https://www.youtube.com/player_api';
                                    first.parentNode.insertBefore(tag, first);
                                }

                            })(_youtube.tag);
                        });
        },
        load : function(count) {
            let url = `http://www.youtube.com/v/${ this.items[this.playlist.itemCount = count].videoId  }?version=3`;

            this.host.loadVideoByUrl(url);
            this.reflection.loadVideoByUrl(url);
        },
        loadPlayListVideo : function(playlistCount) {
            this.attachVideoData(playlistCount).then(e => this.load(0));
        },
        next : function() {
            this.load( (this.playlist.itemCount + 1) > this.items.length ? this.playlist.itemCount : this.playlist.itemCount + 1);
            this.nextDirection = 1;
        },
        prev : function() {
            this.load(this.playlist.itemCount - 1 < 0 ? this.playlist.itemCount : this.playlist.itemCount - 1);
            this.nextDirection = 0;
        },
        getCurrent : function() {
            return {
                count : this.playlist.itemCount,
                ...this.items[this.playlist.itemCount]
            }
        },
        hideAds : function() {
            let time = this.reflection.getMediaReferenceTime();

            this.reflection.stopVideo();
            this.host.stopVideo();

            this.reflection.seekTo(time);
            this.host.seekTo(time);
        },
        getRandVideoCount : function() {

            return this.playlist.itemCount = Math.floor( Math.random() * this.items.length )
        }
    };




/* initialize
------------------------------------------------------------- */
fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${ _youtube.channelId }&maxResults=50&key=${ _youtube.accesskey }`)
    .then(e => e.json())
    .then(e => {

        _youtube.playlist.data = e.items.map(e => ({ id : e.id, title : e.snippet.title}) );
        _youtube.attachVideoData(_youtube.playlist.count);

    });




/* API Ready Callback for youtube player
------------------------------------------------------------- */
function onYouTubePlayerAPIReady() {
    console.log('initialize for youtube', _youtube.items.length);

    let videoId = _youtube.items[_youtube.isRandPlayer ? _youtube.getRandVideoCount() : _youtube.playlist.itemCount].videoId;

    Object.assign(_youtube, _youtube, {
        host : new YT.Player(_youtube.elementId.host, {
            height: '100%', width: '100%',
            videoId: videoId,
            playerVars: { 'autoplay': 1, 'controls': 0 },
            events: {
                onReady : e => _youtube.host.mute()
            }
        }),
        reflection : new YT.Player(_youtube.elementId.reflection, {
            height: '100%', width: '100%',
            videoId: videoId,
            playerVars: { 'autoplay': 1, 'controls': 0 },
            events: {
                onReady : e => _youtube.reflection.mute(),
                onStateChange : e => {
                    switch(e.data){
                        case 0 : return  _youtube.getCurrent().count + 1 < _youtube.items.length ? ( _youtube.nextDirection ? _youtube.next() : _youtube.prev() ) : ( _youtube.nextDirection ? _youtube.load(0) : _youtube.load(_youtube.items.length - 1) );
                        case 1 :
                            if(!_youtube._syncFlag) {
                                _youtube._syncFlag = true;
                                _youtube.host.unMute();
                                _youtube.reflection.pauseVideo();

                                _youtube.reflection.seekTo(_youtube.host.getMediaReferenceTime());
                                _youtube.host.seekTo(_youtube.host.getMediaReferenceTime());

                                _youtube.reflection.playVideo();
                            }
                            break;
                        default : break;
                    }
                }
            }
        }) 
    });

    window.dispatchEvent(new Event('onYoutubeAPIReady'));

}