import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateTransitGatewayRouteCommand, se_CreateTransitGatewayRouteCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateTransitGatewayRouteCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateTransitGatewayRoute", {})
    .n("EC2Client", "CreateTransitGatewayRouteCommand")
    .f(void 0, void 0)
    .ser(se_CreateTransitGatewayRouteCommand)
    .de(de_CreateTransitGatewayRouteCommand)
    .build() {
}
