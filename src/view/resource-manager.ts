export class ResourceManager {
    private imageMap: Map<string, { promise: Promise<string>; resolver: (target: string) => void }> = new Map();

    add(url: string) {
        let resolver: (target: string) => void = () => {};
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
