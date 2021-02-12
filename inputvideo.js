var Ffmpeg = require('fluent-ffmpeg');
var ffmpegCommand = require('fluent-ffmpeg');
const { exec } = require("child_process");
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

function runUpload() {

    const preview = document.getElementById('preview');
    const timelineContainer = document.getElementById('timeline');

    removeAllChildNodes(preview);
    removeAllChildNodes(timeline);

    var inputVideo = document.getElementById('inputvideo').files[0].path;
    var output = ffprobe(inputVideo, { path: ffprobeStatic.path }).then(output => {
        
        b=output;

        for (var i = 0; i < b.streams.length;) {
            var timelineBars = document.getElementsByClassName('timelinebar');
            var timelineBarName = 'timelinebar' + String(i);
            var timelineBar = document.createElement('div');
            timelineBar.setAttribute('id', timelineBarName); 
            timelineContainer.appendChild(timelineBar);

            if (b.streams[i].codec_type == 'video') {
                document.getElementById(timelineBarName).setAttribute('class', 'timelinebar video');
                source = document.createElement('source');
                source.setAttribute('src', inputVideo);
                preview.appendChild(source);
                preview.load();

            } else if (b.streams[i].codec_type == 'audio') {
                document.getElementById(timelineBarName).setAttribute('class', 'timelinebar audio'); 
            } 
        i++;
        }
    });

}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}