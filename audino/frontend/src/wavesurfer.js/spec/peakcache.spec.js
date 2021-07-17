/* eslint-env jasmine */
import PeakCache from '../src/peakcache';

describe('PeakCache:', () => {
  let peakcache;
  const test_length = 200;
  const test_length2 = 300;
  const test_start = 50;
  const test_end = 100;
  const test_start2 = 100;
  const test_end2 = 120;
  const test_start3 = 120;
  const test_end3 = 150;

  const window_size = 20;

  function __createPeakCache() {
    peakcache = new PeakCache();
  }

  beforeEach(done => {
    __createPeakCache();
    done();
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  it('empty cache returns full range', () => {
    const newranges = peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_start);
    expect(newranges[0][1]).toEqual(test_end);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  it('different length clears cache', () => {
    peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    const newranges = peakcache.addRangeToPeakCache(test_length2, test_start, test_end);
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_start);
    expect(newranges[0][1]).toEqual(test_end);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  it('consecutive calls return no ranges', () => {
    peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    const newranges = peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    expect(newranges.length).toEqual(0);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  it('sliding window returns window sized range', () => {
    let newranges = peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_start);
    expect(newranges[0][1]).toEqual(test_end);
    newranges = peakcache.addRangeToPeakCache(
      test_length,
      test_start + window_size,
      test_end + window_size
    );
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_end);
    expect(newranges[0][1]).toEqual(test_end + window_size);
    newranges = peakcache.addRangeToPeakCache(
      test_length,
      test_start + window_size * 2,
      test_end + window_size * 2
    );
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_end + window_size);
    expect(newranges[0][1]).toEqual(test_end + window_size * 2);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  /** @test {PeakCache#getCacheRanges} */
  it('disjoint set creates two ranges', () => {
    peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    peakcache.addRangeToPeakCache(test_length, test_start3, test_end3);
    const ranges = peakcache.getCacheRanges();
    expect(ranges.length).toEqual(2);
    expect(ranges[0][0]).toEqual(test_start);
    expect(ranges[0][1]).toEqual(test_end);
    expect(ranges[1][0]).toEqual(test_start3);
    expect(ranges[1][1]).toEqual(test_end3);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  /** @test {PeakCache#getCacheRanges} */
  it('filling in disjoint sets coalesces', () => {
    peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    peakcache.addRangeToPeakCache(test_length, test_start3, test_end3);
    const newranges = peakcache.addRangeToPeakCache(test_length, test_start, test_end3);
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_end);
    expect(newranges[0][1]).toEqual(test_start3);
    const ranges = peakcache.getCacheRanges();
    expect(ranges.length).toEqual(1);
    expect(ranges[0][0]).toEqual(test_start);
    expect(ranges[0][1]).toEqual(test_end3);
  });

  /** @test {PeakCache#addRangeToPeakCache} */
  /** @test {PeakCache#getCacheRanges} */
  it('filling in disjoint sets coalesces / edge cases', () => {
    peakcache.addRangeToPeakCache(test_length, test_start, test_end);
    peakcache.addRangeToPeakCache(test_length, test_start3, test_end3);
    const newranges = peakcache.addRangeToPeakCache(test_length, test_start2, test_end2);
    expect(newranges.length).toEqual(1);
    expect(newranges[0][0]).toEqual(test_end);
    expect(newranges[0][1]).toEqual(test_start3);
    const ranges = peakcache.getCacheRanges();
    expect(ranges.length).toEqual(1);
    expect(ranges[0][0]).toEqual(test_start);
    expect(ranges[0][1]).toEqual(test_end3);
  });
});
