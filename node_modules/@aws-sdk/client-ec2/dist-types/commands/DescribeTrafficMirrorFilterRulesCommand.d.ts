import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTrafficMirrorFilterRulesRequest, DescribeTrafficMirrorFilterRulesResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTrafficMirrorFilterRulesCommand}.
 */
export interface DescribeTrafficMirrorFilterRulesCommandInput extends DescribeTrafficMirrorFilterRulesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTrafficMirrorFilterRulesCommand}.
 */
export interface DescribeTrafficMirrorFilterRulesCommandOutput extends DescribeTrafficMirrorFilterRulesResult, __MetadataBearer {
}
declare const DescribeTrafficMirrorFilterRulesCommand_base: {
    new (input: DescribeTrafficMirrorFilterRulesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTrafficMirrorFilterRulesCommandInput, DescribeTrafficMirrorFilterRulesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTrafficMirrorFilterRulesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTrafficMirrorFilterRulesCommandInput, DescribeTrafficMirrorFilterRulesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describe traffic mirror filters that determine the traffic that is mirrored.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTrafficMirrorFilterRulesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTrafficMirrorFilterRulesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTrafficMirrorFilterRulesRequest
 *   TrafficMirrorFilterRuleIds: [ // TrafficMirrorFilterRuleIdList
 *     "STRING_VALUE",
 *   ],
 *   TrafficMirrorFilterId: "STRING_VALUE",
 *   DryRun: true || false,
 *   Filters: [ // FilterList
 *     { // Filter
 *       Name: "STRING_VALUE",
 *       Values: [ // ValueStringList
 *         "STRING_VALUE",
 *       ],
 *     },
 *   ],
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 * };
 * const command = new DescribeTrafficMirrorFilterRulesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTrafficMirrorFilterRulesResult
 * //   TrafficMirrorFilterRules: [ // TrafficMirrorFilterRuleSet
 * //     { // TrafficMirrorFilterRule
 * //       TrafficMirrorFilterRuleId: "STRING_VALUE",
 * //       TrafficMirrorFilterId: "STRING_VALUE",
 * //       TrafficDirection: "ingress" || "egress",
 * //       RuleNumber: Number("int"),
 * //       RuleAction: "accept" || "reject",
 * //       Protocol: Number("int"),
 * //       DestinationPortRange: { // TrafficMirrorPortRange
 * //         FromPort: Number("int"),
 * //         ToPort: Number("int"),
 * //       },
 * //       SourcePortRange: {
 * //         FromPort: Number("int"),
 * //         ToPort: Number("int"),
 * //       },
 * //       DestinationCidrBlock: "STRING_VALUE",
 * //       SourceCidrBlock: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       Tags: [ // TagList
 * //         { // Tag
 * //           Key: "STRING_VALUE",
 * //           Value: "STRING_VALUE",
 * //         },
 * //       ],
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeTrafficMirrorFilterRulesCommandInput - {@link DescribeTrafficMirrorFilterRulesCommandInput}
 * @returns {@link DescribeTrafficMirrorFilterRulesCommandOutput}
 * @see {@link DescribeTrafficMirrorFilterRulesCommandInput} for command's `input` shape.
 * @see {@link DescribeTrafficMirrorFilterRulesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTrafficMirrorFilterRulesCommand extends DescribeTrafficMirrorFilterRulesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTrafficMirrorFilterRulesRequest;
            output: DescribeTrafficMirrorFilterRulesResult;
        };
        sdk: {
            input: DescribeTrafficMirrorFilterRulesCommandInput;
            output: DescribeTrafficMirrorFilterRulesCommandOutput;
        };
    };
}
