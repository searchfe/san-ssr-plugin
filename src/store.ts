import {ExtractedCssResult} from './types';

export class Store<T> {
    store: Map<string, T[]>;
    isArray: boolean = false;

    constructor() {
        this.store = new Map();
    }

    clear() {
        this.store = new Map();
    }

    get(id: string) {
        return this.store.get(id);
    }

    getKeys() {
        return [...this.store.keys()];
    }

    set(id: string, value?: T) {
        let current = this.store.get(id) || [];
        value && current.push(value);
        this.store.set(id, current);
    }
}

export type TemplateResult = string;
export type StyleStore = Store<ExtractedCssResult>;
export type TemplateStore = Store<TemplateResult>;

