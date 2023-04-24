/* Copyright 2021, Milkdown by Mirone.*/
export class ResourceManager {
    private static instance: ResourceManager;
    static get Instance() {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }

        return ResourceManager.instance;
    }

    private imageMap: Map<string, { promise: Promise<string>; resolver: (target: string) => void }> = new Map();

    add(url: string) {
        let resolver: (target: string) => void = () => {
            throw new Error('out of scope');
        };
        const promise = new Promise<string>((resolve) => {
            resolver = resolve;
        });
        this.imageMap.set(url, { promise, resolver });

        return promise;
    }

    resolve(origin: string, target: string) {
        const value = this.imageMap.get(origin);
        if (value) {
            value.resolver(target);
        }
    }
}
