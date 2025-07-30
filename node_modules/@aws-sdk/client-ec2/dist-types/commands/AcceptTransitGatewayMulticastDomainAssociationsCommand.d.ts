import { Command as $Command } from "@smithy/smithy-client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import { EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../EC2Client";
import { AcceptTransitGatewayMulticastDomainAssociationsRequest, AcceptTransitGatewayMulticastDomainAssociationsResult } from "../models/models_0";
/**
 * @public
 */
export type { __MetadataBearer };
export { $Command };
/**
 * @public
 *
 * The input for {@link AcceptTransitGatewayMulticastDomainAssociationsCommand}.
 */
export interface AcceptTransitGatewayMulticastDomainAssociationsCommandInput extends AcceptTransitGatewayMulticastDomainAssociationsRequest {
}
/**
 * @public
 *
 * The output of {@link AcceptTransitGatewayMulticastDomainAssociationsCommand}.
 */
export interface AcceptTransitGatewayMulticastDomainAssociationsCommandOutput extends AcceptTransitGatewayMulticastDomainAssociationsResult, __MetadataBearer {
}
declare const AcceptTransitGatewayMulticastDomainAssociationsCommand_base: {
    new (input: AcceptTransitGatewayMulticastDomainAssociationsCommandInput): import("@smithy/smithy-client").CommandImpl<AcceptTransitGatewayMulticastDomainAssociationsCommandInput, AcceptTransitGatewayMulticastDomainAssociationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    new (...[input]: [] | [AcceptTransitGatewayMulticastDomainAssociationsCommandInput]): import("@smithy/smithy-client").CommandImpl<AcceptTransitGatewayMulticastDomainAssociationsCommandInput, AcceptTransitGatewayMulticastDomainAssociationsCommandOutput, EC2ClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes>;
    getEndpointParameterInstructions(): import("@smithy/middleware-endpoint").EndpointParameterInstructions;
};
/**
 * <p>Accepts a request to associate subnets with a transit gateway multicast domain.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { EC2Client, AcceptTransitGatewayMulticastDomainAssociationsCommand } from "@aws-sdk/client-ec2"; // ES Modules import
 * // const { EC2Client, AcceptTransitGatewayMulticastDomainAssociationsCommand } = require("@aws-sdk/client-ec2"); // CommonJS import
 * const client = new EC2Client(config);
 * const input = { // AcceptTransitGatewayMulticastDomainAssociationsRequest
 *   TransitGatewayMulticastDomainId: "STRING_VALUE",
 *   TransitGatewayAttachmentId: "STRING_VALUE",
 *   SubnetIds: [ // ValueStringList
 *     "STRING_VALUE",
 *   ],
 *   DryRun: true || false,
 * };
 * const command = new AcceptTransitGatewayMulticastDomainAssociationsCommand(input);
 * const response = await client.send(command);
 * // { // AcceptTransitGatewayMulticastDomainAssociationsResult
 * //   Associations: { // TransitGatewayMulticastDomainAssociations
 * //     TransitGatewayMulticastDomainId: "STRING_VALUE",
 * //     TransitGatewayAttachmentId: "STRING_VALUE",
 * //     ResourceId: "STRING_VALUE",
 * //     ResourceType: "vpc" || "vpn" || "direct-connect-gateway" || "connect" || "peering" || "tgw-peering",
 * //     ResourceOwnerId: "STRING_VALUE",
 * //     Subnets: [ // SubnetAssociationList
 * //       { // SubnetAssociation
 * //         SubnetId: "STRING_VALUE",
 * //         State: "pendingAcceptance" || "associating" || "associated" || "disassociating" || "disassociated" || "rejected" || "failed",
 * //       },
 * //     ],
 * //   },
 * // };
 *
 * ```
 *
 * @param AcceptTransitGatewayMulticastDomainAssociationsCommandInput - {@link AcceptTransitGatewayMulticastDomainAssociationsCommandInput}
 * @returns {@link AcceptTransitGatewayMulticastDomainAssociationsCommandOutput}
 * @see {@link AcceptTransitGatewayMulticastDomainAssociationsCommandInput} for command's `input` shape.
 * @see {@link AcceptTransitGatewayMulticastDomainAssociationsCommandOutput} for command's `response` shape.
 * @see {@link EC2ClientResolvedConfig | config} for EC2Client's `config` shape.
 *
 * @throws {@link EC2ServiceException}
 * <p>Base exception class for all service exceptions from EC2 service.</p>
 *
 *
 * @public
 */
export declare class AcceptTransitGatewayMulticastDomainAssociationsCommand extends AcceptTransitGatewayMulticastDomainAssociationsCommand_base {
    /** @internal type navigation helper, not in runtime. */
    protected static __types: {
        api: {
            input: AcceptTransitGatewayMulticastDomainAssociationsRequest;
            output: AcceptTransitGatewayMulticastDomainAssociationsResult;
        };
        sdk: {
            input: AcceptTransitGatewayMulticastDomainAssociationsCommandInput;
            output: AcceptTransitGatewayMulticastDomainAssociationsCommandOutput;
        };
    };
}
