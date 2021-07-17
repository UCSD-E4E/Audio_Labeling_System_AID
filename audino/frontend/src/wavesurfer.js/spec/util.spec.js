/* eslint-env jasmine */

import WaveSurfer from '../src/wavesurfer.js';

import TestHelpers from './test-helpers.js';

/** @test {util.fetchFile} */
describe('util.fetchFile:', () => {
  const audioExampleUrl = TestHelpers.EXAMPLE_FILE_PATH;

  it('load ArrayBuffer response', done => {
    const options = {
      url: audioExampleUrl,
      responseType: 'arraybuffer'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('success', data => {
      expect(instance.response.status).toEqual(200);
      expect(instance.response.headers.get('content-type')).toEqual('audio/wav');

      // options
      expect(instance.fetchRequest.url).toEndWith(options.url);
      expect(instance.fetchRequest.cache).toEqual('default');
      expect(instance.fetchRequest.method).toEqual('GET');
      expect(instance.fetchRequest.mode).toEqual('cors');

      // returned data is an arraybuffer
      expect(data).toEqual(jasmine.any(ArrayBuffer));

      done();
    });
  });

  it('load Blob response', done => {
    const options = {
      url: audioExampleUrl,
      responseType: 'blob'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('success', data => {
      expect(instance.response.status).toEqual(200);
      expect(instance.response.headers.get('content-type')).toEqual('audio/wav');

      // returned data is a Blob
      expect(data).toEqual(jasmine.any(Blob));

      done();
    });
  });

  it('load JSON response', done => {
    const options = {
      url: '/base/spec/support/test.json',
      responseType: 'json'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('success', data => {
      expect(instance.response.status).toEqual(200);
      expect(instance.response.headers.get('content-type')).toEqual('application/json');

      // returned data is an array
      expect(data).toEqual([[0, 1, 2, 3]]);

      done();
    });
  });

  it('load text response', done => {
    const options = {
      url: '/base/spec/support/test.txt',
      responseType: 'text'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('success', data => {
      expect(instance.response.status).toEqual(200);
      expect(instance.response.headers.get('content-type')).toEqual('text/plain');

      // returned data is a string
      expect(data).toEqual('hello world');

      done();
    });
  });

  it('load unknown response type', done => {
    const options = {
      url: audioExampleUrl,
      responseType: 'fooBar'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('error', error => {
      expect(error).toEqual(new Error(`Unknown responseType: ${options.responseType}`));

      done();
    });
  });

  it('throws error when URL contains credentials', () => {
    const options = {
      url: 'http://user:password@example.com'
    };
    try {
      WaveSurfer.util.fetchFile(options);
    } catch (err) {
      expect(err).toEqual(jasmine.any(TypeError));
    }
  });

  it('throws error when URL is missing', () => {
    try {
      WaveSurfer.util.fetchFile({});
    } catch (err) {
      expect(err).toEqual(new Error('fetch url missing'));
    }
  });

  it('throws error when options are missing', () => {
    try {
      WaveSurfer.util.fetchFile();
    } catch (err) {
      expect(err).toEqual(new Error('fetch options missing'));
    }
  });

  it('fires error event when the file is not found', done => {
    const options = {
      url: '/foo/bar'
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('error', error => {
      expect(instance.response.status).toEqual(404);
      expect(error).toEqual(new Error('HTTP error status: 404'));

      done();
    });
  });

  it('accepts custom request headers', done => {
    const options = {
      url: '/base/spec/support/test.txt',
      responseType: 'text',
      requestHeaders: [
        {
          key: 'Content-Type',
          value: 'text/plain'
        }
      ]
    };
    const instance = WaveSurfer.util.fetchFile(options);
    instance.once('success', () => {
      expect(instance.response.headers.has('Content-Type')).toBeTrue();
      expect(instance.response.headers.get('Content-Type')).toEqual('text/plain');

      done();
    });
  });
});

/** @test {util} */
describe('util:', () => {
  /** @test {getId} */
  it('getId returns a random string with a default prefix', () => {
    const prefix = 'wavesurfer_';
    expect(WaveSurfer.util.getId()).toStartWith(prefix);
  });

  /** @test {getId} */
  it('getId returns a random string with a custom prefix', () => {
    const prefix = 'test-';
    expect(WaveSurfer.util.getId(prefix)).toStartWith(prefix);
  });

  /** @test {min} */
  it('min returns the smallest number in the provided array', () => {
    expect(WaveSurfer.util.min([0, 1, 1.1, 100, -1])).toEqual(-1);
  });

  /** @test {min} */
  it('min returns +Infinity for an empty array', () => {
    expect(WaveSurfer.util.min([])).toEqual(+Infinity);
  });

  /** @test {max} */
  it('max returns the largest number in the provided array', () => {
    expect(WaveSurfer.util.max([0, 1, 1.1, 100, -1])).toEqual(100);
  });

  /** @test {max} */
  it('max returns -Infinity for an empty array', () => {
    expect(WaveSurfer.util.max([])).toEqual(-Infinity);
  });

  /** @test {absMax} */
  it('absMax returns largest absolute number in the provided array when largest is positive', () => {
    expect(WaveSurfer.util.absMax([0, 1, 1.1, 100, -1])).toEqual(100);
  });

  /** @test {absMax} */
  it('absMax returns largest absolute number in the provided array when largest is negative', () => {
    expect(WaveSurfer.util.absMax([0, 1, -101, 1.1, 100, -1])).toEqual(101);
  });

  /** @test {absMax} */
  it('absMax returns -Infinity for an empty array', () => {
    expect(WaveSurfer.util.absMax([])).toEqual(-Infinity);
  });

  /** @test {style} */
  it('style applies a map of styles to an element', () => {
    const el = {
      style: {}
    };
    const styles = {
      backgroundcolor: 'red',
      'background-color': 'blue'
    };
    const result = {
      style: styles
    };
    expect(WaveSurfer.util.style(el, styles)).toEqual(result);
  });
});

/** @test {util.clamp} */
describe('util.clamp:', () => {
  const min = 0;
  const max = 2;

  /** @test {clamp/min} */
  it('clamp should return min if val is less than min', () => {
    const val = min - 1;
    expect(WaveSurfer.util.clamp(val, min, max)).toBe(min);
  });

  /** @test {clamp/val} */
  it('clamp should return val if val is more than min and less than max', () => {
    const val = 1;
    expect(WaveSurfer.util.clamp(val, min, max)).toBe(val);
  });

  /** @test {clamp/max} */
  it('clamp should return max if val is more than max', () => {
    const val = max + 1;
    expect(WaveSurfer.util.clamp(val, min, max)).toBe(max);
  });
});
