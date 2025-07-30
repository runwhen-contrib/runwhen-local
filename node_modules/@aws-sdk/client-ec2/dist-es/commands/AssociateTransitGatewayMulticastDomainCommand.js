import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AssociateTransitGatewayMulticastDomainCommand, se_AssociateTransitGatewayMulticastDomainCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class AssociateTransitGatewayMulticastDomainCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AssociateTransitGatewayMulticastDomain", {})
    .n("EC2Client", "AssociateTransitGatewayMulticastDomainCommand")
    .f(void 0, void 0)
    .ser(se_AssociateTransitGatewayMulticastDomainCommand)
    .de(de_AssociateTransitGatewayMulticastDomainCommand)
    .build() {
}
