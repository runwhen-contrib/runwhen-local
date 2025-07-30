import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyVpnTunnelOptionsRequestFilterSensitiveLog, ModifyVpnTunnelOptionsResultFilterSensitiveLog, } from "../models/models_7";
import { de_ModifyVpnTunnelOptionsCommand, se_ModifyVpnTunnelOptionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVpnTunnelOptionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVpnTunnelOptions", {})
    .n("EC2Client", "ModifyVpnTunnelOptionsCommand")
    .f(ModifyVpnTunnelOptionsRequestFilterSensitiveLog, ModifyVpnTunnelOptionsResultFilterSensitiveLog)
    .ser(se_ModifyVpnTunnelOptionsCommand)
    .de(de_ModifyVpnTunnelOptionsCommand)
    .build() {
}
