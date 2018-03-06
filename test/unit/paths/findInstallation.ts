import { paths } from '../../../src';

describe(`paths.findInstallation`, () => {
  it(`resolves to a path`, () => {
    expect(paths.findInstallation()).toMatch(/boundless/i);
    throw new Error('nope');
  });
});
