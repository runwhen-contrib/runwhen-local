import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeVerifiedAccessTrustProvidersRequest, DescribeVerifiedAccessTrustProvidersResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeVerifiedAccessTrustProvidersCommand}.
 */
export interface DescribeVerifiedAccessTrustProvidersCommandInput extends DescribeVerifiedAccessTrustProvidersRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeVerifiedAccessTrustProvidersCommand}.
 */
export interface DescribeVerifiedAccessTrustProvidersCommandOutput extends DescribeVerifiedAccessTrustProvidersResult, __MetadataBearer {
}
declare const DescribeVerifiedAccessTrustProvidersCommand_base: {
    new (input: DescribeVerifiedAccessTrustProvidersCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessTrustProvidersCommandInput, DescribeVerifiedAccessTrustProvidersCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeVerifiedAccessTrustProvidersCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessTrustProvidersCommandInput, DescribeVerifiedAccessTrustProvidersCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the specified Amazon Web Services Verified Access trust providers.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeVerifiedAccessTrustProvidersCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeVerifiedAccessTrustProvidersCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeVerifiedAccessTrustProvidersRequest
 *   VerifiedAccessTrustProviderIds: [ // VerifiedAccessTrustProviderIdList
 *     "STRING_VALUE",
 *   ],
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [ // ValueStringList
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 *   DryRun: true || false,
 * };
 * const command = new DescribeVerifiedAccessTrustProvidersCommand(input);
 * const response = await client.send(command);
 * // { // DescribeVerifiedAccessTrustProvidersResult
 * //   VerifiedAccessTrustProviders: [ // VerifiedAccessTrustProviderList
 * //     { // VerifiedAccessTrustProvider
 * //       VerifiedAccessTrustProviderId: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       TrustProviderType: "user" || "device",
 * //       UserTrustProviderType: "iam-identity-center" || "oidc",
 * //       DeviceTrustProviderType: "jamf" || "crowdstrike" || "jumpcloud",
 * //       OidcOptions: { // OidcOptions
 * //         Issuer: "STRING_VALUE",
 * //         AuthorizationEndpoint: "STRING_VALUE",
 * //         TokenEndpoint: "STRING_VALUE",
 * //         UserInfoEndpoint: "STRING_VALUE",
 * //         ClientId: "STRING_VALUE",
 * //         ClientSecret: "STRING_VALUE",
 * //         Scope: "STRING_VALUE",
 * //       },
 * //       DeviceOptions: { // DeviceOptions
 * //         TenantId: "STRING_VALUE",
 * //         PublicSigningKeyUrl: "STRING_VALUE",
 * //       },
 * //       PolicyReferenceName: "STRING_VALUE",
 * //       CreationTime: "STRING_VALUE",
 * //       LastUpdatedTime: "STRING_VALUE",
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //       SseSpecification: { // VerifiedAccessSseSpecificationResponse
 * //         CustomerManagedKeyEnabled: true || false,
 * //         KmsKeyArn: "STRING_VALUE",
 * //       },
 * //       NativeApplicationOidcOptions: { // NativeApplicationOidcOptions
 * //         PublicSigningKeyEndpoint: "STRING_VALUE",
 * //         Issuer: "STRING_VALUE",
 * //         AuthorizationEndpoint: "STRING_VALUE",
 * //         TokenEndpoint: "STRING_VALUE",
 * //         UserInfoEndpoint: "STRING_VALUE",
 * //         ClientId: "STRING_VALUE",
 * //         Scope: "STRING_VALUE",
 * //       },
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeVerifiedAccessTrustProvidersCommandInput - {@link DescribeVerifiedAccessTrustProvidersCommandInput}
 * @returns {@link DescribeVerifiedAccessTrustProvidersCommandOutput}
 * @see {@link DescribeVerifiedAccessTrustProvidersCommandInput} for command's `input` shape.
 * @see {@link DescribeVerifiedAccessTrustProvidersCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeVerifiedAccessTrustProvidersCommand extends DescribeVerifiedAccessTrustProvidersCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeVerifiedAccessTrustProvidersRequest;
            output: DescribeVerifiedAccessTrustProvidersResult;
        };
        sdk: {
            input: DescribeVerifiedAccessTrustProvidersCommandInput;
            output: DescribeVerifiedAccessTrustProvidersCommandOutput;
        };
    };
}
