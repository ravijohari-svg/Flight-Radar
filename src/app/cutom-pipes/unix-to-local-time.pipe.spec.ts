import { UnixToLocalTimePipe } from './unix-to-local-time.pipe';

describe('UnixToLocalTimePipe', () => {
  it('create an instance', () => {
    const pipe = new UnixToLocalTimePipe();
    expect(pipe).toBeTruthy();
  });
});
