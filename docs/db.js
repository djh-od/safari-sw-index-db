
import { set, get, createStore } from './idb-keyval.js';

const key = 'foo';

export async function writeTestValue(value) {
  return set(key, value, store);
}

export async function getTestValue() {
  return get(key, store);
}


const store = createStore(
  'testing',
  'testing',
  1
);
