import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewayAttachmentsRequest, DescribeTransitGatewayAttachmentsResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewayAttachmentsCommand}.
 */
export interface DescribeTransitGatewayAttachmentsCommandInput extends DescribeTransitGatewayAttachmentsRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewayAttachmentsCommand}.
 */
export interface DescribeTransitGatewayAttachmentsCommandOutput extends DescribeTransitGatewayAttachmentsResult, __MetadataBearer {
}
declare const DescribeTransitGatewayAttachmentsCommand_base: {
    new (input: DescribeTransitGatewayAttachmentsCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayAttachmentsCommandInput, DescribeTransitGatewayAttachmentsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewayAttachmentsCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayAttachmentsCommandInput, DescribeTransitGatewayAttachmentsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more attachments between resources and transit gateways. By default, all attachments are described.
 *          Alternatively, you can filter the results by attachment ID, attachment state, resource ID, or resource owner.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewayAttachmentsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewayAttachmentsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewayAttachmentsRequest
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
 * const command = new DescribeTransitGatewayAttachmentsCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewayAttachmentsResult
 * //   TransitGatewayAttachments: [ // TransitGatewayAttachmentList
 * //     { // TransitGatewayAttachment
 * //       TransitGatewayAttachmentId: "STRING_VALUE",
 * //       TransitGatewayId: "STRING_VALUE",
 * //       TransitGatewayOwnerId: "STRING_VALUE",
 * //       ResourceOwnerId: "STRING_VALUE",
 * //       ResourceType: "vpc" || "vpn" || "direct-connect-gateway" || "connect" || "peering" || "tgw-peering",
 * //       ResourceId: "STRING_VALUE",
 * //       State: "initiating" || "initiatingRequest" || "pendingAcceptance" || "rollingBack" || "pending" || "available" || "modifying" || "deleting" || "deleted" || "failed" || "rejected" || "rejecting" || "failing",
 * //       Association: { // TransitGatewayAttachmentAssociation
 * //         TransitGatewayRouteTableId: "STRING_VALUE",
 * //         State: "associating" || "associated" || "disassociating" || "disassociated",
 * //       },
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
 * @param DescribeTransitGatewayAttachmentsCommandInput - {@link DescribeTransitGatewayAttachmentsCommandInput}
 * @returns {@link DescribeTransitGatewayAttachmentsCommandOutput}
 * @see {@link DescribeTransitGatewayAttachmentsCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewayAttachmentsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewayAttachmentsCommand extends DescribeTransitGatewayAttachmentsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewayAttachmentsRequest;
            output: DescribeTransitGatewayAttachmentsResult;
        };
        sdk: {
            input: DescribeTransitGatewayAttachmentsCommandInput;
            output: DescribeTransitGatewayAttachmentsCommandOutput;
        };
    };
}
