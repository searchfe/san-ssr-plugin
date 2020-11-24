import type {ExtractedCssResult} from './types';

class ModulesStyleStore {
    store: Map<string, ExtractedCssResult[]>;

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

    set(id: string, value?: ExtractedCssResult) {
        const current = this.store.get(id) || [];
        value && current.push(value);
        this.store.set(id, current);
    }
}

export const styleStore = new ModulesStyleStore();