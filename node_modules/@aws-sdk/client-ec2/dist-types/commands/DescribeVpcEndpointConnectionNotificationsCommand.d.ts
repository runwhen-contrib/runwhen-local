import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeVpcEndpointConnectionNotificationsRequest, DescribeVpcEndpointConnectionNotificationsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeVpcEndpointConnectionNotificationsCommand}.
 */
export interface DescribeVpcEndpointConnectionNotificationsCommandInput extends DescribeVpcEndpointConnectionNotificationsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeVpcEndpointConnectionNotificationsCommand}.
 */
export interface DescribeVpcEndpointConnectionNotificationsCommandOutput extends DescribeVpcEndpointConnectionNotificationsResult, __MetadataBearer {
}
declare const DescribeVpcEndpointConnectionNotificationsCommand_base: {
    new (input: DescribeVpcEndpointConnectionNotificationsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeVpcEndpointConnectionNotificationsCommandInput, DescribeVpcEndpointConnectionNotificationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeVpcEndpointConnectionNotificationsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeVpcEndpointConnectionNotificationsCommandInput, DescribeVpcEndpointConnectionNotificationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes the connection notifications for VPC endpoints and VPC endpoint
 *             services.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeVpcEndpointConnectionNotificationsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeVpcEndpointConnectionNotificationsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeVpcEndpointConnectionNotificationsRequest
 *   DryRun: true || false,
 *   ConnectionNotificationId: "STRING_VALUE",
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
 * const command = new DescribeVpcEndpointConnectionNotificationsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeVpcEndpointConnectionNotificationsResult
 * //   ConnectionNotificationSet: [ // ConnectionNotificationSet
 * //     { // ConnectionNotification
 * //       ConnectionNotificationId: "STRING_VALUE",
 * //       ServiceId: "STRING_VALUE",
 * //       VpcEndpointId: "STRING_VALUE",
 * //       ConnectionNotificationType: "Topic",
 * //       ConnectionNotificationArn: "STRING_VALUE",
 * //       ConnectionEvents: [ // ValueStringList
 * //         "STRING_VALUE",
 * //       ],
 * //       ConnectionNotificationState: "Enabled" || "Disabled",
 * //       ServiceRegion: "STRING_VALUE",
 * //     },
 * //   ],
 * //   NextToken: "STRING_VALUE",
 * // };
 *
 * ```
 *
 * @param DescribeVpcEndpointConnectionNotificationsCommandInput - {@link DescribeVpcEndpointConnectionNotificationsCommandInput}
 * @returns {@link DescribeVpcEndpointConnectionNotificationsCommandOutput}
 * @see {@link DescribeVpcEndpointConnectionNotificationsCommandInput} for command's `input` shape.
 * @see {@link DescribeVpcEndpointConnectionNotificationsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeVpcEndpointConnectionNotificationsCommand extends DescribeVpcEndpointConnectionNotificationsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeVpcEndpointConnectionNotificationsRequest;
            output: DescribeVpcEndpointConnectionNotificationsResult;
        };
        sdk: {
            input: DescribeVpcEndpointConnectionNotificationsCommandInput;
            output: DescribeVpcEndpointConnectionNotificationsCommandOutput;
        };
    };
}
