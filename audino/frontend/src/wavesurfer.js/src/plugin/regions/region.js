/**
 *  @since 4.0.0
 *
 * (Single) Region plugin class
 *
 * Must be turned into an observer before instantiating. This is done in
 * `RegionsPlugin` (main plugin class).
 *
 * @extends {Observer}
 */
export class Region {
    constructor(params, regionsUtils, ws) {
        this.wavesurfer = ws;
        this.wrapper = ws.drawer.wrapper;
        this.util = ws.util;
        this.style = this.util.style;
        this.regionsUtil = regionsUtils;
        // It assumes the minLength parameter value, or the regionsMinLength parameter value, if the first one not provided
        this.minLength = params.minLength;
        this.id = params.id == null ? ws.util.getId() : params.id;
        this.start = Number(params.start) || 0;
        this.top = Number(params.top) || 0;
        this.bot = Number(params.bot) || 0;
        this.end =
            params.end == null
                ? // small marker-like region
                this.start +
                (4 / this.wrapper.scrollWidth) * this.wavesurfer.getDuration()
                : Number(params.end);
        this.resize =
            params.resize === undefined ? true : Boolean(params.resize);
        this.drag = params.drag === undefined ? true : Boolean(params.drag);
        // reflect resize and drag state of region for region-updated listener
        this.isResizing = false;
        this.isDragging = false;
        this.loop = Boolean(params.loop);
        this.color = params.color || 'rgba(160, 40, 160, 0.4)';
        // The left and right handleStyle properties can be set to 'none' for
        // no styling or can be assigned an object containing CSS properties.
        this.handleStyle = params.handleStyle || {
            left: {},
            right: {},
            top: {},
            bot: {},
            topRight: {},
            topLeft: {},
            bottomRight: {},
            bottomLeft: {},
        };
        this.handleLeftEl = null;
        this.handleRightEl = null;
        this.handleTopE1 = null;
        this.handleBotE1 = null;
        this.handleTopRightE1 = null;
        this.handleTopLeftE1 = null;
        this.handleBottomRightE1 = null;
        this.handleBottomLeftE1 = null;
        this.data = params.data || {};
        this.attributes = params.attributes || {};

        this.maxLength = params.maxLength;

        this._onRedraw = () => this.updateRender();

        this.scroll = params.scroll !== false && ws.params.scrollParent;
        this.scrollSpeed = params.scrollSpeed || 1;
        this.scrollThreshold = params.scrollThreshold || 10;
        this.maxFrequency = params.maxFrequency || 24000;
        this.regionTopFrequency = null;
        this.regionBotFrequency = null;
        // Determines whether the context menu is prevented from being opened.
        this.preventContextMenu =
            params.preventContextMenu === undefined
                ? false
                : Boolean(params.preventContextMenu);

        // select channel ID to set region
        let channelIdx =
            params.channelIdx == null ? -1 : parseInt(params.channelIdx);
        this.regionHeight = '100%';
        this.maxHeight = 254;
        this.marginTop = '0px';

        if (channelIdx !== -1) {
            let channelCount =
                this.wavesurfer.backend.buffer != null
                    ? this.wavesurfer.backend.buffer.numberOfChannels
                    : -1;
            if (channelCount >= 0 && channelIdx < channelCount) {
                this.regionHeight = Math.floor((1 / channelCount) * 100) + '%';
                this.marginTop =
                    this.wavesurfer.getHeight() * channelIdx + 'px';
            }
        }

        this.formatTimeCallback = params.formatTimeCallback;
        this.edgeScrollWidth = params.edgeScrollWidth;
        this.bindInOut();
        this.render();
        this.wavesurfer.on('zoom', this._onRedraw);
        this.wavesurfer.on('redraw', this._onRedraw);
        this.wavesurfer.fireEvent('region-created', this);
        this.saved = false;
        this._onSave = () => this.save();
        this._onUnSave = () => this.unsave();
    }

    /* Update region params. */
    update(params) {
        console.log(params)
        if (params.start != null) {
            this.start = Number(params.start);
        }
        if (params.end != null) {
            this.end = Number(params.end);
        }
        if (params.top != null) {
            this.top = Number(params.top);
        }
        if (params.bot != null) {
            this.bot = Number(params.bot);
        }
        if (params.loop != null) {
            this.loop = Boolean(params.loop);
        }
        if (params.color != null) {
            this.color = params.color;
        }
        if (params.handleStyle != null) {
            this.handleStyle = params.handleStyle;
        }
        if (params.data != null) {
            this.data = params.data;
        }
        if (params.resize != null) {
            this.resize = Boolean(params.resize);
            this.updateHandlesResize(this.resize);
        }
        if (params.drag != null) {
            this.drag = Boolean(params.drag);
        }
        if (params.maxLength != null) {
            this.maxLength = Number(params.maxLength);
        }
        if (params.minLength != null) {
            this.minLength = Number(params.minLength);
        }
        if (params.attributes != null) {
            this.attributes = params.attributes;
        }
        if (params.color != null) {
            this.updateRender(params.color);
        } else {
            this.updateRender();
        }
        this.fireEvent('update');
        this.wavesurfer.fireEvent('region-updated', this);
    }

    /* set region as saved */
    save() {
        this.saved = true;
    }

    /* set region as unsaved */
    unsave() {
        this.saved = false;
    }

    /* Remove a single region. */
    remove() {
        if (this.element) {
            this.wrapper.removeChild(this.element);
            this.element = null;
            this.fireEvent('remove');
            this.wavesurfer.un('zoom', this._onRedraw);
            this.wavesurfer.un('redraw', this._onRedraw);
            this.wavesurfer.fireEvent('region-removed', this);
        }
    }

    /**
     * Play the audio region.
     * @param {number} start Optional offset to start playing at
     */
    play(start) {
        const s = start || this.start;
        this.wavesurfer.play(s, this.end);
        this.fireEvent('play');
        this.wavesurfer.fireEvent('region-play', this);
    }

    /**
     * Play the audio region in a loop.
     * @param {number} start Optional offset to start playing at
     * */
    playLoop(start) {
        this.loop = true;
        this.play(start);
    }

    /**
     * Set looping on/off.
     * @param {boolean} loop True if should play in loop
     */
    setLoop(loop) {
        this.loop = loop;
    }

    /* Render a region as a DOM element. */
    render(e) {
        const regionEl = document.createElement('region');

        regionEl.className = 'wavesurfer-region';
        regionEl.title = this.formatTime(this.start, this.end);
        regionEl.setAttribute('data-id', this.id);

        for (const attrname in this.attributes) {
            regionEl.setAttribute(
                'data-region-' + attrname,
                this.attributes[attrname]
            );
        }

        this.style(regionEl, {
            position: 'absolute',
            zIndex: 2,
            height: '20px',
            top: '0px'
        });

        /* Resize handles */
        if (this.resize) {
            this.handleLeftEl = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleRightEl = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleTopE1 = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleBotE1 = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleTopRightE1 = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleTopLeftE1 = regionEl.appendChild(
                document.createElement('handle')
            )
            this.handleBottomRightE1 = regionEl.appendChild(
                document.createElement('handle')
            );
            this.handleBottomLeftE1 = regionEl.appendChild(
                document.createElement('handle')
            )

            this.handleLeftEl.className = 'wavesurfer-handle wavesurfer-handle-start';
            this.handleRightEl.className = 'wavesurfer-handle wavesurfer-handle-end';
            this.handleTopE1.className = 'wavesurfer-handle wavesurfer-handle-top';
            this.handleBotE1.className = 'wavesurfer-handle wavesurfer-handle-bottom';
            this.handleTopRightE1.className = 'wavesurfer-handle wavesurfer-handle-top-right';
            this.handleTopLeftE1.className = 'wavesurfer-handle wavesurfer-handle-top-left';
            this.handleBottomRightE1.className = 'wavesurfer-handle wavesurfer-handle-bottom-right';
            this.handleBottomLeftE1.className = 'wavesurfer-handle wavesurfer-handle-bottom-left';


            // Default CSS properties for both handles.
            const css = {
                cursor: 'col-resize',
                position: 'absolute',
                top: '0px',
                width: '2px',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 1)'
            };

            const row_css = {
                cursor: 'row-resize',
                position: 'absolute',
                width: '100%',
                left: '0px',
                height: '2px',
                backgroundColor: 'rgba(0, 0, 0, 1)'
            };

            const corner_css = {
                cursor: 'row-resize',
                position: 'absolute',
                width: '4px',
                height: '4px',
                backgroundColor: 'rgba(0, 0, 0, 1)',
                zIndex: 2,
            }


            // Merge CSS properties per handle.
            const handleLeftCss =
                this.handleStyle.left !== 'none'
                    ? Object.assign({ left: '0px' }, css, this.handleStyle.left)
                    : null;
            const handleRightCss =
                this.handleStyle.right !== 'none'
                    ? Object.assign({ right: '0px' }, css, this.handleStyle.right)
                    : null;
            const handleTopCss =
                this.handleStyle.top !== 'none'
                    ? Object.assign({ top: '0px' }, row_css, this.handleStyle.top)
                    : null;
            const handleBotCss =
                this.handleStyle.bot !== 'none'
                    ? Object.assign({ bottom: '0px'}, row_css, this.handleStyle.bot)
                    : null;
            const handleTopRightCss =
                this.handleStyle.topRight !== 'none'
                    ? Object.assign({ top: '-1px', right: '-1px'}, corner_css, this.handleStyle.bot)
                    : null;
            const handleTopLeftCss =
                this.handleStyle.topLeft !== 'none'
                    ? Object.assign({ top: '-1px', left: '-1px'}, corner_css, this.handleStyle.bot)
                    : null;
            const handleBottomRightCss =
                this.handleStyle.bottomRight !== 'none'
                    ? Object.assign({ bottom: '-1px', right: '-1px'}, corner_css, this.handleStyle.bot)
                    : null;
            const handleBottomLeftCss =
                this.handleStyle.BottomLeft !== 'none'
                    ? Object.assign({ bottom: '-1px', left: '-1px'}, corner_css, this.handleStyle.bot)
                    : null;


            if (handleLeftCss) {
                this.style(this.handleLeftEl, handleLeftCss);
            }

            if (handleRightCss) {
                this.style(this.handleRightEl, handleRightCss);
            }
            if (handleTopCss) {
                this.style(this.handleTopE1, handleTopCss);
            }
            if (handleBotCss) {
                this.style(this.handleBotE1, handleBotCss);
            }
            if (handleTopRightCss) {
                this.style(this.handleTopRightE1, handleTopRightCss);
            }
            if (handleTopLeftCss) {
                this.style(this.handleTopLeftE1, handleTopLeftCss);
            }
            if (handleTopRightCss) {
                this.style(this.handleBottomRightE1, handleBottomRightCss);
            }
            if (handleTopLeftCss) {
                this.style(this.handleBottomLeftE1, handleBottomLeftCss);
            }
        }

        this.element = this.wrapper.appendChild(regionEl);
        this.updateRender();
        this.bindEvents(regionEl);
    }

    formatTime(start, end) {
        if (this.formatTimeCallback) {
            return this.formatTimeCallback(start, end);
        }
        return (start == end ? [start] : [start, end])
            .map((time) =>
                [
                    Math.floor((time % 3600) / 60), // minutes
                    ('00' + Math.floor(time % 60)).slice(-2) // seconds
                ].join(':')
            )
            .join('-');
    }

    getWidth() {
        return this.wavesurfer.drawer.width / this.wavesurfer.params.pixelRatio;
    }

    getHeight() {
        return this.wavesurfer.drawer.height / this.wavesurfer.params.pixelRatio;
    }

    /* Update element's position, width, color. */
    updateRender(color=this.color) {
        // duration varies during loading process, so don't overwrite important data
        const dur = this.wavesurfer.getDuration();
        const max_Height = this.maxHeight;
        const width = this.getWidth();
        const height = this.getHeight();

        let startLimited = this.start;
        let endLimited = this.end;
        if (startLimited < 0) {
            startLimited = 0;
            endLimited = endLimited - startLimited;
        }
        if (endLimited > dur) {
            endLimited = dur;
            startLimited = dur - (endLimited - startLimited);
        }

        if (this.minLength != null) {
            endLimited = Math.max(startLimited + this.minLength, endLimited);
        }

        if (this.maxLength != null) {
            endLimited = Math.min(startLimited + this.maxLength, endLimited);
        }

        if (this.element != null) {
            // Calculate the left and width values of the region such that
            // no gaps appear between regions.
            const left = Math.round((startLimited / dur) * width);
            const regionWidth = Math.round((endLimited / dur) * width) - left;
            const top = this.top;
            const bot = this.bot;
            const regionHeight =  max_Height  - top - bot;//this.wrapper.style.height - this.top - this.bt
            this.style(this.element, {
                left: left + 'px',
                width: regionWidth + 'px',
                top: top + 'px',
                height: (regionHeight) + 'px',
                backgroundColor: color,
                cursor: this.drag ? 'move' : 'default'
            });

            const pixelToFrequency = (this.maxFrequency/this.maxHeight)
            // frequency = 24000 - 24000/254x
            this.regionTopFrequency = this.maxFrequency - this.top * pixelToFrequency;
            this.regionBotFrequency = this.maxFrequency - (this.top + regionHeight) * pixelToFrequency;
            

            for (const attrname in this.attributes) {
                this.element.setAttribute(
                    'data-region-' + attrname,
                    this.attributes[attrname]
                );
            }

            this.element.title = this.formatTime(this.start, this.end);
        }
    }

    /* Bind audio events. */
    bindInOut() {
        this.firedIn = false;
        this.firedOut = false;

        const onProcess = (time) => {
            let start = this.start;//Math.round(this.start * 10) / 10;
            let end = this.end;//Math.round(this.end * 10) / 10;
            time = this.wavesurfer.getCurrentTime();// Math.round(time * 10) / 10;

            if (
                !this.firedOut &&
                this.firedIn &&
                (start > time || end < time)
            ) {
                this.firedOut = true;
                this.firedIn = false;
                this.fireEvent('out');
                this.wavesurfer.fireEvent('region-out', this);
            }
            if (!this.firedIn && start <= time && end > time) {
                this.firedIn = true;
                this.firedOut = false;
                this.fireEvent('in');
                this.wavesurfer.fireEvent('region-in', this);
            }
        };

        this.wavesurfer.backend.on('audioprocess', onProcess);

        this.on('remove', () => {
            this.wavesurfer.backend.un('audioprocess', onProcess);
        });

        /* Loop playback. */
        this.on('out', () => {
            if (this.loop) {
                const realTime = this.wavesurfer.getCurrentTime();
                if (realTime >= this.start && realTime <= this.end) {
                    this.wavesurfer.play(this.start);
                }
            }
        });
    }

    /* Bind DOM events. */
    bindEvents() {
        const preventContextMenu = this.preventContextMenu;

        this.element.addEventListener('mouseenter', (e) => {
            this.fireEvent('mouseenter', e);
            this.wavesurfer.fireEvent('region-mouseenter', this, e);
        });

        this.element.addEventListener('mouseleave', (e) => {
            this.fireEvent('mouseleave', e);
            this.wavesurfer.fireEvent('region-mouseleave', this, e);
        });

        this.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.fireEvent('click', e);
            this.wavesurfer.fireEvent('region-click', this, e);
        });

        this.element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.fireEvent('dblclick', e);
            this.wavesurfer.fireEvent('region-dblclick', this, e);
        });

        this.element.addEventListener('contextmenu', (e) => {
            if (preventContextMenu) {
                e.preventDefault();
            }
            this.fireEvent('contextmenu', e);
            this.wavesurfer.fireEvent('region-contextmenu', this, e);
        });

        /* Drag or resize on mousemove. */
        if (this.drag || this.resize) {
            this.bindDragEvents();
        }
    }

    bindDragEvents() {
        const container = this.wavesurfer.drawer.container;
        const scrollSpeed = this.scrollSpeed;
        const scrollThreshold = this.scrollThreshold;
        let startTime;
        let currTop;
        let touchId;
        let drag;
        let maxScroll;
        let resize;
        let updated = false;
        let scrollDirection;
        let wrapperRect;
        let regionLeftHalfTime;
        let regionRightHalfTime;
        let max_Height = this.maxHeight;

        // Scroll when the user is dragging within the threshold
        const edgeScroll = (e) => {
            //this.wavesurfer.fireEvent('region-change', this)
            const duration = this.wavesurfer.getDuration();

            if (!scrollDirection || (!drag && !resize)) {
                return;
            }

            const x = e.clientX;
            let distanceBetweenCursorAndWrapperEdge = 0;
            let regionHalfTimeWidth = 0;
            let adjustment = 0;

            // Get the currently selected time according to the mouse position
            let time = this.regionsUtil.getRegionSnapToGridValue(
                this.wavesurfer.drawer.handleEvent(e) * duration
            );
            
            let frequencyTop  = (Number(this.wrapper.style.top.replace("px", "")));

            let range = this.regionsUtil.getRegionSnapToGridValue( this.wavesurfer.drawer.handleEventVertical(e, false, max_Height) * max_Height);
            ////console.log("range : " + range)
            let frequencyBot = (this.handleBotE1.style.bottom);

            if (drag) {
                // Considering the point of contact with the region while edgescrolling
                ////console.log("hello")
                if (scrollDirection === -1) {
                    regionHalfTimeWidth = regionLeftHalfTime * this.wavesurfer.params.minPxPerSec;
                    distanceBetweenCursorAndWrapperEdge = x - wrapperRect.left;
                } else {
                    regionHalfTimeWidth = regionRightHalfTime * this.wavesurfer.params.minPxPerSec;
                    distanceBetweenCursorAndWrapperEdge = wrapperRect.right - x;
                }
            } else {
                // Considering minLength while edgescroll
                let minLength = this.minLength;
                if (!minLength) {
                    minLength = 0;
                }

                if (resize === 'start') {
                    if (time > this.end - minLength) {
                        time = this.end - minLength;
                        adjustment = scrollSpeed * scrollDirection;
                    }

                    if (time < 0) {
                        time = 0;
                    }
                } else if (resize === 'end') {
                    if (time < this.start + minLength) {
                        time = this.start + minLength;
                        adjustment = scrollSpeed * scrollDirection;
                    }

                    if (time > duration) {
                        time = duration;
                    }
                }
                else if (resize === 'top') {
                    if (range > max_Height - minLength) {
                        range = max_Height - minLength;
                        //adjustment = scrollSpeed * scrollDirection;
                    }

                    if (range < 0) {
                        range = 0;
                    }
                }

                else if (resize === 'end') {
                    if (range < this.top + minLength) {
                        range = this.top + minLength;
                        //adjustment = scrollSpeed * scrollDirection;
                    }

                    if (range > max_Height) {
                        range = max_Height;
                    }
                }
            }

            // Don't edgescroll if region has reached min or max limit
            if (scrollDirection === -1) {
                if (Math.round(this.wrapper.scrollLeft) === 0) {
                    return;
                }

                if (Math.round(this.wrapper.scrollLeft - regionHalfTimeWidth + distanceBetweenCursorAndWrapperEdge) <= 0) {
                    return;
                }
            } else {
                if (Math.round(this.wrapper.scrollLeft) === maxScroll) {
                    return;
                }

                if (Math.round(this.wrapper.scrollLeft + regionHalfTimeWidth - distanceBetweenCursorAndWrapperEdge) >= maxScroll) {
                    return;
                }
            }

            // Update scroll position
            let scrollLeft = this.wrapper.scrollLeft - adjustment + scrollSpeed * scrollDirection;

            if (scrollDirection === -1) {
                const calculatedLeft = Math.max(0 + regionHalfTimeWidth - distanceBetweenCursorAndWrapperEdge, scrollLeft);
                this.wrapper.scrollLeft = scrollLeft = calculatedLeft;
            } else {
                const calculatedRight = Math.min(maxScroll - regionHalfTimeWidth + distanceBetweenCursorAndWrapperEdge, scrollLeft);
                this.wrapper.scrollLeft = scrollLeft = calculatedRight;
            }

            const deltaX = range - currTop
            currTop = range;
            const deltaY = time - startTime;
            startTime = time;
            console.log("LOOK HERE")
            drag ? this.onDrag(deltaX, deltaY) : this.onResize(deltaX, deltaY, resize);
            


            // Repeat
            window.requestAnimationFrame(() => {
                edgeScroll(e);
            });
        };

        const onDown = (e) => {
            //this.wavesurfer.fireEvent('region-change', this)
            const duration = this.wavesurfer.getDuration();
            if (e.touches && e.touches.length > 1) {
                return;
            }
            touchId = e.targetTouches ? e.targetTouches[0].identifier : null;

            // stop the event propagation, if this region is resizable or draggable
            // and the event is therefore handled here.
            if (this.drag || this.resize) {
                e.stopPropagation();
            }

            // Store the selected startTime we begun dragging or resizing
            startTime = this.regionsUtil.getRegionSnapToGridValue(
                this.wavesurfer.drawer.handleEvent(e, true) * duration
            );
            currTop = this.regionsUtil.getRegionSnapToGridValue( this.wavesurfer.drawer.handleEventVertical(e, false, max_Height) * max_Height);
            // Store the selected point of contact when we begin dragging
            regionLeftHalfTime = startTime - this.start;
            regionRightHalfTime = this.end - startTime;

            // Store for scroll calculations
            maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
            wrapperRect = this.wrapper.getBoundingClientRect();

            this.isResizing = false;
            this.isDragging = false;
            if (e.target.tagName.toLowerCase() === 'handle') {
                this.isResizing = true;
                if (e.target.classList.contains('wavesurfer-handle-start')) {
                    resize = 'start'
                } else if (e.target.classList.contains('wavesurfer-handle-end')) {
                    resize = 'end'
                } else if (e.target.classList.contains('wavesurfer-handle-top')) {
                    resize = 'top'
                } else if (e.target.classList.contains('wavesurfer-handle-bottom')) {
                    resize = 'bottom'
                } 
                else if (e.target.classList.contains('wavesurfer-handle-top-right')) {
                    resize = 'top-right'
                }
                else if (e.target.classList.contains('wavesurfer-handle-top-left')) {
                    resize = 'top-left'
                }
                else if (e.target.classList.contains('wavesurfer-handle-bottom-right')) {
                    resize = 'bottom-right'
                }
                else if (e.target.classList.contains('wavesurfer-handle-bottom-left')) {
                    resize = 'bottom-left'
                }
            } else {
                this.isDragging = true;
                drag = true;
                resize = false;
            }
        };
        const onUp = (e) => {
            //this.wavesurfer.fireEvent('region-change', this)
            if (e.touches && e.touches.length > 1) {
                return;
            }

            if (drag || resize) {
                this.isDragging = false;
                this.isResizing = false;
                drag = false;
                scrollDirection = null;
                resize = false;
            }

            if (updated) {
                updated = false;
                this.util.preventClick();
                this.fireEvent('update-end', e);
                this.wavesurfer.fireEvent('region-update-end', this, e);
            }
        };
        const onMove = (e) => {
            //this.wavesurfer.fireEvent('region-change', this)
            const duration = this.wavesurfer.getDuration();

            if (e.touches && e.touches.length > 1) {
                return;
            }
            if (e.targetTouches && e.targetTouches[0].identifier != touchId) {
                return;
            }
            if (!drag && !resize) {
                return;
            }

            const oldTime = startTime;
            let time = this.regionsUtil.getRegionSnapToGridValue(
                this.wavesurfer.drawer.handleEvent(e) * duration
            );
            //console.log("time: " +time )


            if (drag) {
                // To maintain relative cursor start point while dragging
                const maxEnd = this.wavesurfer.getDuration();
                if (time > maxEnd - regionRightHalfTime) {
                    time = maxEnd - regionRightHalfTime;
                }

                if (time - regionLeftHalfTime < 0) {
                    time = regionLeftHalfTime;
                }
            }

            let range = this.regionsUtil.getRegionSnapToGridValue( this.wavesurfer.drawer.handleEventVertical(e, false, max_Height) * max_Height);

            if (resize) {
                // To maintain relative cursor start point while resizing
                // we have to handle for minLength
                let minLength = this.minLength;
                if (!minLength) {
                    minLength = 0;
                }

                const topPosHandling = (range, minLength) => {
                    if (range > max_Height - minLength) {
                        range = max_Height - minLength;
                    }

                    if (range < 0) {
                        range = 0;
                    }
                    return range;
                }

                const RightPosHandling = (time, minLength) => {
                    if (time < this.start + minLength) {
                        time = this.start + minLength;
                    }

                    if (time > duration) {
                        time = duration;
                    }
                    return time;
                }

                const LeftPosHandling = (time, minLength) => {
                    if (time > this.end - minLength) {
                        time = this.end - minLength;
                    }

                    if (time < 0) {
                        time = 0;
                    }
                    return time
                }

                const BottomPosHandling = (range, minLength) => {
                    if (range < this.top + minLength) {
                        range = this.top + minLength;
                    }

                    if (range > max_Height) {
                        range = max_Height;
                    }
                    return range
                }

                if (resize === 'start') {
                    time = LeftPosHandling(time, minLength)
                } else if (resize === 'top') {
                    range = topPosHandling(range, minLength)
                } else if (resize === 'end') {
                    time = RightPosHandling(time, minLength)
                } else if (resize === 'bottom') {
                    range = BottomPosHandling(range, minLength)
                }
                else if (resize === 'top-right') {
                    range = topPosHandling(range, minLength)
                    time = RightPosHandling(time, minLength)
                }
                else if (resize === 'top-left') {
                    console.log("hello 1")
                    range = topPosHandling(range, minLength)
                    time = LeftPosHandling(time, minLength)
                }
                else if (resize === 'bottom-right') {
                    range = BottomPosHandling(range, minLength)
                    time = RightPosHandling(time, minLength)
                }
                else if (resize === 'bottom-left') {
                    console.log("hello 1")
                    range = BottomPosHandling(range, minLength)
                    time = LeftPosHandling(time, minLength)
                }
            }

            let deltaX = time - startTime;
            startTime = time;
            let deltaY = range - currTop
            currTop = range
            // Drag
            if (this.drag && drag) {
                updated = updated || !!deltaX || !! deltaY;
                
                this.onDrag(deltaX, deltaY);
            }

            // Resize
            if (this.resize && resize) {
                updated = updated || !!deltaX || !! deltaY;
                this.onResize(deltaX, deltaY, resize);
            }

            if (
                this.scroll &&
                container.clientWidth < this.wrapper.scrollWidth
            ) {
                // Triggering edgescroll from within edgeScrollWidth
                if (drag) {
                    let x = e.clientX;

                    // Check direction
                    if (x < wrapperRect.left + this.edgeScrollWidth) {
                        scrollDirection = -1;
                    } else if (x > wrapperRect.right - this.edgeScrollWidth) {
                        scrollDirection = 1;
                    } else {
                        scrollDirection = null;
                    }
                } else {
                    let x = e.clientX;

                    // Check direction
                    if (x < wrapperRect.left + this.edgeScrollWidth) {
                        scrollDirection = -1;
                    } else if (x > wrapperRect.right - this.edgeScrollWidth) {
                        scrollDirection = 1;
                    } else {
                        scrollDirection = null;
                    }
                }

                if (scrollDirection) {
                    edgeScroll(e);
                }
            }
        };

        this.element.addEventListener('mousedown', onDown);
        this.element.addEventListener('touchstart', onDown);

        document.body.addEventListener('mousemove', onMove);
        document.body.addEventListener('touchmove', onMove);

        document.body.addEventListener('mouseup', onUp);
        document.body.addEventListener('touchend', onUp);

        this.on('remove', () => {
            document.body.removeEventListener('mouseup', onUp);
            document.body.removeEventListener('touchend', onUp);
            document.body.removeEventListener('mousemove', onMove);
            document.body.removeEventListener('touchmove', onMove);
        });

        this.wavesurfer.on('destroy', () => {
            document.body.removeEventListener('mouseup', onUp);
            document.body.removeEventListener('touchend', onUp);
        });
    }

    //TODO: Add drag feature here
    onDrag(deltax, deltay) {
        let max_Height = this.maxHeight
        const maxEnd = this.wavesurfer.getDuration();
        if (this.end + deltax > maxEnd) {
            deltax = maxEnd - this.end;
        }

        if (this.start + deltax < 0) {
            deltax = this.start * -1;
        }

        if ( max_Height - this.bot + deltay > max_Height) {
            deltay = 0;
        }

        if (this.top + deltay < 0) {
            deltay = 0;
        }
        const bottom = max_Height - this.bot;
        this.update({
            start: this.start + deltax,
            end: this.end + deltax,
            top: this.top + deltay,
            bot: this.bot - deltay 
        });
    }

    /**
     * @example
     * onResize(-5, 'start') // Moves the start point 5 seconds back
     * onResize(0.5, 'end') // Moves the end point 0.5 seconds forward
     *
     * @param {number} delta How much to add or subtract, given in seconds
     * @param {string} direction 'start 'or 'end'
     */
    onResize(deltaX, deltaY, direction) {
        //console.log("THE CODE IS RUNNING HERE: " + direction + " " + delta)
        const duration = this.wavesurfer.getDuration();
        const maxFrequency = this.maxFrequency;
        const max_Height = this.maxHeight;
        const bottom = max_Height - this.bot;

        //delta handling code
        const topChange = (deltaY) => {
            //deltaY /= 2;
            // Check if changing the start by the given delta would result in the region being smaller than minLength
            // Ignore cases where we are making the region wider rather than shrinking it
            if (deltaY > 0 && bottom - (this.top + deltaY) < this.minLength) {
                deltaY = bottom  - this.minLength - this.top;
                //console.log("THIS WAY")
            }

            if (deltaY < 0 && (this.top + deltaY) < 0) {
                deltaY = this.top * -1;
            }
            console.log("altered delta: " + deltaY)
            //console.log("old top: " +this.top)
            return deltaY;
            
            //console.log("new top: " + this.top)
        }

        const endChange = (deltaX) => {
            console.log("called end")
            // Check if changing the end by the given delta would result in the region being smaller than minLength
            // Ignore cases where we are making the region wider rather than shrinking it
            if (deltaX < 0 && this.end + deltaX - this.start < this.minLength) {
                deltaX = this.start + this.minLength - this.end;
            }
            
            if (deltaX > 0 && (this.end + deltaX) > duration) {
                deltaX = duration - this.end;
            }
            console.log("hello 5 ")
            return deltaX;
        }

        const startChange = (deltaX) => {
            console.log("called start")
            // Check if changing the start by the given delta would result in the region being smaller than minLength
            // Ignore cases where we are making the region wider rather than shrinking it
            if (deltaX > 0 && this.end - (this.start + deltaX) < this.minLength) {
                deltaX = this.end - this.minLength - this.start;
            }

            if (deltaX < 0 && (this.start + deltaX) < 0) {
                deltaX = this.start * -1;
            }
            return deltaX;
        }

        const bottomChange = (deltaY) => {
             //deltaY /= 2;
            // Check if changing the end by the given delta would result in the region being smaller than minLength
            // Ignore cases where we are making the region wider rather than shrinking it
            if (deltaY < 0 && bottom + deltaY - this.top < this.minLength) {
                deltaY = this.top + this.minLength - bottom;
            }

            if (deltaY > 0 && (bottom + deltaY) > max_Height) {
                deltaY = max_Height - bottom;
            }
            return deltaY;
        }



        // set changes with delta
        if (direction === 'start') {
            deltaX = startChange(deltaX)
            this.update({
                start: Math.min(this.start + deltaX, this.end),
                end: Math.max(this.start + deltaX, this.end)
            });
        } 
        else if (direction === 'end') {
            deltaX  = endChange(deltaX)
            this.update({
                start: Math.min(this.end + deltaX, this.start),
                end: Math.max(this.end + deltaX, this.start)
            });
        }

        else if (direction === 'top') {
            deltaY = topChange(deltaY)
            this.update({
                top: Math.min(this.top + deltaY, bottom),
                bot: max_Height - Math.max(this.top + deltaY, bottom)
            });
        } 

        else if (direction === 'bottom') {
            deltaY = bottomChange(deltaY)

            this.update({
                top: Math.min(bottom + deltaY, this.top),
                bot: max_Height - Math.max(bottom + deltaY, this.top)
            });
        }

        else if (direction === 'top-right') {
            deltaX  = endChange(deltaX)
            deltaY = topChange(deltaY)
            this.update({
                start: Math.min(this.end + deltaX, this.start),
                end: Math.max(this.end + deltaX, this.start),
                top: Math.min(this.top + deltaY, bottom),
                bot: max_Height - Math.max(this.top + deltaY, bottom),
            });
        } else if (direction === 'top-left') {
            console.log("hello 2")
            deltaX  = startChange(deltaX)
            deltaY = topChange(deltaY)
            this.update({
                start: Math.min(this.start + deltaX, this.end),
                end: Math.max(this.start + deltaX, this.end),
                top: Math.min(this.top + deltaY, bottom),
                bot: max_Height - Math.max(this.top + deltaY, bottom),
            });
        }
        else if (direction === 'bottom-right') {
            deltaX  = endChange(deltaX)
            deltaY = topChange(deltaY)
            this.update({
                start: Math.min(this.end + deltaX, this.start),
                end: Math.max(this.end + deltaX, this.start),
                top: Math.min(bottom + deltaY, this.top),
                bot: max_Height - Math.max(bottom + deltaY, this.top)
            });
        } else if (direction === 'bottom-left') {
            console.log("hello 2")
            deltaX  = startChange(deltaX)
            deltaY = topChange(deltaY)
            this.update({
                start: Math.min(this.start + deltaX, this.end),
                end: Math.max(this.start + deltaX, this.end),
                top: Math.min(bottom + deltaY, this.top),
                bot: max_Height - Math.max(bottom + deltaY, this.top)
            });
        }
    }

    updateHandlesResize(resize) {
        const cursorStyle = resize ? 'col-resize' : 'auto';
        const cursorStyle_row = resize ? 'row-resize' : 'auto';

        this.handleLeftEl && this.style(this.handleLeftEl, { cursor: cursorStyle });
        this.handleRightEl && this.style(this.handleRightEl, { cursor: cursorStyle });
        this.handleBotE1 && this.style(this.handleBotE1, { cursor: cursorStyle_row });
        this.handleTopE1 && this.style(this.handleTopE1, { cursor: cursorStyle_row });
    }
}