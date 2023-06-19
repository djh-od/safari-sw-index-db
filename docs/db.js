
import { set, get } from './idb-keyval.js';

const key = 'foo';

export async function writeTestValue(value) {
  return set(key, value);
}

export async function getTestValue() {
  return get(key);
}
