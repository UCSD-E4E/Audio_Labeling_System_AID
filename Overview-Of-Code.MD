## High Level Overview of the Code

The labeling system implements [Audino](https://github.com/midas-research/audino) as well as [Wavesufer.js](https://github.com/katspaugh/wavesurfer.js) to render and manage the site. A large degree of these libaraies have been modified to get the project to work. 

**NOTE** If you ever have a bug or trying to fix something. A good place to double check is with these repos incase they have updated to make the code you are working with better. 

## Logging into Pyrenote

Pyrenote uses redis in order to protect our backend endpoints. Users become authenticated when they log into the site. The only unprotected endpoint is the ability to create your own user when you sign up for an account on your own. 

**NOTE** if you ever get a 401 error when working with ethier the backend or a route, the request is coming from a non authenticated users and your route requires authentication. 

## How Wavesurfer functions

Wavesurfer is a libarry that does 3 main functions for us
- Displays spectrogram
- Displays regions
- Manages playing audio and data

The spectrogram and regions are pulgins which are overlayed onto a canvas where wavesurfer manages playing the audio. Wavesurfer creates these canvases via mutliCanvasDrawer.js in the wavesurfer folder. These drawers automatically create the html elements for us which is why we only create on the react native side a div for the elements to go in. 

**NOTE** if you ever need to change the elements such as the spectrogram, check what the drawers are doing.

The spectrogram plugin starts rendering when the wavesurfer object is created. When the spectraogram runs, it uses mutlicanvas drawer to create a js canvas to write the data to. The wavesurfer uses the backend to get the audio file and it's metadata and uses math to create a series of pixel values (located in any function which talks about frequency and fft.js). From here the drawSpectrogram writes this data to the canvas.

**Wavesurfer.js should only be changed if you need to edit the spectrogram or canvas rendering directly** Most of the time, work will be needed changing the code on annotate.js in pages. Here we can edit the post requests that enable the user to make labels and change the layout of about everything else besides the stuff wavesurfer renders for us. 

## Admin Portal
The admin portal allows admins (currently) to create new users, projects, and labels. From here you can download the current labels of a project (recommended to do freqently to ensure that the code does not in any circumstances ruin the position of the labels). 

**NOTE** the admin portal is terrible and needs to be reworked in the future.
