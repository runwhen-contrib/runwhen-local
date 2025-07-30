import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyVpnConnectionOptionsResultFilterSensitiveLog, } from "../models/models_7";
import { de_ModifyVpnConnectionOptionsCommand, se_ModifyVpnConnectionOptionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVpnConnectionOptionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVpnConnectionOptions", {})
    .n("EC2Client", "ModifyVpnConnectionOptionsCommand")
    .f(void 0, ModifyVpnConnectionOptionsResultFilterSensitiveLog)
    .ser(se_ModifyVpnConnectionOptionsCommand)
    .de(de_ModifyVpnConnectionOptionsCommand)
    .build() {
}
