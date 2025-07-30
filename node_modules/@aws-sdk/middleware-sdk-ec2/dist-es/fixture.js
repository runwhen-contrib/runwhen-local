export class MockSha256 {
    constructor(secret) { }
    update(data) { }
    digest() {
        return Promise.resolve(new Uint8Array(5));
    }
}
export const region = () => Promise.resolve("mock-region");
export const credentials = () => Promise.resolve({
    accessKeyId: "akid",
    secretAccessKey: "secret",
    sessionToken: "session",
});
