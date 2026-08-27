// Bumped by one on every modification pushed to the app. Formatted as
// V.X.X.X, where the 3 digits are the modification count zero-padded
// (e.g. the 11th modification is V.0.1.1).
export const MODIFICATION_COUNT = 6;

export const VERSION = `V.${String(MODIFICATION_COUNT).padStart(3, "0").split("").join(".")}`;
