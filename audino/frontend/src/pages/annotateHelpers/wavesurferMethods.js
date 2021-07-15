import React from 'react';
import {
  faBackward,
  faForward,
  faPlayCircle,
  faPauseCircle
} from '@fortawesome/free-solid-svg-icons';
import WaveSurfer from '../../wavesurfer.js/src/wavesurfer.js';
import RegionsPlugin from '../../wavesurfer.js/src/plugin/regions/index.js';
import SpectrogramPlugin from '../../wavesurfer.js/src/plugin/spectrogram/index.js';
import { IconButton } from '../../components/button';

const colormap = require('colormap');

/**
 * Useful object paths:
 * wavesurfer.spectrogram.canvas
 * wavesurfer.spectrogram.wrapper
 * wavesurfer.drawer
 * wavesurfer.regions.list
 */

class WavesurferMethods {
  constructor(props) {
    this.state = props.state;
    this.annotate = props.annotate;
  }

  updateState(state) {
    this.state = state;
  }

  setState(items) {
    this.annotate.setState(items);
  }

  loadWavesurfer() {
    const spectrogramColorMap = colormap({
      colormap: 'hot',
      nshades: 256,
      format: 'float'
    });

    this.setState({ isDataLoading: true });
    const fftSamples = 512;
    const wavesurfer = WaveSurfer.create({
      container: '#waveform',
      barWidth: 0,
      barHeight: 0,
      height: fftSamples / 2,
      width: '100%',
      barGap: null,
      mediaControls: false,
      fillParent: true,
      scrollParent: true,
      visualization: 'invisible', // spectrogram //invisable
      minPxPerSec: 100,
      maxCanvasWidth: 5000000, // false,
      plugins: [
        SpectrogramPlugin.create({
          fftSamples,
          position: 'relative',
          container: '#wavegraph',
          labelContainer: '#waveform-labels',
          labels: true,
          scrollParent: true,
          colorMap: spectrogramColorMap
        }),
        RegionsPlugin.create()
      ]
    });
    const { history } = this.annotate.props;
    history.listen(() => {
      wavesurfer.stop();
    });

    wavesurfer.on('ready', () => {
      const screenSize = window.screen.width;
      if (screenSize > wavesurfer.getDuration() * wavesurfer.params.minPxPerSec) {
        wavesurfer.zoom(screenSize / wavesurfer.getDuration());
        wavesurfer.spectrogram._onUpdate(screenSize);
      }
      this.state.isRendering = false;
      this.setState({ isRendering: false });
      wavesurfer.enableDragSelection({ color: 'rgba(0, 102, 255, 0.3)' });
    });
    wavesurfer.on('region-updated', region => {
      this.handlePause();
      this.styleRegionColor(region, 'rgba(0, 102, 255, 0.3)');
      region._onUnSave();
    });

    wavesurfer.on('region-created', region => {
      this.handlePause();
      this.setState({
        selectedSegment: region
      });
    });

    wavesurfer.on('region-click', (r, e) => {
      e.stopPropagation();
      this.setState({
        isPlaying: true,
        selectedSegment: r
      });
      r.play();
    });
    wavesurfer.on('pause', () => {
      this.setState({ isPlaying: false });
    });

    return wavesurfer;
  }

  handlePlay() {
    const { wavesurfer } = this.state;
    this.setState({ isPlaying: true });
    wavesurfer.play();
  }

  handlePause() {
    const { wavesurfer } = this.state;
    this.setState({ isPlaying: false });
    wavesurfer.pause();
  }

  handleForward() {
    const { wavesurfer } = this.state;
    wavesurfer.skipForward(5);
  }

  handleBackward() {
    const { wavesurfer } = this.state;
    wavesurfer.skipBackward(5);
  }

  handleZoom(e) {
    const { wavesurfer } = this.state;
    const zoom = Number(e.target.value);
    wavesurfer.zoom(zoom);
    this.setState({ zoom });
  }

  styleRegionColor(region, color) {
    region.style(region.element, {
      backgroundColor: color
    });
  }

  renderButtons(isPlaying) {
    return (
      <div className="row justify-content-center my-4">
        <div className="col-md-1 col-2">
          <IconButton
            icon={faBackward}
            size="2x"
            title="Skip Backward"
            onClick={() => {
              this.handleBackward();
            }}
          />
        </div>
        <div className="col-md-1 col-2">
          {!isPlaying ? (
            <IconButton
              icon={faPlayCircle}
              size="2x"
              title="Play"
              onClick={() => {
                this.handlePlay();
              }}
            />
          ) : null}
          {isPlaying ? (
            <IconButton
              icon={faPauseCircle}
              size="2x"
              title="Pause"
              onClick={() => {
                this.handlePause();
              }}
            />
          ) : null}
        </div>
        <div className="col-md-1 col-2">
          <IconButton
            icon={faForward}
            size="2x"
            title="Skip Forward"
            onClick={() => {
              this.handleForward();
            }}
          />
        </div>
      </div>
    );
  }
}

export default WavesurferMethods;
