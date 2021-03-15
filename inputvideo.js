//var ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static');
const ffmpeg = require('fluent-ffmpeg');
const { remote, nativeImage, ipcRenderer } = require('electron');
//const { remote, app, BrowserWindow } = electron.remote;

// const electron = require('electron');


var saveOptions = 'defaultPath : "C:/Users/marco/Desktop/Electron/Outputs"';
var openOptions = 'defaultPath : "C:/Users/marco/Desktop/Electron/Outputs"';
var openPath;
var savePath;
var b;
var storeMasterVolume;
var masterVolumeMuted = false;
var videoSpeed = 1;
var dropZone;


// var progressBar = new ProgressBar({
//     abortOnError: false,
//     indeterminate: false,
//     initialValue: 0,
//     maxValue: 100,
//     closeOnComplete: false,
//     title: 'Title of the Progress Bar',
//     text: 'Text of the Progress Bar',
//     detail: 'Detail to Show actual Progress, ' + 
//             'Can be set as Dynamic to show actual Status',
//     style: {
//         text: {},
//         detail: {},
//         bar: { 'width': '100%', 'background-color': '#BBE0F1' },
//         value: {}
//     },
//     // browserWindow: {
//     //     parent: null,
//     //     modal: true,
//     //     resizable: false,
//     //     closable: false,
//     //     minimizable: false,
//     //     maximizable: false,
//     //     width: 500,
//     //     height: 170,
//     //     // Important - If not passed, Progress Bar will not be displayed. 
//     //     webPreferences: {
//     //         nodeIntegration: true
//     //     }
//     // }
// });


window.onload = function() {
    dropZone = document.getElementById('dropzone');
    
    window.addEventListener('dragenter', function(e) {
        showDropZone();
    });

    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);
    dropZone.addEventListener('dragleave', function(e) {
        hideDropZone();
    });

    dropZone.addEventListener('drop', handleDrop);

}

function showDropZone() {
    dropZone.style.display = "block";
}
function hideDropZone() {
    dropZone.style.display = "none";
}
function allowDrag(e) {
    if (true) {  // Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
}

function handleDrop(e) {
    e.preventDefault();
    hideDropZone();

    //for (const f of event.dataTransfer.files) { }
    f = e.dataTransfer.files[0];
    console.log('File Path of dragged file: ', f.path);
    openPath = f.path;
    runUpload();
}



function openDialog() {
    remote.dialog.showOpenDialog(openOptions).then(
        output => {
        openPath = output.filePaths[0];
        console.log('opening ' + openPath + '...');
        document.getElementById('openDialog').blur();
        runUpload();
    });
}

function videoHandler(event) {
    //console.log('videohandling', event.currentTime);
    video = document.getElementById('preview');
    //get video position in %
    percentDuration = event.currentTime / video.duration;
    //console.log("percentDuration", percentDuration);
        
    //apply the percent as decimal to timeline bar (and the timeline stick)
    //playHeadBar = document.getElementById('playHeadBar');
    playHeadHandle = document.getElementById('playHeadHandle');

    playHeadHandle.value = percentDuration;
    //playHeadBar.value = playHeadHandle.value;

    timestampHandler(video.currentTime, video.duration);
}

function playPause(state = 'toggle') {
    video = document.getElementById('preview');
    document.getElementById('playButton');
    
    switch(state) {
        case 'play':
            if(!video.paused) {
                videoSpeed = videoSpeed + 0.5;
            }
            video.playbackRate = videoSpeed;
            video.play();
            document.getElementById('playButton').innerText = '⏸️';
            break;
        case 'pause':
            video.pause();
            videoSpeed = 1;
            document.getElementById('playButton').innerText = '▶️';
            break;
        case 'toggle':
            if(video.paused) {
                video.playbackRate = videoSpeed;
                video.play();
                document.getElementById('playButton').innerText = '⏸️';
            }
            else {
                video.pause();
                videoSpeed = 1;
                document.getElementById('playButton').innerText = '▶️';
            }
            break;
    }
}

function gotoStart() {
    video = document.getElementById('preview');
    video.currentTime = 0;
}

function gotoEnd() {
    video = document.getElementById('preview');
    video.currentTime = video.duration;
}


document.addEventListener('keydown', (event => {
    //console.log('key ', event.key, ' pressed');
    video = document.getElementById('preview');
    switch(event.key) {
        case ' ':
            playPause();
            event.preventDefault();
            event.stopPropagation();
            break;

        case ',':
            //seek back one frame
            framerate = parseInt(b.streams[0].r_frame_rate)
            newTime = video.currentTime - (1 / framerate);
            if(newTime < 0) {
                console.log('cant skip backward (at beginning)');
            } else {
                video.currentTime = newTime;
            }
            break;

        case '.':
            //seek forward one frame
            framerate = parseInt(b.streams[0].r_frame_rate)
            newTime = video.currentTime + (1 / framerate);
            if(newTime > video.duration) {
                console.log('cant skip forward (at end)');
            } else {
                video.currentTime = newTime;
            }
            break;

        case 'ArrowLeft':
            //seek back one second
            newTime = video.currentTime - 1;
            if(newTime < 0) {
                console.log('cant skip backward (at beginning)');
            } else {
                video.currentTime = newTime;
            }
            event.preventDefault();
            event.stopPropagation();
            break;

        case 'ArrowRight':
            //seek forward one second
            newTime = video.currentTime + 1;
            if(newTime > video.duration) {
                console.log('cant skip backward (at beginning)');
            } else {
                video.currentTime = newTime;
            }
            event.preventDefault();
            event.stopPropagation();
            break;
        
        case 'l':
            playPause('play');
            break;
        
        case 'k':
            playPause('pause');
            break;
    }
}));


// document.addEventListener('drop', (event => {
//     console.log(lastTarget);
//     event.preventDefault(); 
//     event.stopPropagation(); 
  
//     //for (const f of event.dataTransfer.files) { }
//     f = event.dataTransfer.files[0];
//     console.log('File Path of dragged file: ', f.path);
//     openPath = f.path;
//     runUpload();

// }));

// document.addEventListener('dragenter', (e) => {
//     // console.log('File is in the Drop Space');
//     console.log('enter',lastTarget);
//     lastTarget = e.target;
// }); 
  
// document.addEventListener('dragleave', (e) => { 
//     // console.log('File has left the Drop Space');
//     console.log('exit',lastTarget);
//     dragDetector = document.getElementById('dragDetector');
//     if(e.target === lastTarget || e.target === document) {
//         dragDetector.style.visibility = "hidden";
//         dragDetector.style.opacity = 0;
//     }
// });

function runFFProbe(filepath) {
    return new Promise(resolve => {
        ffmpeg.ffprobe(filepath, function(err, metadata) {
            console.dir(metadata);
            b = metadata;
            resolve();
        }); 
    });
}

function updateHTML() {
    const preview = document.getElementById('preview');
    const timelineBarContainer = document.getElementById('timelinebarcontainer');

    clearMedia();

    document.getElementById('openFilePathLabel').innerText = "Opened file path: " + openPath;

    rawBitrate = b.format.size;
    sizeReadable = (rawBitrate / 1024 / 1024).toFixed(2);
    console.log('file size ' + sizeReadable + ' mb');
    document.getElementById('currentFileSizeLabel').innerText = "Current file size: " + sizeReadable + " MB at " + (Number(b.streams[0].bit_rate) / 1000) + " KB/sec";

    // resX = b.streams[0].width;
    // resY = b.streams[0].height;
    // if(document.getElementById('lockResolution').checked) {
    //     console.log('lock resolution checked');
    // } else {
    //     console.log('locked resolution not checked')
    // }
    // console.log(resX, resY);
    // document.getElementById('resolutionX').value = resX;
    // document.getElementById('resolutionY').value = resY;


    for (var i = 0; i < b.streams.length; i++) {
        var timelineBars = document.getElementsByClassName('timelinebar');
        var timelineBarName = 'timelinebar' + String(i);
        var timelineBar = document.createElement('div');
        timelineBar.setAttribute('id', timelineBarName); 
        timelineBarContainer.appendChild(timelineBar);

        if (b.streams[i].codec_type == 'video') {
            document.getElementById(timelineBarName).setAttribute('class', 'timelinebar video');
            source = document.createElement('source');
            source.setAttribute('src', openPath);
            preview.appendChild(source);
            preview.load();

        } else if (b.streams[i].codec_type == 'audio') {
            document.getElementById(timelineBarName).setAttribute('class', 'timelinebar audio'); 
        } 
    }
}

async function runUpload() {
    clearMedia();
    await runFFProbe(openPath);
    updateHTML();
}    

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function saveDialog() {
    remote.dialog.showSaveDialog(saveOptions).then(
        output => {
        console.log(output.filePath);
        savePath = output.filePath;
    });
}

function clearMedia() {
    videoPanel = document.getElementById('preview');
    removeAllChildNodes(videoPanel);
    videoPanel.load();
    removeAllChildNodes(document.getElementById('timelinebarcontainer'));
    // document.getElementById('resolutionX').value = '';
    // document.getElementById('resolutionY').value = '';
    // document.getElementById('lockResolution').checked = 'true';
    document.getElementById('openFilePathLabel').innerText = '';
    document.getElementById('currentFileSizeLabel').innerText = "";
}
function audioSize() {
    audioTrackSize = 0;
    
    for (var i = 1; i < (b.streams.length); i++) {
        currentStreamSize = Math.ceil(b.streams[i].duration * b.streams[i].bit_rate);
        audioTrackSize = audioTrackSize + currentStreamSize;
        console.log('addding', currentStreamSize, 'to the file');
    }
    audioTrackSizeMB = (audioTrackSize / 8388608);
    console.log('audio tracks are', audioTrackSizeMB, 'MB large');
    return(audioTrackSizeMB);
}

function calculateBitrate(target) {
    var nativeBitrate = b.streams[0].bit_rate;

    if( target === 'native') {
        targetBitrate = nativeBitrate;
        console.log('using native bitrate, file will likely be larger');
    }
    else {
        targetBitrate = Math.ceil((((parseInt(target) - audioSize()) / parseFloat(b.format.duration)) * 8192))
    }
    
    console.log('targetBitrate:', targetBitrate.toString());
    return(targetBitrate.toString());
}

function setVideoPresets() {
    video = document.getElementById('preview');
    bitrate = calculateBitrate(document.getElementById('sizeTarget').value);
    
    //fps = video.fps;
    fps = 0;

    res = '1920x1080';
    
    returnList = [res,bitrate,fps];

    return(returnList);
}

// function setAudioPresets() {
//     var nativeBitrate = b.streams[1].audioBitrate;
//     bitrateDropdown = document.getElementById('audioPreset').value;

//     if( bitrateDropdown == 'native') { bitrate = nativeBitrate }
//     else {  bitrate = bitrateDropdown  }

//     if(bitrate > nativeBitrate) {bitrate = nativeBitrate}    

//     return(bitrate);
// }

function runFFmpeg() {
    videoSettings = setVideoPresets();
    res = videoSettings[0];
    bitrate = videoSettings[1];
    //fps = videoSettings[2];

    console.log('exporting video at', res, 'with bitrate of', bitrate);

    // audioSettings = setAudioPresets();



    ipcRenderer.send('create-new-progressbar', 'OVER TO YOU');

    ffmpeg({ source: openPath })
    //.noAudio()
    //.noVideo()
    //.size(res)
    .videoBitrate(bitrate)
    //.fps(fps)
    //.audioBitrate(audioSettings)
    .output(savePath)
    .on('progress', function(progress) {
        console.log('processing: ' + Math.floor(progress.percent) + '% done');
        ipcRenderer.send('send-new-progress-value', progress.percent);
    })
    .on('end', function() {
        console.log('Finished processing');
        alert('Export finished.');
        ipcRenderer.send('send-new-progress-value', 'FINISHED');
    }) 
    .run();
}


function updateSliderPos() {
    //move the timeline bar to match the position of the handle
	//playHeadBar = document.getElementById('playHeadBar');
	playHeadHandle = document.getElementById('playHeadHandle');
    // playHeadBar.value = playHeadHandle.value;
    
    //seek the track of the video to match the position of the bar
    video = document.getElementById('preview');
    //console.log('percentage of video set', playHeadHandle.value);
    video.currentTime = playHeadHandle.value * video.duration;
    timestampHandler(video.currentTime, video.duration);
}

function updateMasterVolume() {
    masterVolumeMuted = false;

    video = document.getElementById('preview');
    masterVolumeSlider = document.getElementById('masterVolumeSlider');
    video.volume = masterVolumeSlider.value;

    masterVolumeIndicator = document.getElementById('masterVolumeIndicator');
    if(masterVolumeSlider.value <= .5) {
        masterVolumeIndicator.className = 'fa fa-volume-down';
    } else if(masterVolumeSlider.value > .5) {
        masterVolumeIndicator.className = 'fa fa-volume-up';
    }
    if(masterVolumeSlider.value < .03) {
        masterVolumeIndicator.className = 'fa fa-volume-off';
    }
}

function masterVolumeToggle() {
    video = document.getElementById('preview');
    masterVolumeSlider = document.getElementById('masterVolumeSlider');
    masterVolumeIndicator = document.getElementById('masterVolumeIndicator');

    if(masterVolumeMuted) {
        masterVolumeIndicator.className = 'fa fa-volume-up';
        masterVolumeSlider.value = storeMasterVolume;
        updateMasterVolume();
        masterVolumeMuted = false;

    } else {
        storeMasterVolume = masterVolumeSlider.value;
        masterVolumeIndicator.className = 'fa fa-volume-off';
        masterVolumeSlider.value = 0;
        video.volume = 0;
        masterVolumeMuted = true;
    }
}

function timestampHandler(currentTime, duration) {
    remainingTime = duration - currentTime;

    readableCurrentTime = new Date(currentTime * 1000).toISOString().substr(11, 8);
    readableRemainingTime = new Date(remainingTime * 1000).toISOString().substr(11, 8);

    document.getElementById('timestampCurrent').innerText = readableCurrentTime;
    document.getElementById('timestampRemaining').innerText = readableRemainingTime;
}