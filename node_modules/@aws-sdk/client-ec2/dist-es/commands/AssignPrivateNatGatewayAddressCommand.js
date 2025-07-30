import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AssignPrivateNatGatewayAddressCommand, se_AssignPrivateNatGatewayAddressCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class AssignPrivateNatGatewayAddressCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AssignPrivateNatGatewayAddress", {})
    .n("EC2Client", "AssignPrivateNatGatewayAddressCommand")
    .f(void 0, void 0)
    .ser(se_AssignPrivateNatGatewayAddressCommand)
    .de(de_AssignPrivateNatGatewayAddressCommand)
    .build() {
}
