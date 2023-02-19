const getVideoDuration = require('node-video-duration');
 
getVideoDuration('http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4')
    .then((duration) => {
        console.log('Asset duration: ' + duration);
    });