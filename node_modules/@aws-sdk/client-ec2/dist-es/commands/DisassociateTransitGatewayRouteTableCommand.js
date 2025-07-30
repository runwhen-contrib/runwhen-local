import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DisassociateTransitGatewayRouteTableCommand, se_DisassociateTransitGatewayRouteTableCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DisassociateTransitGatewayRouteTableCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DisassociateTransitGatewayRouteTable", {})
    .n("EC2Client", "DisassociateTransitGatewayRouteTableCommand")
    .f(void 0, void 0)
    .ser(se_DisassociateTransitGatewayRouteTableCommand)
    .de(de_DisassociateTransitGatewayRouteTableCommand)
    .build() {
}
