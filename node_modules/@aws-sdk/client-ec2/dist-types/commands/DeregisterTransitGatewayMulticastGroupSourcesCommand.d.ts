import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { DeregisterTransitGatewayMulticastGroupSourcesRequest, DeregisterTransitGatewayMulticastGroupSourcesResult } from "../models/models_3";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link DeregisterTransitGatewayMulticastGroupSourcesCommand}.
 */
export interface DeregisterTransitGatewayMulticastGroupSourcesCommandInput extends DeregisterTransitGatewayMulticastGroupSourcesRequest {
}
/**
 * @public
 *
 * The output of {@link DeregisterTransitGatewayMulticastGroupSourcesCommand}.
 */
export interface DeregisterTransitGatewayMulticastGroupSourcesCommandOutput extends DeregisterTransitGatewayMulticastGroupSourcesResult, __MetadataBearer {
}
declare const DeregisterTransitGatewayMulticastGroupSourcesCommand_base: {
    new (input: DeregisterTransitGatewayMulticastGroupSourcesCommandInput): import("@smithy/smithy-client").CommandImpl<DeregisterTransitGatewayMulticastGroupSourcesCommandInput, DeregisterTransitGatewayMulticastGroupSourcesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [DeregisterTransitGatewayMulticastGroupSourcesCommandInput]): import("@smithy/smithy-client").CommandImpl<DeregisterTransitGatewayMulticastGroupSourcesCommandInput, DeregisterTransitGatewayMulticastGroupSourcesCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Deregisters the specified sources (network interfaces) from the  transit gateway multicast group.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, DeregisterTransitGatewayMulticastGroupSourcesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, DeregisterTransitGatewayMulticastGroupSourcesCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // DeregisterTransitGatewayMulticastGroupSourcesRequest
 *   TransitGatewayMulticastDomainId: "STRING_VALUE",
 *   GroupIpAddress: "STRING_VALUE",
 *   NetworkInterfaceIds: [ // TransitGatewayNetworkInterfaceIdList
 *     "STRING_VALUE",
 *   ],
 *   DryRun: true || false,
 * };
 * const command = new DeregisterTransitGatewayMulticastGroupSourcesCommand(input);
 * const response = await client.send(command);
 * // { // DeregisterTransitGatewayMulticastGroupSourcesResult
 * //   DeregisteredMulticastGroupSources: { // TransitGatewayMulticastDeregisteredGroupSources
 * //     TransitGatewayMulticastDomainId: "STRING_VALUE",
 * //     DeregisteredNetworkInterfaceIds: [ // ValueStringList
 * //       "STRING_VALUE",
 * //     ],
 * //     GroupIpAddress: "STRING_VALUE",
 * //   },
 * // };
 *
 * ```
 *
 * @param DeregisterTransitGatewayMulticastGroupSourcesCommandInput - {@link DeregisterTransitGatewayMulticastGroupSourcesCommandInput}
 * @returns {@link DeregisterTransitGatewayMulticastGroupSourcesCommandOutput}
 * @see {@link DeregisterTransitGatewayMulticastGroupSourcesCommandInput} for command's `input` shape.
 * @see {@link DeregisterTransitGatewayMulticastGroupSourcesCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class DeregisterTransitGatewayMulticastGroupSourcesCommand extends DeregisterTransitGatewayMulticastGroupSourcesCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: DeregisterTransitGatewayMulticastGroupSourcesRequest;
            output: DeregisterTransitGatewayMulticastGroupSourcesResult;
        };
        sdk: {
            input: DeregisterTransitGatewayMulticastGroupSourcesCommandInput;
            output: DeregisterTransitGatewayMulticastGroupSourcesCommandOutput;
        };
    };
}
