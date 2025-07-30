import { formatUrl } from "@aws-sdk/util-format-url";
import { toEndpointV1 } from "@smithy/middleware-endpoint";
import { HttpRequest } from "@smithy/protocol-http";
import { SignatureV4 } from "@smithy/signature-v4";
const regARN = /arn:[\w+=/,.@-]+:[\w+=/,.@-]+:([\w+=/,.@-]*)?:[0-9]+:[\w+=/,.@-]+(:[\w+=/,.@-]+)?(:[\w+=/,.@-]+)?/;
const sourceIdToCommandKeyMap = {
    SourceDBSnapshotIdentifier: "CopyDBSnapshot",
    SourceDBInstanceIdentifier: "CreateDBInstanceReadReplica",
    ReplicationSourceIdentifier: "CreateDBCluster",
    SourceDBClusterSnapshotIdentifier: "CopyDBClusterSnapshot",
    SourceDBInstanceArn: "StartDBInstanceAutomatedBackupsReplication",
};
const version = "2014-10-31";
export function crossRegionPresignedUrlMiddleware(options) {
    return (next, context) => async (args) => {
        const { input } = args;
        const region = await options.region();
        const sourceIdKey = Object.keys(sourceIdToCommandKeyMap).filter((sourceKeyId) => input.hasOwnProperty(sourceKeyId))[0];
        if (!sourceIdKey)
            return next(args);
        const command = sourceIdToCommandKeyMap[sourceIdKey];
        if (!input.PreSignedUrl && isARN(input[sourceIdKey]) && region !== getEndpointFromARN(input[sourceIdKey])) {
            const sourceRegion = getEndpointFromARN(input[sourceIdKey]);
            let resolvedEndpoint;
            if (typeof options.endpoint === "function") {
                resolvedEndpoint = await options.endpoint();
            }
            else {
                resolvedEndpoint = toEndpointV1(context.endpointV2);
            }
            resolvedEndpoint.hostname = `rds.${sourceRegion}.amazonaws.com`;
            const request = new HttpRequest({
                ...resolvedEndpoint,
                protocol: "https",
                headers: {
                    host: resolvedEndpoint.hostname,
                },
                query: {
                    Action: command,
                    Version: version,
                    KmsKeyId: input.KmsKeyId,
                    DestinationRegion: region,
                    [sourceIdKey]: input[sourceIdKey],
                },
            });
            const signer = new SignatureV4({
                credentials: options.credentials,
                region: sourceRegion,
                service: "rds",
                sha256: options.sha256,
                uriEscapePath: options.signingEscapePath,
            });
            const presignedRequest = await signer.presign(request, {
                expiresIn: 3600,
            });
            args = {
                ...args,
                input: {
                    ...args.input,
                    PreSignedUrl: formatUrl(presignedRequest),
                },
            };
        }
        return next(args);
    };
}
export const crossRegionPresignedUrlMiddlewareOptions = {
    step: "serialize",
    tags: ["CROSS_REGION_PRESIGNED_URL"],
    name: "crossRegionPresignedUrlMiddleware",
    override: true,
    relation: "after",
    toMiddleware: "endpointV2Middleware",
};
export const getCrossRegionPresignedUrlPlugin = (config) => ({
    applyToStack: (clientStack) => {
        clientStack.addRelativeTo(crossRegionPresignedUrlMiddleware(config), crossRegionPresignedUrlMiddlewareOptions);
    },
});
function isARN(id) {
    if (!id)
        return false;
    return regARN.test(id);
}
function getEndpointFromARN(arn) {
    const arnArr = arn.split(":");
    if (arnArr.length < 4) {
        throw new Error(`Cannot infer endpoint from '${arn}'`);
    }
    return arnArr[3];
}
