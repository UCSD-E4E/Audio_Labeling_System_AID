import * as util from './util';
import WaveSurfer from "wavesurfer.js" ;
//import "frontend/src/wavesurfer.js/lib/wavesurfer.min.js";/
//import "frontend/src/wavesurfer.js/lib/wavesurfer.spectrogram.min.js"
/**
 * Parent class for renderers
 *
 * @extends {Observer}
 */
export default class Drawer extends util.Observer {
    /**
     * @param {HTMLElement} container The container node of the wavesurfer instance
     * @param {WavesurferParams} params The wavesurfer initialisation options
     */
    constructor(container, params) {
        super();

        this.container = container;
        /**
         * @type {WavesurferParams}
         */
        this.params = params;
        /**
         * The width of the renderer
         * @type {number}
         */
        this.width = 0;
        /**
         * The height of the renderer
         * @type {number}
         */
        this.height = params.height * this.params.pixelRatio;

        this.lastPos = 0;
        /**
         * The `<wave>` element which is added to the container
         * @type {HTMLElement}
         */
        this.wrapper = null;
    }

    /**
     * Alias of `util.style`
     *
     * @param {HTMLElement} el The element that the styles will be applied to
     * @param {Object} styles The map of propName: attribute, both are used as-is
     * @return {HTMLElement} el
     */
    style(el, styles) {
        return util.style(el, styles);
    }

    /**
     * Create the wrapper `<wave>` element, style it and set up the events for
     * interaction
     */
    createWrapper() {
        this.wrapper = this.container.appendChild(
            document.createElement('wave')
        );

        this.style(this.wrapper, {
            display: 'block',
            position: 'relative',
            userSelect: 'none',
            webkitUserSelect: 'none',
            height: this.params.height/this.params.pixelRatio + 17 + 'px', //THIS IS WHERE HEIGHT IS CHANGED
            left: 55 / this.params.pixelRatio / 2 + 'px',
        }); //${-55 / this.pixelRatio / 2}
        console.log(-55 / this.pixelRatio / 2)
        if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
                width: '100%',
                overflowX: this.params.hideScrollbar ? 'hidden' : 'auto',
                overflowY: 'hidden'
            });
        }

        this.setupWrapperEvents();
    }

    /**
     * Handle click event
     *
     * @param {Event} e Click event
     * @param {?boolean} noPrevent Set to true to not call `e.preventDefault()`
     * @return {number} Playback position from 0 to 1
     */
    handleEvent(e, noPrevent) {
        !noPrevent && e.preventDefault();

        const clientX = e.targetTouches
            ? e.targetTouches[0].clientX
            : e.clientX;
        const bbox = this.wrapper.getBoundingClientRect();

        const nominalWidth = this.width;
        const parentWidth = this.getWidth();

        let progress;
        if (!this.params.fillParent && nominalWidth < parentWidth) {
            progress =
                (this.params.rtl ? bbox.right - clientX : clientX - bbox.left) *
                    (this.params.pixelRatio / nominalWidth) || 0;
        } else {
            progress =
                ((this.params.rtl
                    ? bbox.right - clientX
                    : clientX - bbox.left) +
                    this.wrapper.scrollLeft) /
                    this.wrapper.scrollWidth || 0;
        }

        return util.clamp(progress, 0, 1);
    }

    /**
     * Handle click event
     *
     * @param {Event} e Click event
     * @param {?boolean} noPrevent Set to true to not call `e.preventDefault()`
     * @return {number} frequency position from 0 to 1
     */
    handleEventVertical(e, noPrevent, height=null) {
        if (!height) {
            height = this.wrapper.scrollHeight
        }
        !noPrevent && e.preventDefault();

        const clientY = e.targetTouches
            ? e.targetTouches[0].clientY
            : e.clientY;
        const bbox = this.wrapper.getBoundingClientRect();

        const nominalHeight = this.height;
        const parentHeight = this.getHeight();

        let frequency;
        if (!this.params.fillParent && nominalHeight < parentHeight) {
            console.log(this.params.rtl ? bbox.bottom - clientY : clientY - bbox.top)
            frequency =
                (this.params.rtl ? bbox.bottom - clientY : clientY - bbox.top) *
                    (this.params.pixelRatio / nominalHeight) || 0;
        } else {
            frequency = (clientY - bbox.top) / height || 0;
            /**
             *  frequency =
                ((this.params.rtl
                    ? bbox.bottom - clientY
                    : clientY - bbox.top)) /
                    height || 0;
             */
        }
        return util.clamp(frequency, 0, 1);
    }

    setupWrapperEvents() {
        this.wrapper.addEventListener('click', e => {
            const scrollbarHeight =
                this.wrapper.offsetHeight - this.wrapper.clientHeight;
            if (scrollbarHeight !== 0) {
                // scrollbar is visible.  Check if click was on it
                const bbox = this.wrapper.getBoundingClientRect();
                if (e.clientY >= bbox.bottom - scrollbarHeight) {
                    // ignore mousedown as it was on the scrollbar
                    return;
                }
            }

            if (this.params.interact) {
                this.fireEvent('click', e, this.handleEvent(e));
            }
        });

        this.wrapper.addEventListener('dblclick', e => {
            if (this.params.interact) {
                this.fireEvent('dblclick', e, this.handleEvent(e));
            }
        });

        this.wrapper.addEventListener('scroll', e =>
            this.fireEvent('scroll', e)
        );
    }

    /**
     * Draw peaks on the canvas
     *
     * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays
     * for split channel rendering
     * @param {number} length The width of the area that should be drawn
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that should be
     * rendered
     */
    drawPeaks(peaks, length, start, end, buffer) {
        this.resetScroll();
        this.setWidth(length);
        var visualization = this.params.visualization;
        if (visualization === 'invisible') {
            //draw nothing
        } else if (visualization === 'spectrogram' && buffer) {
            console.log(new Date().toLocaleString())
            this.drawSpectrogram(buffer);
            console.log(new Date().toLocaleString())
        } else {
            this.params.barWidth ? 
            this.drawBars(peaks, 0, start, end)
            :this.drawWave(peaks, 0, start, end);
        }
    }

    /**
     * Scroll to the beginning
     */
    resetScroll() {
        if (this.wrapper !== null) {
            this.wrapper.scrollLeft = 0;
        }
    }

    /**
     * Recenter the view-port at a certain percent of the waveform
     *
     * @param {number} percent Value from 0 to 1 on the waveform
     */
    recenter(percent) {
        const position = this.wrapper.scrollWidth * percent;
        this.recenterOnPosition(position, true);
    }

    /**
     * Recenter the view-port on a position, either scroll there immediately or
     * in steps of 5 pixels
     *
     * @param {number} position X-offset in pixels
     * @param {boolean} immediate Set to true to immediately scroll somewhere
     */
    recenterOnPosition(position, immediate) {
        const scrollLeft = this.wrapper.scrollLeft;
        const half = ~~(this.wrapper.clientWidth / 2);
        const maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
        let target = position - half;
        let offset = target - scrollLeft;

        if (maxScroll == 0) {
            // no need to continue if scrollbar is not there
            return;
        }

        // if the cursor is currently visible...
        if (!immediate && -half <= offset && offset < half) {
            // set rate at which waveform is centered
            let rate = this.params.autoCenterRate;

            // make rate depend on width of view and length of waveform
            rate /= half;
            rate *= maxScroll;

            offset = Math.max(-rate, Math.min(rate, offset));
            target = scrollLeft + offset;
        }

        // limit target to valid range (0 to maxScroll)
        target = Math.max(0, Math.min(maxScroll, target));
        // no use attempting to scroll if we're not moving
        if (target != scrollLeft) {
            this.wrapper.scrollLeft = target;
        }
    }

    /**
     * Get the current scroll position in pixels
     *
     * @return {number} Horizontal scroll position in pixels
     */
    getScrollX() {
        let x = 0;
        if (this.wrapper) {
            const pixelRatio = this.params.pixelRatio;
            x = Math.round(this.wrapper.scrollLeft * pixelRatio);

            // In cases of elastic scroll (safari with mouse wheel) you can
            // scroll beyond the limits of the container
            // Calculate and floor the scrollable extent to make sure an out
            // of bounds value is not returned
            // Ticket #1312
            if (this.params.scrollParent) {
                const maxScroll = ~~(
                    this.wrapper.scrollWidth * pixelRatio -
                    this.getWidth()
                );
                x = Math.min(maxScroll, Math.max(0, x));
            }
        }
        return x;
    }

    /**
     * Get the width of the container
     *
     * @return {number} The width of the container
     */
    getWidth() {
        return Math.round(this.container.clientWidth * this.params.pixelRatio);
    }

    getHeight() {
        return Math.round(this.container.clientHeight * this.params.pixelRatio);
    }

    /**
     * Set the width of the container
     *
     * @param {number} width The new width of the container
     * @return {boolean} Whether the width of the container was updated or not
     */
    setWidth(width) {
        if (this.width == width) {
            return false;
        }

        this.width = width;

        if (this.params.fillParent || this.params.scrollParent) {
            this.style(this.wrapper, {
                width: ''
            });
        } else {
            this.style(this.wrapper, {
                width: ~~(this.width / this.params.pixelRatio) + 'px'
            });
        }

        this.updateSize();
        return true;
    }

    /**
     * Set the height of the container
     *
     * @param {number} height The new height of the container.
     * @return {boolean} Whether the height of the container was updated or not
     */
    setHeight(height) {
        if (height == this.height) {
            return false;
        }
        this.height = height;

        this.style(this.wrapper, {
            height: ~~(this.height / this.params.pixelRatio) + 'px'
        });
        console.log("HEY LOOK HERE" + ~~(this.height / this.params.pixelRatio) + 'px')
        this.updateSize();
        return true;
    }

    /**
     * Called by wavesurfer when progress should be rendered
     *
     * @param {number} progress From 0 to 1
     */
    progress(progress) {
        const minPxDelta = 1 / this.params.pixelRatio;
        const pos = Math.round(progress * this.width) * minPxDelta;

        if (pos < this.lastPos || pos - this.lastPos >= minPxDelta) {
            this.lastPos = pos;

            if (this.params.scrollParent && this.params.autoCenter) {
                const newPos = ~~(this.wrapper.scrollWidth * progress);
                this.recenterOnPosition(
                    newPos,
                    this.params.autoCenterImmediately
                );
            }

            this.updateProgress(pos);
        }
    }

    /**
     * This is called when wavesurfer is destroyed
     */
    destroy() {
        this.unAll();
        if (this.wrapper) {
            if (this.wrapper.parentNode == this.container) {
                this.container.removeChild(this.wrapper);
            }
            this.wrapper = null;
        }
    }

    // Takes in integer 0-255 and maps it to rgb string
    getFrequencyRGB(colorValue) {
        if (this.params.colorMap) {
            // If the wavesurfer has a specified colour map
            var rgb = this.params.colorMap[colorValue];
            return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
        } else {
            // If not just use gray scale
            return 'rgb(' + colorValue + ',' + colorValue + ',' + colorValue + ')';
        }
        
    }

    async getFrequencies(buffer) {
        var fftSamples = this.params.fftSamples || 512;
        var channelOne = Array.prototype.slice.call(buffer.getChannelData(0));
        var bufferLength = buffer.length;
        var sampleRate = buffer.sampleRate;
        var frequencies = [];

        if (! buffer) {
            this.fireEvent('error', 'Web Audio buffer is not available');
            return;
        }

        var noverlap = this.params.noverlap;
        if (! noverlap) {
            var uniqueSamplesPerPx = buffer.length / this.width;
            noverlap = Math.max(0, Math.round(fftSamples - uniqueSamplesPerPx));
        }
        var fft = new WaveSurfer.FFT(fftSamples, sampleRate);

        var maxSlicesCount = Math.floor(bufferLength/ (fftSamples - noverlap));

        var currentOffset = 0;

        while (currentOffset + fftSamples < channelOne.length) {
            var segment = channelOne.slice(currentOffset, currentOffset + fftSamples);
            var spectrum = fft.calculateSpectrum(segment);
            var length = fftSamples / 2 + 1;
            var array = new Uint8Array(length);
            for (var j = 0; j < length; j++) {
                array[j] = Math.max(-255, Math.log10(spectrum[j])*45);
            }
            frequencies.push(array);
            currentOffset += (fftSamples - noverlap);
        }
        
        return frequencies;
    }

    async resample(oldMatrix) {
        var columnsNumber = this.width;
        var newMatrix = [];

        var oldPiece = 1 / oldMatrix.length;
        var newPiece = 1 / columnsNumber;

        for (var i = 0; i < columnsNumber; i++) {
            var column = new Array(oldMatrix[0].length);

            for (var j = 0; j < oldMatrix.length; j++) {
                var oldStart = j * oldPiece;
                var oldEnd = oldStart + oldPiece;
                var newStart = i * newPiece;
                var newEnd = newStart + newPiece;

                var overlap = (oldEnd <= newStart || newEnd <= oldStart) ?
                                0 :
                                Math.min(Math.max(oldEnd, newStart), Math.max(newEnd, oldStart)) -
                                Math.max(Math.min(oldEnd, newStart), Math.min(newEnd, oldStart));

                if (overlap > 0) {
                    for (var k = 0; k < oldMatrix[0].length; k++) {
                        if (column[k] == null) {
                            column[k] = 0;
                        }
                        column[k] += (overlap / newPiece) * oldMatrix[j][k];
                    }
                }
            }

            var intColumn = new Uint8Array(oldMatrix[0].length);

            for (var k = 0; k < oldMatrix[0].length; k++) {
                intColumn[k] = column[k];
            }

            newMatrix.push(intColumn);
        }

        return newMatrix;
    }

    async drawSpectrogram(buffer) {
        var pixelRatio = this.params.pixelRatio;
        var length = buffer.duration;
        var height = (this.params.fftSamples / 2) * pixelRatio;
        var frequenciesData = await this.getFrequencies(buffer);

        var pixels = await this.resample(frequenciesData);

        var heightFactor = pixelRatio;

        for (var i = 0; i < pixels.length; i++) {
            for (var j = 0; j < pixels[i].length; j++) {
                this.waveCc.fillStyle = this.getFrequencyRGB(pixels[i][j]);
                this.waveCc.fillRect(i, height - j * heightFactor, 1, heightFactor);
            }
        }
    }

    /* Renderer-specific methods */

    /**
     * Called after cursor related params have changed.
     *
     * @abstract
     */
    updateCursor() {}

    /**
     * Called when the size of the container changes so the renderer can adjust
     *
     * @abstract
     */
    updateSize() {}

    /**
     * Draw a waveform with bars
     *
     * @abstract
     * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays for split channel
     * rendering
     * @param {number} channelIndex The index of the current channel. Normally
     * should be 0
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that should be
     * rendered
     */
    drawBars(peaks, channelIndex, start, end) {}

    /**
     * Draw a waveform
     *
     * @abstract
     * @param {number[]|Number.<Array[]>} peaks Can also be an array of arrays for split channel
     * rendering
     * @param {number} channelIndex The index of the current channel. Normally
     * should be 0
     * @param {number} start The x-offset of the beginning of the area that
     * should be rendered
     * @param {number} end The x-offset of the end of the area that should be
     * rendered
     */
    drawWave(peaks, channelIndex, start, end) {}

    /**
     * Clear the waveform
     *
     * @abstract
     */
    clearWave() {}

    /**
     * Render the new progress
     *
     * @abstract
     * @param {number} position X-Offset of progress position in pixels
     */
    updateProgress(position) {}
}
