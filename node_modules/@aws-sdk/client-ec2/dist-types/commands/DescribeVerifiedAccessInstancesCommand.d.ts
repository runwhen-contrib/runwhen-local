import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeVerifiedAccessInstancesRequest, DescribeVerifiedAccessInstancesResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeVerifiedAccessInstancesCommand}.
 */
export interface DescribeVerifiedAccessInstancesCommandInput extends DescribeVerifiedAccessInstancesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeVerifiedAccessInstancesCommand}.
 */
export interface DescribeVerifiedAccessInstancesCommandOutput extends DescribeVerifiedAccessInstancesResult, __MetadataBearer {
}
declare const DescribeVerifiedAccessInstancesCommand_base: {
    new (input: DescribeVerifiedAccessInstancesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessInstancesCommandInput, DescribeVerifiedAccessInstancesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeVerifiedAccessInstancesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessInstancesCommandInput, DescribeVerifiedAccessInstancesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the specified Amazon Web Services Verified Access instances.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeVerifiedAccessInstancesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeVerifiedAccessInstancesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeVerifiedAccessInstancesRequest
 *   VerifiedAccessInstanceIds: [ // VerifiedAccessInstanceIdList
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
 * const command = new DescribeVerifiedAccessInstancesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeVerifiedAccessInstancesResult
 * //   VerifiedAccessInstances: [ // VerifiedAccessInstanceList
 * //     { // VerifiedAccessInstance
 * //       VerifiedAccessInstanceId: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       VerifiedAccessTrustProviders: [ // VerifiedAccessTrustProviderCondensedList
 * //         { // VerifiedAccessTrustProviderCondensed
 * //           VerifiedAccessTrustProviderId: "STRING_VALUE",
 * //           Description: "STRING_VALUE",
 * //           TrustProviderType: "user" || "device",
 * //           UserTrustProviderType: "iam-identity-center" || "oidc",
 * //           DeviceTrustProviderType: "jamf" || "crowdstrike" || "jumpcloud",
 * //         },
 * //       ],
 * //       CreationTime: "STRING_VALUE",
 * //       LastUpdatedTime: "STRING_VALUE",
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //       FipsEnabled: true || false,
 * //       CidrEndpointsCustomSubDomain: { // VerifiedAccessInstanceCustomSubDomain
 * //         SubDomain: "STRING_VALUE",
 * //         Nameservers: [ // ValueStringList
 * //           "STRING_VALUE",
 * //         ],
 * //       },
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeVerifiedAccessInstancesCommandInput - {@link DescribeVerifiedAccessInstancesCommandInput}
 * @returns {@link DescribeVerifiedAccessInstancesCommandOutput}
 * @see {@link DescribeVerifiedAccessInstancesCommandInput} for command's `input` shape.
 * @see {@link DescribeVerifiedAccessInstancesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeVerifiedAccessInstancesCommand extends DescribeVerifiedAccessInstancesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeVerifiedAccessInstancesRequest;
            output: DescribeVerifiedAccessInstancesResult;
        };
        sdk: {
            input: DescribeVerifiedAccessInstancesCommandInput;
            output: DescribeVerifiedAccessInstancesCommandOutput;
        };
    };
}
