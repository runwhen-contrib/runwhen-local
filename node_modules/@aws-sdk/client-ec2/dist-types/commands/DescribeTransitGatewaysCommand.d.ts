import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewaysRequest, DescribeTransitGatewaysResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewaysCommand}.
 */
export interface DescribeTransitGatewaysCommandInput extends DescribeTransitGatewaysRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewaysCommand}.
 */
export interface DescribeTransitGatewaysCommandOutput extends DescribeTransitGatewaysResult, __MetadataBearer {
}
declare const DescribeTransitGatewaysCommand_base: {
    new (input: DescribeTransitGatewaysCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewaysCommandInput, DescribeTransitGatewaysCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewaysCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewaysCommandInput, DescribeTransitGatewaysCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more transit gateways. By default, all transit gateways are described. Alternatively, you can
 *          filter the results.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewaysCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewaysCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewaysRequest
 *   TransitGatewayIds: [ // TransitGatewayIdStringList
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
 * const command = new DescribeTransitGatewaysCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewaysResult
 * //   TransitGateways: [ // TransitGatewayList
 * //     { // TransitGateway
 * //       TransitGatewayId: "STRING_VALUE",
 * //       TransitGatewayArn: "STRING_VALUE",
 * //       State: "pending" || "available" || "modifying" || "deleting" || "deleted",
 * //       OwnerId: "STRING_VALUE",
 * //       Description: "STRING_VALUE",
 * //       CreationTime: new Date("TIMESTAMP"),
 * //       Options: { // TransitGatewayOptions
 * //         AmazonSideAsn: Number("long"),
 * //         TransitGatewayCidrBlocks: [ // ValueStringList
 * //           "STRING_VALUE",
 * //         ],
 * //         AutoAcceptSharedAttachments: "enable" || "disable",
 * //         DefaultRouteTableAssociation: "enable" || "disable",
 * //         AssociationDefaultRouteTableId: "STRING_VALUE",
 * //         DefaultRouteTablePropagation: "enable" || "disable",
 * //         PropagationDefaultRouteTableId: "STRING_VALUE",
 * //         VpnEcmpSupport: "enable" || "disable",
 * //         DnsSupport: "enable" || "disable",
 * //         SecurityGroupReferencingSupport: "enable" || "disable",
 * //         MulticastSupport: "enable" || "disable",
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
 * @param DescribeTransitGatewaysCommandInput - {@link DescribeTransitGatewaysCommandInput}
 * @returns {@link DescribeTransitGatewaysCommandOutput}
 * @see {@link DescribeTransitGatewaysCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewaysCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewaysCommand extends DescribeTransitGatewaysCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewaysRequest;
            output: DescribeTransitGatewaysResult;
        };
        sdk: {
            input: DescribeTransitGatewaysCommandInput;
            output: DescribeTransitGatewaysCommandOutput;
        };
    };
}
