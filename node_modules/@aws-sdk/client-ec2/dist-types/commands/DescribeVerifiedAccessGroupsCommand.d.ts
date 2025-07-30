import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeVerifiedAccessGroupsRequest, DescribeVerifiedAccessGroupsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeVerifiedAccessGroupsCommand}.
 */
export interface DescribeVerifiedAccessGroupsCommandInput extends DescribeVerifiedAccessGroupsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeVerifiedAccessGroupsCommand}.
 */
export interface DescribeVerifiedAccessGroupsCommandOutput extends DescribeVerifiedAccessGroupsResult, __MetadataBearer {
}
declare const DescribeVerifiedAccessGroupsCommand_base: {
    new (input: DescribeVerifiedAccessGroupsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessGroupsCommandInput, DescribeVerifiedAccessGroupsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeVerifiedAccessGroupsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeVerifiedAccessGroupsCommandInput, DescribeVerifiedAccessGroupsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the specified Verified Access groups.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeVerifiedAccessGroupsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeVerifiedAccessGroupsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeVerifiedAccessGroupsRequest
 *   VerifiedAccessGroupIds: [ // VerifiedAccessGroupIdList
 *     "STRING_VALUE",
 *   ],
 *   VerifiedAccessInstanceId: "STRING_VALUE",
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
 * const command = new DescribeVerifiedAccessGroupsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeVerifiedAccessGroupsResult
 * //   VerifiedAccessGroups: [ // VerifiedAccessGroupList
 * //     { // VerifiedAccessGroup
 * //       VerifiedAccessGroupId: "STRING_VALUE",
 * //       VerifiedAccessInstanceId: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       Owner: "STRING_VALUE",
 * //       VerifiedAccessGroupArn: "STRING_VALUE",
 * //       CreationTime: "STRING_VALUE",
 * //       LastUpdatedTime: "STRING_VALUE",
 * //       DeletionTime: "STRING_VALUE",
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
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeVerifiedAccessGroupsCommandInput - {@link DescribeVerifiedAccessGroupsCommandInput}
 * @returns {@link DescribeVerifiedAccessGroupsCommandOutput}
 * @see {@link DescribeVerifiedAccessGroupsCommandInput} for command's `input` shape.
 * @see {@link DescribeVerifiedAccessGroupsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeVerifiedAccessGroupsCommand extends DescribeVerifiedAccessGroupsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeVerifiedAccessGroupsRequest;
            output: DescribeVerifiedAccessGroupsResult;
        };
        sdk: {
            input: DescribeVerifiedAccessGroupsCommandInput;
            output: DescribeVerifiedAccessGroupsCommandOutput;
        };
    };
}
