var Ffmpeg = require('fluent-ffmpeg');
var ffmpegCommand = require('fluent-ffmpeg');
const { exec } = require("child_process");
let a;
var i;
var timelineBar = document.createElement("div");

var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

// function getMetadata(filepath) {
//     ffprobe(filepath, { path: ffprobeStatic.path })
//       .then(function (info) {
//         console.log(info);
//         console.log(typeof(info));
//         return(info);
//     });
// }



// function runUpload() {

//     var inputVideo = document.getElementById('inputVideo').files[0].path;

//     let p = new Promise((resolve) => {
//         ffprobe(inputVideo, { path: ffprobeStatic.path })
//             .then(function (info) {
//             //console.log(info);
//             //console.log(typeof(info));
//             resolve(info);
//        });
// ffprobe(inputVideo, { path: ffprobeStatic.path })
//         .then(function (info) {
//         //console.log(info);
//         //console.log(typeof(info));
//         resolve(info);
// });
// }

function runUpload() {

    var inputVideo = document.getElementById('inputVideo').files[0].path;
    a = ffprobe(inputVideo, { path: ffprobeStatic.path }).then(a => {
        console.log(a); 
        b=a; 

        for (i = 0; i < b.streams.length;) {

            var timelineBarName = 'timelineBar' + String(i);
            var timelineBar = document.createElement('div');
            timelineBar.setAttribute('id', timelineBarName); 
            document.getElementById('timeline').appendChild(timelineBar);

            if (b.streams[i].codec_type == 'video') {
                document.getElementById('timelineBar' + String(i)).style.color = 'blue';
                var video = document.createElement('source');
                video.setAttribute('src', inputVideo);
                document.getElementById('preview').appendChild(video);
                console.log('codec of stream ' + i + ' is ' + b.streams[i].codec_type + '.');

            } else if (b.streams[i].codec_type == 'audio') {
                document.getElementById('timelineBar' + String(i));
                console.log('codec of stream ' + i + ' is ' + b.streams[i].codec_type + '.');
                document.getElementById('timelineBar' + String(i)).style.color = 'purple';
            }

            console.log('looped through one stream');
            i++;
        }
    });

}

// document.getElementById('timeline').appendChild(document.createElement('div');.setAttribute('id', 'timelineBar' + String(i)))

// function runUpload() {
    
//     var inputVideo = 'a.mp4'
//     b = ffprobe(inputVideo, { path: ffprobeStatic.path }).then(a => {
//     });

// }

// (async function(){
//         var result = await runUpload();
//         console.log(result);
// })();

// document.getElementById('inputVideo').files[0].path;
// inputVideo = 'a.mp4'