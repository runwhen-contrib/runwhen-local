import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateLocalGatewayRouteTableCommand, se_CreateLocalGatewayRouteTableCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateLocalGatewayRouteTableCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateLocalGatewayRouteTable", {})
    .n("EC2Client", "CreateLocalGatewayRouteTableCommand")
    .f(void 0, void 0)
    .ser(se_CreateLocalGatewayRouteTableCommand)
    .de(de_CreateLocalGatewayRouteTableCommand)
    .build() {
}
