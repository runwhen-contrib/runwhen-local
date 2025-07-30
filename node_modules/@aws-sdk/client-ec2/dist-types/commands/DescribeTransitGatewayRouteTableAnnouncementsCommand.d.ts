import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewayRouteTableAnnouncementsRequest, DescribeTransitGatewayRouteTableAnnouncementsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewayRouteTableAnnouncementsCommand}.
 */
export interface DescribeTransitGatewayRouteTableAnnouncementsCommandInput extends DescribeTransitGatewayRouteTableAnnouncementsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewayRouteTableAnnouncementsCommand}.
 */
export interface DescribeTransitGatewayRouteTableAnnouncementsCommandOutput extends DescribeTransitGatewayRouteTableAnnouncementsResult, __MetadataBearer {
}
declare const DescribeTransitGatewayRouteTableAnnouncementsCommand_base: {
    new (input: DescribeTransitGatewayRouteTableAnnouncementsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayRouteTableAnnouncementsCommandInput, DescribeTransitGatewayRouteTableAnnouncementsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewayRouteTableAnnouncementsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayRouteTableAnnouncementsCommandInput, DescribeTransitGatewayRouteTableAnnouncementsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more transit gateway route table advertisements.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewayRouteTableAnnouncementsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewayRouteTableAnnouncementsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewayRouteTableAnnouncementsRequest
 *   TransitGatewayRouteTableAnnouncementIds: [ // TransitGatewayRouteTableAnnouncementIdStringList
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
 * const command = new DescribeTransitGatewayRouteTableAnnouncementsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewayRouteTableAnnouncementsResult
 * //   TransitGatewayRouteTableAnnouncements: [ // TransitGatewayRouteTableAnnouncementList
 * //     { // TransitGatewayRouteTableAnnouncement
 * //       TransitGatewayRouteTableAnnouncementId: "STRING_VALUE",
 * //       TransitGatewayId: "STRING_VALUE",
 * //       CoreNetworkId: "STRING_VALUE",
 * //       PeerTransitGatewayId: "STRING_VALUE",
 * //       PeerCoreNetworkId: "STRING_VALUE",
 * //       PeeringAttachmentId: "STRING_VALUE",
 * //       AnnouncementDirection: "outgoing" || "incoming",
 * //       TransitGatewayRouteTableId: "STRING_VALUE",
 * //       State: "available" || "pending" || "failing" || "failed" || "deleting" || "deleted",
 * //       CreationTime: new Date("TIMESTAMP"),
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
 * @param DescribeTransitGatewayRouteTableAnnouncementsCommandInput - {@link DescribeTransitGatewayRouteTableAnnouncementsCommandInput}
 * @returns {@link DescribeTransitGatewayRouteTableAnnouncementsCommandOutput}
 * @see {@link DescribeTransitGatewayRouteTableAnnouncementsCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewayRouteTableAnnouncementsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewayRouteTableAnnouncementsCommand extends DescribeTransitGatewayRouteTableAnnouncementsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewayRouteTableAnnouncementsRequest;
            output: DescribeTransitGatewayRouteTableAnnouncementsResult;
        };
        sdk: {
            input: DescribeTransitGatewayRouteTableAnnouncementsCommandInput;
            output: DescribeTransitGatewayRouteTableAnnouncementsCommandOutput;
        };
    };
}
