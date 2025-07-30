import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyClientVpnEndpointCommand, se_ModifyClientVpnEndpointCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyClientVpnEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyClientVpnEndpoint", {})
    .n("EC2Client", "ModifyClientVpnEndpointCommand")
    .f(void 0, void 0)
    .ser(se_ModifyClientVpnEndpointCommand)
    .de(de_ModifyClientVpnEndpointCommand)
    .build() {
}
