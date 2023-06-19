/**
 *
 * Copyright 2016, Jake Archibald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Store {
  constructor(dbName = 'keyval-store', storeName = 'keyval', version = 1, onUpgrade) {
      this.storeName = storeName;
      this._dbp = new Promise((resolve, reject) => {
          const openreq = indexedDB.open(dbName, version);
          openreq.onerror = () => reject(openreq.error);
          openreq.onsuccess = () => resolve(openreq.result);
          openreq.onupgradeneeded = (ev) => {
              // Get or create the object store
              let objStore;
              if (openreq.result.objectStoreNames.contains(storeName)) {
                  objStore = openreq.transaction.objectStore(storeName);
              } else {
                  objStore = openreq.result.createObjectStore(storeName);
              }

              if (onUpgrade) {
                  onUpgrade(objStore, ev.oldVersion);
              }
          };
      });
  }
  _withIDBStore(type, callback) {
      return this._dbp.then(db => new Promise((resolve, reject) => {
          const transaction = db.transaction(this.storeName, type);
          transaction.oncomplete = (res) => resolve(res);
          transaction.onabort = transaction.onerror = () => reject(transaction.error);
          callback(transaction.objectStore(this.storeName));
      }));
  }
}
let store;
function getDefaultStore() {
  if (!store)
      store = new Store();
  return store;
}
class IDBKeyVal {
  static get(key, store = getDefaultStore()) {
      let req;
      return store._withIDBStore('readonly', store => {
          req = store.get(key);
      }).then(() => req.result);
  }
  static set(key, value, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.put(value, key);
      });
  }
  static del(key, store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.delete(key);
      });
  }
  static clear(store = getDefaultStore()) {
      return store._withIDBStore('readwrite', store => {
          store.clear();
      });
  }
  static keys(store = getDefaultStore()) {
      const keys = [];
      return store._withIDBStore('readonly', store => {
          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // And openKeyCursor isn't supported by Safari.
          (store.openKeyCursor || store.openCursor).call(store).onsuccess = function () {
              if (!this.result)
                  return;
              keys.push(this.result.key);
              this.result.continue();
          };
      }).then(() => keys);
  }
  static getAllByIndex(indexName, value, store = getDefaultStore()) {
      let recordArr = [];
      return store._withIDBStore('readonly', store => {
          let index = store.index(indexName);
          let range = IDBKeyRange.only(value)
          // TODO: This is a mix of Promised and API indexeddb. It's ugly and shameful
          // but Promised didn't seem to work like the Google example. Fix this to
          // make it all Promised
          return index.openCursor(range).onsuccess = function (event) {
              let cursor = event.target.result;
              if (cursor) {
                  recordArr.push({
                      key: cursor.primaryKey,
                      value: cursor.value
                  });
                  cursor.continue();
              } else {
                  return this.transaction.oncomplete(recordArr);
              }
          };
      });
  }

  static getAllKeysByIndex(indexName, value, store = getDefaultStore()) {
      let keys = [];
      return store._withIDBStore('readonly', store => {
          let index = store.index(indexName);
          let range = IDBKeyRange.only(value)
          return index.openCursor(range).onsuccess = function (event) {
              let cursor = event.target.result;
              if (cursor) {
                  keys.push(cursor.primaryKey);
                  cursor.continue();
              } else {
                  return this.transaction.oncomplete(keys);
              }
          };
      });
  }
}


export { Store, IDBKeyVal };
