export declare class Lazy<T> {
    private readonly executor;
    private _result?;
    constructor(executor: () => T);
    hasValue(): boolean;
    getValue(): T;
    private realizeValue;
}
