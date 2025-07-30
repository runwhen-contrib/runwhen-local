import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DetachNetworkInterfaceCommand, se_DetachNetworkInterfaceCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DetachNetworkInterfaceCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DetachNetworkInterface", {})
    .n("EC2Client", "DetachNetworkInterfaceCommand")
    .f(void 0, void 0)
    .ser(se_DetachNetworkInterfaceCommand)
    .de(de_DetachNetworkInterfaceCommand)
    .build() {
}
