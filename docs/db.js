
import { IDBKeyVal, Store } from './idb-keyval.js';

const key = 'foo';

export async function writeTestValue(value) {
  return IDBKeyVal.set(key, value, store);
}

export async function getTestValue() {
  return IDBKeyVal.get(key, store);
}


const store = new Store(
  'testing',
  'testing',
  1
);
