import {Injectable} from '@angular/core';

export class StoredPath {
  name: string | null = '';
  path = '';
  creationDate: Date = new Date();
  changeDate: Date = new Date();
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  storedPaths: StoredPath[] = [];

  constructor() {
    this.load();
  }

  hasPath(name: string) {
    return this.getPath(name) !== undefined;
  }

  getPath(name: string | null = null): StoredPath | undefined {
    return this.storedPaths.find(it => it.name === name);
  }

  removePath(name: string) {
    this.storedPaths = this.storedPaths.filter(it => it.name !== name);
    this.save();
  }

  addPath(name: string | null, path: string) {
    let p = this.getPath(name);
    if (!p) {
      p = new StoredPath();
      this.storedPaths.push(p);
      p.name = name;
    }
    p.changeDate = new Date();
    p.path = path;
    this.save();
  }

  isEmpty(): boolean {
    return this.storedPaths.filter(it => !!it.name).length === 0;
  }

  load() {
    this.storedPaths = [];
    const stored = localStorage.getItem('storedPaths');
    if (stored) {
      const parsed = JSON.parse(stored) as any[];
      parsed.forEach(it => {
        it.creationDate = new Date(it.creationDate);
        it.changeDate = new Date(it.changeDate);
      });
      this.storedPaths = parsed;
    }
  }

  save() {
    localStorage.setItem('storedPaths', JSON.stringify(this.storedPaths));
  }

  saveSvg(svg: string) {
    localStorage.setItem('storedSvg', JSON.stringify(svg));
  }

  saveSetting(setting: any) {
    localStorage.setItem('storedSetting', JSON.stringify(setting));
  }

  loadSvg() {
    return localStorage.getItem('storedSvg');
  }

  loadSetting() {
    return localStorage.getItem('storedSetting');
  }

  clearSetting() {
    localStorage.removeItem('storedSetting');
  }
}
