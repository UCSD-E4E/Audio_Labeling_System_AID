/* eslint-env jasmine */

import { sharedErrorTests, sharedTests } from './mediaelement-shared';

/** @test {WaveSurfer} */
describe('WaveSurfer/MediaElementWebAudio:', () => {
  sharedTests('MediaElementWebAudio');
});

/** @test {WaveSurfer} */
describe('WaveSurfer/MediaElementWebAudio/errors:', () => {
  sharedErrorTests('MediaElementWebAudio');
});
