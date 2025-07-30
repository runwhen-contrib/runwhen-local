import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeInstanceEventNotificationAttributesRequest, DescribeInstanceEventNotificationAttributesResult } from "../models/models_4";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeInstanceEventNotificationAttributesCommand}.
 */
export interface DescribeInstanceEventNotificationAttributesCommandInput extends DescribeInstanceEventNotificationAttributesRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeInstanceEventNotificationAttributesCommand}.
 */
export interface DescribeInstanceEventNotificationAttributesCommandOutput extends DescribeInstanceEventNotificationAttributesResult, __MetadataBearer {
}
declare const DescribeInstanceEventNotificationAttributesCommand_base: {
    new (input: DescribeInstanceEventNotificationAttributesCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeInstanceEventNotificationAttributesCommandInput, DescribeInstanceEventNotificationAttributesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeInstanceEventNotificationAttributesCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeInstanceEventNotificationAttributesCommandInput, DescribeInstanceEventNotificationAttributesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the tag keys that are registered to appear in scheduled event notifications
 *          for resources in the current Region.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeInstanceEventNotificationAttributesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeInstanceEventNotificationAttributesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeInstanceEventNotificationAttributesRequest
 *   DryRun: true || false,
 * };
 * const command = new DescribeInstanceEventNotificationAttributesCommand(input);
 * const response = await client.send(command);
 * // { // DescribeInstanceEventNotificationAttributesResult
 * //   InstanceTagAttribute: { // InstanceTagNotificationAttribute
 * //     InstanceTagKeys: [ // InstanceTagKeySet
 * //       "STRING_VALUE",
 * //     ],
 * //     IncludeAllTagsOfInstance: true || false,
 * //   },
 * // };
 *
 * ```
 *
 * @param DescribeInstanceEventNotificationAttributesCommandInput - {@link DescribeInstanceEventNotificationAttributesCommandInput}
 * @returns {@link DescribeInstanceEventNotificationAttributesCommandOutput}
 * @see {@link DescribeInstanceEventNotificationAttributesCommandInput} for command's `input` shape.
 * @see {@link DescribeInstanceEventNotificationAttributesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeInstanceEventNotificationAttributesCommand extends DescribeInstanceEventNotificationAttributesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeInstanceEventNotificationAttributesRequest;
            output: DescribeInstanceEventNotificationAttributesResult;
        };
        sdk: {
            input: DescribeInstanceEventNotificationAttributesCommandInput;
            output: DescribeInstanceEventNotificationAttributesCommandOutput;
        };
    };
}
