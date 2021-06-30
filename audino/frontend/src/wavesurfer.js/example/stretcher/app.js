// Create an instance
let wavesurfer = {};

// Init & load
document.addEventListener('DOMContentLoaded', function() {
    // Init wavesurfer
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        loaderColor: 'purple',
        cursorColor: 'navy'
    });
    wavesurfer.load('../../example/media/demo.wav');

    // Time stretcher
    wavesurfer.on('ready', function() {
        const st = new window.soundtouch.SoundTouch(wavesurfer.backend.ac.sampleRate);
        var { buffer } = wavesurfer.backend;
        let channels = buffer.numberOfChannels;
        var l = buffer.getChannelData(0);
        const r = channels > 1 ? buffer.getChannelData(1) : l;
        var { length } = buffer;
        let seekingPos = null;
        var seekingDiff = 0;

        var source = {
            extract: function(target, numFrames, position) {
                if (seekingPos != null) {
                    seekingDiff = seekingPos - position;
                    seekingPos = null;
                }

                position += seekingDiff;

                for (let i = 0; i < numFrames; i++) {
                    target[i * 2] = l[i + position];
                    target[i * 2 + 1] = r[i + position];
                }

                return Math.min(numFrames, length - position);
            }
        };

        let soundtouchNode;

        wavesurfer.on('play', function() {
            seekingPos = ~~(wavesurfer.backend.getPlayedPercents() * length);
            st.tempo = wavesurfer.getPlaybackRate();

            if (st.tempo === 1) {
                wavesurfer.backend.disconnectFilters();
            } else {
                if (!soundtouchNode) {
                    var filter = new window.soundtouch.SimpleFilter(source, st);
                    soundtouchNode = window.soundtouch.getWebAudioNode(wavesurfer.backend.ac, filter);
                }
                wavesurfer.backend.setFilter(soundtouchNode);
            }
        });

        wavesurfer.on('pause', function() {
            soundtouchNode && soundtouchNode.disconnect();
        });

        wavesurfer.on('seek', function() {
            seekingPos = ~~(wavesurfer.backend.getPlayedPercents() * length);
        });
    });
});
