import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AssignPrivateIpAddressesCommand, se_AssignPrivateIpAddressesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class AssignPrivateIpAddressesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AssignPrivateIpAddresses", {})
    .n("EC2Client", "AssignPrivateIpAddressesCommand")
    .f(void 0, void 0)
    .ser(se_AssignPrivateIpAddressesCommand)
    .de(de_AssignPrivateIpAddressesCommand)
    .build() {
}
