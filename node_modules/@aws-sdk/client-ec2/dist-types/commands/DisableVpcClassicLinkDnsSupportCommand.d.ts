import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DisableVpcClassicLinkDnsSupportRequest, DisableVpcClassicLinkDnsSupportResult } from "../models/models_6";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DisableVpcClassicLinkDnsSupportCommand}.
 */
export interface DisableVpcClassicLinkDnsSupportCommandInput extends DisableVpcClassicLinkDnsSupportRequest {
}
/**
 * @public
 *
 * The output of {@link DisableVpcClassicLinkDnsSupportCommand}.
 */
export interface DisableVpcClassicLinkDnsSupportCommandOutput extends DisableVpcClassicLinkDnsSupportResult, __MetadataBearer {
}
declare const DisableVpcClassicLinkDnsSupportCommand_base: {
    new (input: DisableVpcClassicLinkDnsSupportCommandInput): import("@smithy/smithy-client").CommandImpl<DisableVpcClassicLinkDnsSupportCommandInput, DisableVpcClassicLinkDnsSupportCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DisableVpcClassicLinkDnsSupportCommandInput]): import("@smithy/smithy-client").CommandImpl<DisableVpcClassicLinkDnsSupportCommandInput, DisableVpcClassicLinkDnsSupportCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <note>
 *             <p>This action is deprecated.</p>
 *          </note>
 *          <p>Disables ClassicLink DNS support for a VPC. If disabled, DNS hostnames resolve to
 * 			public IP addresses when addressed between a linked EC2-Classic instance and instances
 * 			in the VPC to which it's linked.</p>
 *          <p>You must specify a VPC ID in the request.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DisableVpcClassicLinkDnsSupportCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DisableVpcClassicLinkDnsSupportCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DisableVpcClassicLinkDnsSupportRequest
 *   VpcId: "STRING_VALUE",
 * };
 * const command = new DisableVpcClassicLinkDnsSupportCommand(input);
 * const response = await client.send(command);
 * // { // DisableVpcClassicLinkDnsSupportResult
 * //   Return: true || false,
 * // };
 *
 * ```
 *
 * @param DisableVpcClassicLinkDnsSupportCommandInput - {@link DisableVpcClassicLinkDnsSupportCommandInput}
 * @returns {@link DisableVpcClassicLinkDnsSupportCommandOutput}
 * @see {@link DisableVpcClassicLinkDnsSupportCommandInput} for command's `input` shape.
 * @see {@link DisableVpcClassicLinkDnsSupportCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DisableVpcClassicLinkDnsSupportCommand extends DisableVpcClassicLinkDnsSupportCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DisableVpcClassicLinkDnsSupportRequest;
            output: DisableVpcClassicLinkDnsSupportResult;
        };
        sdk: {
            input: DisableVpcClassicLinkDnsSupportCommandInput;
            output: DisableVpcClassicLinkDnsSupportCommandOutput;
        };
    };
}
