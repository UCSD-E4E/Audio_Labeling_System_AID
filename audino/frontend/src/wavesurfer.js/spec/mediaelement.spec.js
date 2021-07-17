/* eslint-env jasmine */

import { sharedErrorTests, sharedTests } from './mediaelement-shared';

/** @test {WaveSurfer} */
describe('WaveSurfer/MediaElement:', () => {
  sharedTests('MediaElement');
});

/** @test {WaveSurfer} */
describe('WaveSurfer/MediaElement/errors:', () => {
  sharedErrorTests('MediaElement');
});
