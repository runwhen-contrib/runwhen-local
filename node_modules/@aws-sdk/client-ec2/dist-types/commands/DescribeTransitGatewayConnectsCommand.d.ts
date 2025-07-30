import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewayConnectsRequest, DescribeTransitGatewayConnectsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewayConnectsCommand}.
 */
export interface DescribeTransitGatewayConnectsCommandInput extends DescribeTransitGatewayConnectsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewayConnectsCommand}.
 */
export interface DescribeTransitGatewayConnectsCommandOutput extends DescribeTransitGatewayConnectsResult, __MetadataBearer {
}
declare const DescribeTransitGatewayConnectsCommand_base: {
    new (input: DescribeTransitGatewayConnectsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayConnectsCommandInput, DescribeTransitGatewayConnectsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewayConnectsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayConnectsCommandInput, DescribeTransitGatewayConnectsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more Connect attachments.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewayConnectsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewayConnectsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewayConnectsRequest
 *   TransitGatewayAttachmentIds: [ // TransitGatewayAttachmentIdStringList
 *     "STRING_VALUE",
 *   ],
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
 *   DryRun: true || false,
 * };
 * const command = new DescribeTransitGatewayConnectsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewayConnectsResult
 * //   TransitGatewayConnects: [ // TransitGatewayConnectList
 * //     { // TransitGatewayConnect
 * //       TransitGatewayAttachmentId: "STRING_VALUE",
 * //       TransportTransitGatewayAttachmentId: "STRING_VALUE",
 * //       TransitGatewayId: "STRING_VALUE",
 * //       State: "initiating" || "initiatingRequest" || "pendingAcceptance" || "rollingBack" || "pending" || "available" || "modifying" || "deleting" || "deleted" || "failed" || "rejected" || "rejecting" || "failing",
 * //       CreationTime: new Date("TIMESTAMP"),
 * //       Options: { // TransitGatewayConnectOptions
 * //         Protocol: "gre",
 * //       },
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
 * @param DescribeTransitGatewayConnectsCommandInput - {@link DescribeTransitGatewayConnectsCommandInput}
 * @returns {@link DescribeTransitGatewayConnectsCommandOutput}
 * @see {@link DescribeTransitGatewayConnectsCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewayConnectsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewayConnectsCommand extends DescribeTransitGatewayConnectsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewayConnectsRequest;
            output: DescribeTransitGatewayConnectsResult;
        };
        sdk: {
            input: DescribeTransitGatewayConnectsCommandInput;
            output: DescribeTransitGatewayConnectsCommandOutput;
        };
    };
}
