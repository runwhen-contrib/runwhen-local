import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DescribeTransitGatewayConnectPeersRequest, DescribeTransitGatewayConnectPeersResult } from "../models/models_5";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DescribeTransitGatewayConnectPeersCommand}.
 */
export interface DescribeTransitGatewayConnectPeersCommandInput extends DescribeTransitGatewayConnectPeersRequest {
}
/**
 * @public
 *
 * The output of {@link DescribeTransitGatewayConnectPeersCommand}.
 */
export interface DescribeTransitGatewayConnectPeersCommandOutput extends DescribeTransitGatewayConnectPeersResult, __MetadataBearer {
}
declare const DescribeTransitGatewayConnectPeersCommand_base: {
    new (input: DescribeTransitGatewayConnectPeersCommandInput): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayConnectPeersCommandInput, DescribeTransitGatewayConnectPeersCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DescribeTransitGatewayConnectPeersCommandInput]): import("@smithy/smithy-client").CommandImpl<DescribeTransitGatewayConnectPeersCommandInput, DescribeTransitGatewayConnectPeersCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Describes one or more Connect peers.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DescribeTransitGatewayConnectPeersCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DescribeTransitGatewayConnectPeersCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DescribeTransitGatewayConnectPeersRequest
 *   TransitGatewayConnectPeerIds: [ // TransitGatewayConnectPeerIdStringList
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
 * const command = new DescribeTransitGatewayConnectPeersCommand(input);
 * const response = await client.send(command);
 * // { // DescribeTransitGatewayConnectPeersResult
 * //   TransitGatewayConnectPeers: [ // TransitGatewayConnectPeerList
 * //     { // TransitGatewayConnectPeer
 * //       TransitGatewayAttachmentId: "STRING_VALUE",
 * //       TransitGatewayConnectPeerId: "STRING_VALUE",
 * //       State: "pending" || "available" || "deleting" || "deleted",
 * //       CreationTime: new Date("TIMESTAMP"),
 * //       ConnectPeerConfiguration: { // TransitGatewayConnectPeerConfiguration
 * //         TransitGatewayAddress: "STRING_VALUE",
 * //         PeerAddress: "STRING_VALUE",
 * //         InsideCidrBlocks: [ // InsideCidrBlocksStringList
 * //           "STRING_VALUE",
 * //         ],
 * //         Protocol: "gre",
 * //         BgpConfigurations: [ // TransitGatewayAttachmentBgpConfigurationList
 * //           { // TransitGatewayAttachmentBgpConfiguration
 * //             TransitGatewayAsn: Number("long"),
 * //             PeerAsn: Number("long"),
 * //             TransitGatewayAddress: "STRING_VALUE",
 * //             PeerAddress: "STRING_VALUE",
 * //             BgpStatus: "up" || "down",
 * //           },
 * //         ],
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
 * @param DescribeTransitGatewayConnectPeersCommandInput - {@link DescribeTransitGatewayConnectPeersCommandInput}
 * @returns {@link DescribeTransitGatewayConnectPeersCommandOutput}
 * @see {@link DescribeTransitGatewayConnectPeersCommandInput} for command's `input` shape.
 * @see {@link DescribeTransitGatewayConnectPeersCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DescribeTransitGatewayConnectPeersCommand extends DescribeTransitGatewayConnectPeersCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DescribeTransitGatewayConnectPeersRequest;
            output: DescribeTransitGatewayConnectPeersResult;
        };
        sdk: {
            input: DescribeTransitGatewayConnectPeersCommandInput;
            output: DescribeTransitGatewayConnectPeersCommandOutput;
        };
    };
}
