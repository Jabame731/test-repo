import { CapitalizeAndRemoveUnderscorePipe } from './capitalize-and-remove-underscore.pipe';

describe('CapitalizeAndRemoveUnderscorePipe', () => {
  it('create an instance', () => {
    const pipe = new CapitalizeAndRemoveUnderscorePipe();
    expect(pipe).toBeTruthy();
  });
});
