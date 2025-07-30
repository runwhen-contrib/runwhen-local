export class MockSha256 {
    constructor(secret) { }
    update(data) { }
    digest() {
        return Promise.resolve(new Uint8Array(5));
    }
    reset() { }
}
export const region = () => Promise.resolve("mock-region");
export const endpoint = () => Promise.resolve({
    protocol: "https:",
    path: "/",
    hostname: "ec2.mock-region.amazonaws.com",
});
export const credentials = () => Promise.resolve({
    accessKeyId: "akid",
    secretAccessKey: "secret",
    sessionToken: "session",
});
