/* eslint-env jasmine */

import TestHelpers from './test-helpers.js';
import WaveSurfer from '../src/wavesurfer.js';

/** @test {WaveSurfer} */
describe('WaveSurfer/playback:', () => {
  let wavesurfer;
  let element;
  let manualDestroy = false;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

  beforeEach(done => {
    manualDestroy = false;

    const wave = TestHelpers.createWaveform();
    wavesurfer = wave[0];
    element = wave[1];
    wavesurfer.load(TestHelpers.EXAMPLE_FILE_PATH);

    wavesurfer.once('ready', done);
  });

  afterEach(() => {
    if (!manualDestroy) {
      wavesurfer.destroy();
      TestHelpers.removeElement(element);
    }
  });

  /**
   * @test {WaveSurfer#isReady}
   */
  it('be ready', () => {
    wavesurfer.play();

    expect(wavesurfer.isReady).toBeTrue();
  });

  /**
   * @test {WaveSurfer#VERSION}
   */
  it('have version number', () => {
    const { version } = require('../package.json');
    expect(WaveSurfer.VERSION).toEqual(version);
  });

  /**
   * @test {WaveSurfer#play}
   * @test {WaveSurfer#isPlaying}
   */
  it('play', () => {
    wavesurfer.play();

    expect(wavesurfer.isPlaying()).toBeTrue();
  });

  /**
   * @test {WaveSurfer#play}
   * @test {WaveSurfer#isPlaying}
   * @test {WaveSurfer#pause}
   */
  it('pause', () => {
    wavesurfer.play();
    expect(wavesurfer.isPlaying()).toBeTrue();

    wavesurfer.pause();
    expect(wavesurfer.isPlaying()).toBeFalse();
  });

  /**
   * @test {WaveSurfer#playPause}
   * @test {WaveSurfer#isPlaying}
   */
  it('play or pause', () => {
    wavesurfer.playPause();
    expect(wavesurfer.isPlaying()).toBeTrue();

    wavesurfer.playPause();
    expect(wavesurfer.isPlaying()).toBeFalse();
  });

  /**
   * @test {WaveSurfer#cancelAjax}
   */
  it('cancelAjax', () => {
    wavesurfer.cancelAjax();
    expect(wavesurfer.currentRequest).toBeNull();
  });

  /**
   * @test {WaveSurfer#loadBlob}
   */
  it('loadBlob', done => {
    fetch(TestHelpers.EXAMPLE_FILE_PATH)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        wavesurfer.once('ready', done);
        wavesurfer.loadBlob(blob);
      });
  });

  /** @test {WaveSurfer#getDuration}  */
  it('get duration', () => {
    const duration = parseInt(wavesurfer.getDuration(), 10);
    expect(duration).toEqual(TestHelpers.EXAMPLE_FILE_DURATION);
  });

  /** @test {WaveSurfer#getCurrentTime}  */
  it('get currentTime', () => {
    // initially zero
    let time = wavesurfer.getCurrentTime();
    expect(time).toEqual(0);

    // seek to 50%
    wavesurfer.seekTo(0.5);
    time = parseInt(wavesurfer.getCurrentTime(), 10);
    expect(time).toEqual(10);
  });

  /** @test {WaveSurfer#setCurrentTime}  */
  it('set currentTime', () => {
    // initially zero
    let time = wavesurfer.getCurrentTime();
    expect(time).toEqual(0);

    // set to 10 seconds
    wavesurfer.setCurrentTime(10);
    time = wavesurfer.getCurrentTime();
    expect(time).toEqual(10);

    // set to something higher than duration
    wavesurfer.setCurrentTime(1000);
    time = wavesurfer.getCurrentTime();
    // sets it to end of track
    time = parseInt(wavesurfer.getCurrentTime(), 10);
    expect(time).toEqual(TestHelpers.EXAMPLE_FILE_DURATION);
  });

  /** @test {WaveSurfer#skipBackward}  */
  it('should skip backward', () => {
    // seek to 50%
    wavesurfer.seekTo(0.5);

    // skip 4 seconds backward
    wavesurfer.skipBackward(4);
    let time = wavesurfer.getCurrentTime();
    expect(time).toBeWithinRange(6.88, 6.89);

    // skip backward with params.skipLength (default: 2 seconds)
    wavesurfer.skipBackward();
    time = wavesurfer.getCurrentTime();
    expect(time).toBeWithinRange(4.88, 4.89);
  });

  /** @test {WaveSurfer#skipForward}  */
  it('skip forward', () => {
    // skip x seconds forward
    const expectedTime = 4;
    wavesurfer.skipForward(expectedTime);
    let time = wavesurfer.getCurrentTime();
    expect(time).toBeNear(expectedTime, 0.0001);

    // skip forward with params.skipLength (default: 2 seconds)
    wavesurfer.skipForward();
    time = wavesurfer.getCurrentTime();
    expect(time).toBeNear(expectedTime + 2, 0.0001);
  });

  /** @test {WaveSurfer#getPlaybackRate}  */
  it('get playback rate', () => {
    const rate = wavesurfer.getPlaybackRate();
    expect(rate).toEqual(1);
  });

  /** @test {WaveSurfer#setPlaybackRate}  */
  it('set playback rate', () => {
    const rate = 0.5;
    wavesurfer.setPlaybackRate(rate);

    expect(wavesurfer.getPlaybackRate()).toEqual(rate);
  });

  /** @test {WaveSurfer#getVolume}  */
  it('get volume', () => {
    const volume = wavesurfer.getVolume();
    expect(volume).toEqual(1);
  });

  /** @test {WaveSurfer#setVolume}  */
  it('set volume', done => {
    const targetVolume = 0.5;

    wavesurfer.once('volume', result => {
      expect(result).toEqual(targetVolume);

      done();
    });

    wavesurfer.setVolume(targetVolume);
  });

  /** @test {WaveSurfer#toggleMute}  */
  it('toggle mute', () => {
    wavesurfer.toggleMute();
    expect(wavesurfer.isMuted).toBeTrue();

    wavesurfer.toggleMute();
    expect(wavesurfer.isMuted).toBeFalse();
  });

  /** @test {WaveSurfer#setMute}  */
  it('set mute', () => {
    wavesurfer.setMute(true);
    expect(wavesurfer.isMuted).toBeTrue();

    wavesurfer.setMute(false);
    expect(wavesurfer.isMuted).toBeFalse();
  });

  /** @test {WaveSurfer#getMute}  */
  it('get mute', () => {
    wavesurfer.setMute(true);
    expect(wavesurfer.getMute()).toBeTrue();

    wavesurfer.setMute(false);
    expect(wavesurfer.getMute()).toBeFalse();
  });

  /** @test {WaveSurfer#zoom}  */
  it('set zoom parameters', () => {
    wavesurfer.zoom(20);
    expect(wavesurfer.params.minPxPerSec).toEqual(20);
    expect(wavesurfer.params.scrollParent).toBe(true);
  });

  /** @test {WaveSurfer#zoom}  */
  it('set unzoom parameters', () => {
    wavesurfer.zoom(false);
    expect(wavesurfer.params.minPxPerSec).toEqual(wavesurfer.defaultParams.minPxPerSec);
    expect(wavesurfer.params.scrollParent).toBe(false);
  });

  /** @test {WaveSurfer#getWaveColor} */
  it('allow getting waveColor', () => {
    const waveColor = wavesurfer.getWaveColor();
    expect(waveColor).toEqual('#90F09B');
  });

  /** @test {WaveSurfer#setWaveColor} */
  it('allow setting waveColor', () => {
    const color = 'blue';
    wavesurfer.setWaveColor(color);
    const waveColor = wavesurfer.getWaveColor();

    expect(waveColor).toEqual(color);
  });

  /** @test {WaveSurfer#getProgressColor} */
  it('allow getting progressColor', () => {
    const progressColor = wavesurfer.getProgressColor();
    expect(progressColor).toEqual('purple');
  });

  /** @test {WaveSurfer#setProgressColor} */
  it('allow setting progressColor', () => {
    wavesurfer.setProgressColor('green');
    const progressColor = wavesurfer.getProgressColor();

    expect(progressColor).toEqual('green');
  });

  /** @test {WaveSurfer#getCursorColor} */
  it('allow getting cursorColor', () => {
    const cursorColor = wavesurfer.getCursorColor();
    expect(cursorColor).toEqual('white');
  });

  /** @test {WaveSurfer#setCursorColor} */
  it('allow setting cursorColor', () => {
    wavesurfer.setCursorColor('black');
    const cursorColor = wavesurfer.getCursorColor();

    expect(cursorColor).toEqual('black');
  });

  /** @test {WaveSurfer#getBackgroundColor} */
  it('allow getting backgroundColor', () => {
    const bgColor = wavesurfer.getBackgroundColor();
    expect(bgColor).toEqual(null);
  });

  /** @test {WaveSurfer#setBackgroundColor} */
  it('allow setting backgroundColor', () => {
    wavesurfer.setBackgroundColor('#FFFF00');
    const bgColor = wavesurfer.getBackgroundColor();

    expect(bgColor).toEqual('#FFFF00');
  });

  /** @test {WaveSurfer#getHeight} */
  it('allow getting height', () => {
    const height = wavesurfer.getHeight();
    expect(height).toEqual(128);
  });

  /** @test {WaveSurfer#setHeight} */
  it('allow setting height', () => {
    wavesurfer.setHeight(150);
    const height = wavesurfer.getHeight();

    expect(height).toEqual(150);
  });

  /** @test {WaveSurfer#exportPCM} */
  it('return Promise with PCM array data', done => {
    wavesurfer.load(TestHelpers.EXAMPLE_FILE_PATH);
    wavesurfer.once('ready', () => {
      wavesurfer.exportPCM(1024, 10000, false, 0, 100).then(pcmData => {
        expect(pcmData instanceof Array).toBeTruthy();

        done();
      });
    });
  });
  it('return Promise with PCM array data in new window', done => {
    wavesurfer.load(TestHelpers.EXAMPLE_FILE_PATH);
    wavesurfer.once('ready', () => {
      wavesurfer.exportPCM(1024, 10000, true, 0, 100).then(pcmData => {
        expect(pcmData instanceof Array).toBeTruthy();

        done();
      });
    });
  });

  /** @test {WaveSurfer#getFilters} */
  it('return the list of current set filters as an array', () => {
    const list = wavesurfer.getFilters();

    expect(list).toEqual([]);
  });

  /** @test {WaveSurfer#exportImage} */
  it('export image data', () => {
    const imgData = wavesurfer.exportImage();
    expect(imgData).toBeNonEmptyString();

    wavesurfer.exportImage('image/png', 1, 'blob').then(blobs => {
      expect(blobs.length).toEqual(1);
      expect(blobs[0] instanceof Blob).toBeTruthy();
    });
  });

  /** @test {WaveSurfer#destroy} */
  it('destroy', done => {
    manualDestroy = true;

    wavesurfer.once('destroy', () => {
      TestHelpers.removeElement(element);
      done();
    });
    wavesurfer.destroy();

    expect(wavesurfer.backend).toBeNull();
  });

  describe('seek event emission', () => {
    let seekEventSpy;
    let interactionEventSpy;

    beforeEach(() => {
      seekEventSpy = jasmine.createSpy();
      interactionEventSpy = jasmine.createSpy();

      wavesurfer.on('seek', () => {
        seekEventSpy();
      });
      wavesurfer.on('interaction', () => {
        interactionEventSpy();
      });
    });

    afterEach(() => {
      wavesurfer.unAll();
      wavesurfer.setDisabledEventEmissions([]);
    });

    describe('when event emissions are not disabled', () => {
      it('all event handlers should be called', () => {
        wavesurfer.seekTo(0.5);
        wavesurfer.setCurrentTime(1.45);

        expect(seekEventSpy).toHaveBeenCalled();
        expect(interactionEventSpy).toHaveBeenCalled();
      });
    });

    describe('when seek and interaction events are disabled', () => {
      beforeEach(() => {
        wavesurfer.setDisabledEventEmissions(['seek', 'interaction']);
      });

      it('should not call event handlers for either "seek" or "interaction"', () => {
        wavesurfer.seekTo(0.5);
        wavesurfer.setCurrentTime(1.45);

        expect(seekEventSpy).not.toHaveBeenCalled();
        expect(interactionEventSpy).not.toHaveBeenCalled();
      });
    });
  });
});

/** @test {WaveSurfer} */
describe('WaveSurfer/errors:', () => {
  let element;

  beforeEach(() => {
    element = TestHelpers.createElement('test');
  });

  afterEach(() => {
    TestHelpers.removeElement(element);
  });

  /**
   * @test {WaveSurfer}
   */
  it('throw when container element is not found', () => {
    expect(() => {
      TestHelpers.createWaveform({
        container: '#foo'
      });
    }).toThrow(new Error('Container element not found'));
  });

  /**
   * @test {WaveSurfer}
   */
  it('throw when media container element is not found', () => {
    expect(() => {
      TestHelpers.createWaveform({
        container: '#test',
        mediaContainer: '#foo'
      });
    }).toThrow(new Error('Media Container element not found'));
  });

  /**
   * @test {WaveSurfer}
   */
  it('throw for invalid maxCanvasWidth param', () => {
    expect(() => {
      TestHelpers.createWaveform({
        container: '#test',
        maxCanvasWidth: 0.5
      });
    }).toThrow(new Error('maxCanvasWidth must be greater than 1'));

    expect(() => {
      TestHelpers.createWaveform({
        container: '#test',
        maxCanvasWidth: 3
      });
    }).toThrow(new Error('maxCanvasWidth must be an even number'));
  });

  /**
   * @test {WaveSurfer}
   */
  it('throw for invalid renderer', () => {
    expect(() => {
      TestHelpers.createWaveform({
        container: '#test',
        renderer: 'foo'
      });
    }).toThrow(new Error('Renderer parameter is invalid'));
  });

  /**
   * @test {WaveSurfer}
   */
  it('not throw when rendered and media is not loaded', () => {
    expect(() => {
      const wave = TestHelpers.createWaveform({
        container: '#test'
      });

      wave[0].setWaveColor('#000000');
    }).not.toThrow();
  });

  /**
   * @test {WaveSurfer#load}
   */
  it('throw when url parameter for load is empty', () => {
    const wave = TestHelpers.createWaveform({
      container: '#test'
    });
    const expectedError = new Error('url parameter cannot be empty');

    // undefined url
    expect(() => {
      wave[0].load();
    }).toThrow(expectedError);

    // empty string
    expect(() => {
      wave[0].load('');
    }).toThrow(expectedError);

    // null
    expect(() => {
      wave[0].load(null);
    }).toThrow(expectedError);
  });
});
