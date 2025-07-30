import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CreateVpnConnectionRequestFilterSensitiveLog, CreateVpnConnectionResultFilterSensitiveLog, } from "../models/models_3";
import { de_CreateVpnConnectionCommand, se_CreateVpnConnectionCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateVpnConnectionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateVpnConnection", {})
    .n("EC2Client", "CreateVpnConnectionCommand")
    .f(CreateVpnConnectionRequestFilterSensitiveLog, CreateVpnConnectionResultFilterSensitiveLog)
    .ser(se_CreateVpnConnectionCommand)
    .de(de_CreateVpnConnectionCommand)
    .build() {
}
