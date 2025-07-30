import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyVpnConnectionResultFilterSensitiveLog, } from "../models/models_7";
import { de_ModifyVpnConnectionCommand, se_ModifyVpnConnectionCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVpnConnectionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVpnConnection", {})
    .n("EC2Client", "ModifyVpnConnectionCommand")
    .f(void 0, ModifyVpnConnectionResultFilterSensitiveLog)
    .ser(se_ModifyVpnConnectionCommand)
    .de(de_ModifyVpnConnectionCommand)
    .build() {
}
