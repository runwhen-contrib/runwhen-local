import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeVpcClassicLinkDnsSupportRequest, DescribeVpcClassicLinkDnsSupportResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeVpcClassicLinkDnsSupportCommand}.
 */
export interface DescribeVpcClassicLinkDnsSupportCommandInput extends DescribeVpcClassicLinkDnsSupportRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeVpcClassicLinkDnsSupportCommand}.
 */
export interface DescribeVpcClassicLinkDnsSupportCommandOutput extends DescribeVpcClassicLinkDnsSupportResult, __MetadataBearer {
}
declare const DescribeVpcClassicLinkDnsSupportCommand_base: {
    new (input: DescribeVpcClassicLinkDnsSupportCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeVpcClassicLinkDnsSupportCommandInput, DescribeVpcClassicLinkDnsSupportCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeVpcClassicLinkDnsSupportCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeVpcClassicLinkDnsSupportCommandInput, DescribeVpcClassicLinkDnsSupportCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <note>
 *             <p>This action is deprecated.</p>
 *          </note>
 *          <p>Describes the ClassicLink DNS support status of one or more VPCs. If enabled, the DNS
 *             hostname of a linked EC2-Classic instance resolves to its private IP address when
 *             addressed from an instance in the VPC to which it's linked. Similarly, the DNS hostname
 *             of an instance in a VPC resolves to its private IP address when addressed from a linked
 *             EC2-Classic instance.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeVpcClassicLinkDnsSupportCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeVpcClassicLinkDnsSupportCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeVpcClassicLinkDnsSupportRequest
 *   VpcIds: [ // VpcClassicLinkIdList
 *     "STRING_VALUE",
 *   ],
 *   MaxResults: Number("int"),
 *   NextToken: "STRING_VALUE",
 * };
 * const command = new DescribeVpcClassicLinkDnsSupportCommand(input);
 * const response = await client.send(command);
 * // { // DescribeVpcClassicLinkDnsSupportResult
 * //   NextToken: "STRING_VALUE",
 * //   Vpcs: [ // ClassicLinkDnsSupportList
 * //     { // ClassicLinkDnsSupport
 * //       ClassicLinkDnsSupported: true || false,
 * //       VpcId: "STRING_VALUE",
 * //     },
 * //   ],
 * // };
 *
 * ```
 *
 * @param DescribeVpcClassicLinkDnsSupportCommandInput - {@link DescribeVpcClassicLinkDnsSupportCommandInput}
 * @returns {@link DescribeVpcClassicLinkDnsSupportCommandOutput}
 * @see {@link DescribeVpcClassicLinkDnsSupportCommandInput} for command's `input` shape.
 * @see {@link DescribeVpcClassicLinkDnsSupportCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeVpcClassicLinkDnsSupportCommand extends DescribeVpcClassicLinkDnsSupportCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeVpcClassicLinkDnsSupportRequest;
            output: DescribeVpcClassicLinkDnsSupportResult;
        };
        sdk: {
            input: DescribeVpcClassicLinkDnsSupportCommandInput;
            output: DescribeVpcClassicLinkDnsSupportCommandOutput;
        };
    };
}
