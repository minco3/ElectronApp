var ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');
const ffmpeg = require('fluent-ffmpeg');
const { remote, nativeImage } = require('electron');
var fs = require("fs");
var saveOptions = 'defaultPath : "C:/Users/marco/Desktop/Electron/Outputs"';
var openOptions = 'defaultPath : "C:/Users/marco/Desktop/Electron/Outputs"';
var openPath;
var savePath;
var output;
var b;

function runUpload(videoPath) {

    const preview = document.getElementById('preview');
    const timelineContainer = document.getElementById('timeline');

    removeAllChildNodes(preview);
    removeAllChildNodes(timelineContainer);

    document.getElementById('openFilePathLabel').innerText = "Opened file path: " + videoPath;


    // var inputVideo = document.getElementById('inputvideo').files[0].path;
    ffprobe(videoPath, { path: ffprobeStatic.path }).then(output => {

        b=output;
        console.log(output);

        var stats = fs.statSync(videoPath);
        sizeReadable = (stats.size / 1024 / 1024).toFixed(2);
        console.log('file size ' + sizeReadable + ' mb');
        document.getElementById('currentFileSizeLabel').innerText = "Current file size: " + sizeReadable + " MB at " + (Number(b.streams[0].bit_rate) / 1000) + " KB/sec";

        resX = b.streams[0].width;
        resY = b.streams[0].height;
        if(document.getElementById('lockResolution').checked) {
            console.log('lock resolution checked');
        } else {
            console.log('locked resolution not checked')
        }
        console.log(resX, resY);
        document.getElementById('resolutionX').value = resX;
        document.getElementById('resolutionY').value = resY;


        for (var i = 0; i < b.streams.length;) {
            var timelineBars = document.getElementsByClassName('timelinebar');
            var timelineBarName = 'timelinebar' + String(i);
            var timelineBar = document.createElement('div');
            timelineBar.setAttribute('id', timelineBarName); 
            timelineContainer.appendChild(timelineBar);

            if (b.streams[i].codec_type == 'video') {
                document.getElementById(timelineBarName).setAttribute('class', 'timelinebar video');
                source = document.createElement('source');
                source.setAttribute('src', videoPath);
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

function openDialog() {
    remote.dialog.showOpenDialog(openOptions).then(
        output => {
        openPath = output.filePaths[0];
        console.log('opening ' + openPath + '...');
        runUpload(openPath);
    });
}

function saveDialog() {
    remote.dialog.showSaveDialog(saveOptions).then(
        output => {
        console.log(output.filePath);
        savePath = output.filePath;
    });
}


function clearMedia() {
    videoPanel = document.getElementById('preview')
    removeAllChildNodes(videoPanel);
    videoPanel.load();
    removeAllChildNodes(document.getElementById('timeline'));
    console.log('cleared video preview and timeline bars');
    document.getElementById('resolutionX').value = '';
    document.getElementById('resolutionY').value = '';
    document.getElementById('lockResolution').checked = 'true';
    console.log('cleared resolution boxes and reset lock aspect ratio');
    document.getElementById('openFilePathLabel').innerText = '';
    document.getElementById('currentFileSizeLabel').innerText = "";
}

function calculateBitrate(target) {
    var nativeBitrate = b.streams[0].bitrate;
    if( bitrateDropdown == 'native') { bitrate = nativeBitrate }
    else {  bitrate = bitrateDropdown  }



    //TODO: dropdown result should replace 8
    targetBitrate = parseInt((8 / parseFloat(b.streams[0].duration)) * 10000);
    console.log('targetBitrate: ' + targetBitrate);

    return(bitrate);
}

function setVideoPresets() {
    bitrate = calculateBitrate(document.getElementById('sizeTarget').value);
    
    
    
    
    return({fps,res,bitrate});
}

function setAudioPresets() {
    var nativeBitrate = b.streams[1].audioBitrate;
    bitrateDropdown = document.getElementById('audioPreset').value;

    if( bitrateDropdown == 'native') { bitrate = nativeBitrate }
    else {  bitrate = bitrateDropdown  }

    if(bitrate > nativeBitrate) {bitrate = nativeBitrate}    

    return(bitrate);
}

function runFFmpeg() {
    videoSettings = setVideoPresets();
    audioSettings = setAudioPresets();

    ffmpeg({ source: openPath })
    //.noVideo()
    .videoBitrate(targetBitrate)
    // .size()
    .fps(fps)
    .audioBitrate(audioSettings)
    .output(savePath)
    .on('end', function() {
        console.log('Finished processing');
    }) 
    .run();
}