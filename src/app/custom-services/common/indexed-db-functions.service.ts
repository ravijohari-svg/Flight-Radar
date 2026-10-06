import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBFunctionsService {
  private DBName: string = 'SkyeUTM';
  private DBversion: number = 2;
  private indexedDB: IDBDatabase | null = null;

  constructor() {}

  openIndexedDBConnection(): void {
    if (window.indexedDB) {
      const db = window.indexedDB as IDBFactory;
      const request = db.open(this.DBName, this.DBversion) as IDBOpenDBRequest;

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as any).result as IDBDatabase;
        if (!db.objectStoreNames.contains('MapLayerDB')) {
          db.createObjectStore('MapLayerDB', {
            keyPath: 'MapLayerName',
          });
        }
      };
      request.onsuccess = (event: Event) => {
        this.indexedDB = (event.target as any).result as IDBDatabase;
        console.log('success!');
      };
      request.onerror = (event: Event) => {
        console.warn('error in the indexedDB');
        console.warn((event.target as any).error);
      };
    } else {
      console.log('indexedDB not Supported in the browser');
    }
  }

  deleteIndexedDB(): void {
    if (
      this.indexedDB &&
      this.indexedDB.objectStoreNames.contains('MapLayerDB')
    ) {
      this.indexedDB.deleteObjectStore('MapLayerDB');
      const db = window.indexedDB as IDBFactory;
      db.deleteDatabase(this.DBName);
    }
  }

  addDataToIndexedDB(data: any): Promise<any> {
    // console.log('addDataToIndexedDB', data);

    return new Promise((resolve, reject) => {
      if (
        this.indexedDB &&
        this.indexedDB.objectStoreNames.contains('MapLayerDB')
      ) {
        const tx = this.makeTX('MapLayerDB', 'readwrite');
        tx.oncomplete = (event: Event) => {
          // console.log(event);
        };
        let store = tx.objectStore('MapLayerDB');
        const request = store.put(data);
        request.onsuccess = (ev) => {
          // console.log('ADDED INTO INDEXED DB', ev);
          const data = (ev.target as any).result;
          // console.log(data);
          resolve(data);
        };
        request.onerror = (event) => {
          const error = (event.target as any).error;
          // console.warn('Error in request to add', error);
          reject(error);
        };
      } else {
        console.log('IndexedDB not initialized or object store not found.');
        // reject(null);
      }
    });
  }

  makeTX(storeName, mode) {
    let tx = this.indexedDB.transaction(storeName, mode);
    tx.onerror = (err) => {
      console.log(err);
    };
    return tx;
  }

  getAllDataFromIndexedDB(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (
        this.indexedDB &&
        this.indexedDB.objectStoreNames.contains('MapLayerDB')
      ) {
        const tx = this.makeTX('MapLayerDB', 'readonly');
        tx.oncomplete = (ev) => {
          // console.log('DONE');
          // console.log(ev);
        };
        const objectStore = tx.objectStore('MapLayerDB');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
          const data = (event.target as any).result;
          // console.log(data);
          resolve(data);
        };

        request.onerror = (event) => {
          const error = (event.target as any).error;
          // console.error('Error reading data from object store:', event);
          reject(error);
        };
      } else {
        console.log('IndexedDB not initialized or object store not found.');
        reject(null);
      }
    });
  }

  getItemFromIndexedDB(MapLayerName: any): Promise<any> {
    // console.log(MapLayerName);

    return new Promise((resolve, reject) => {
      if (
        this.indexedDB &&
        this.indexedDB.objectStoreNames.contains('MapLayerDB')
      ) {
        const tx = this.makeTX('MapLayerDB', 'readonly');
        tx.oncomplete = (ev) => {
          // console.log('DONE in get ITEM');
          // console.log(ev);
        };
        const objectStore = tx.objectStore('MapLayerDB');
        const request = objectStore.get(MapLayerName);

        request.onsuccess = (event) => {
          const data = (event.target as any).result;
          // console.log(data);
          resolve(data);
        };

        request.onerror = (event) => {
          // console.error(
          //   'Error getting item from object store:',
          //   (event.target as any)?.error
          // );
          const error = (event.target as any)?.error;
          reject(error);
        };
      } else {
        console.log('IndexedDB not initialized or object store not found.');
        reject(null);
      }
    });
  }
}
