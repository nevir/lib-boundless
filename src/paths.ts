import * as fs from 'fs';

const KNOWN_INSTALL_LOCATIONS = [
  `${process.env.HOME}/Library/Application Support/Steam/steamapps/common/Boundless`,
];

/**
 * Determines where Boundless is installed.
 */
export function findInstallation() {
  // We could be a lot smarter here (check windows registry for steam location,
  // etc).
  for (const knownLocation of KNOWN_INSTALL_LOCATIONS) {
    try {
      if (fs.statSync(knownLocation).isDirectory()) {
        return knownLocation;
      }
    } catch (_error) {
      continue;
    }
  }
  throw new Error(`Unable to find a Boundless installation`);
}
