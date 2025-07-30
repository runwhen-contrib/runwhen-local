import { formatUrl } from "@aws-sdk/util-format-url";
import { getEndpointFromInstructions, toEndpointV1 } from "@smithy/middleware-endpoint";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
import { extendedEncodeURIComponent } from "@smithy/smithy-client";
const version = "2016-11-15";
export function copySnapshotPresignedUrlMiddleware(options) {
    return (next, context) => async (args) => {
        const { input } = args;
        if (!input.PresignedUrl) {
            const destinationRegion = await options.region();
            const endpoint = await getEndpointFromInstructions(input, {
                getEndpointParameterInstructions() {
                    return {
                        UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
                        Endpoint: { type: "builtInParams", name: "endpoint" },
                        Region: { type: "builtInParams", name: "region" },
                        UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" },
                    };
                },
            }, {
                ...options,
                region: input.SourceRegion,
            });
            const resolvedEndpoint = typeof options.endpoint === "function" ? await options.endpoint() : toEndpointV1(endpoint);
            const requestToSign = new HttpRequest({
                ...resolvedEndpoint,
                protocol: "https",
                headers: {
                    host: resolvedEndpoint.hostname,
                },
                query: {
                    ...Object.entries(input).reduce((acc, [k, v]) => {
                        acc[k] = String(v ?? "");
                        return acc;
                    }, {}),
                    Action: "CopySnapshot",
                    Version: version,
                    DestinationRegion: destinationRegion,
                },
            });
            const signer = new SignatureV4({
                credentials: options.credentials,
                region: input.SourceRegion,
                service: "ec2",
                sha256: options.sha256,
                uriEscapePath: options.signingEscapePath,
            });
            const presignedRequest = await signer.presign(requestToSign, {
                expiresIn: 3600,
            });
            args = {
                ...args,
                input: {
                    ...args.input,
                    DestinationRegion: destinationRegion,
                    PresignedUrl: formatUrl(presignedRequest),
                },
            };
            if (HttpRequest.isInstance(args.request)) {
                const { request } = args;
                if (!(request.body ?? "").includes("DestinationRegion=")) {
                    request.body += `&DestinationRegion=${destinationRegion}`;
                }
                if (!(request.body ?? "").includes("PresignedUrl=")) {
                    request.body += `&PresignedUrl=${extendedEncodeURIComponent(args.input.PresignedUrl)}`;
                }
            }
        }
        return next(args);
    };
}
export const copySnapshotPresignedUrlMiddlewareOptions = {
    step: "serialize",
    tags: ["CROSS_REGION_PRESIGNED_URL"],
    name: "crossRegionPresignedUrlMiddleware",
    override: true,
    relation: "after",
    toMiddleware: "endpointV2Middleware",
};
export const getCopySnapshotPresignedUrlPlugin = (config) => ({
    applyToStack: (clientStack) => {
        clientStack.add(copySnapshotPresignedUrlMiddleware(config), copySnapshotPresignedUrlMiddlewareOptions);
    },
});
