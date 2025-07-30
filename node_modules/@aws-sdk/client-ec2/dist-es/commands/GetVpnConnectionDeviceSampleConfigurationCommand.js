import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetVpnConnectionDeviceSampleConfigurationResultFilterSensitiveLog, } from "../models/models_6";
import { de_GetVpnConnectionDeviceSampleConfigurationCommand, se_GetVpnConnectionDeviceSampleConfigurationCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class GetVpnConnectionDeviceSampleConfigurationCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetVpnConnectionDeviceSampleConfiguration", {})
    .n("EC2Client", "GetVpnConnectionDeviceSampleConfigurationCommand")
    .f(void 0, GetVpnConnectionDeviceSampleConfigurationResultFilterSensitiveLog)
    .ser(se_GetVpnConnectionDeviceSampleConfigurationCommand)
    .de(de_GetVpnConnectionDeviceSampleConfigurationCommand)
    .build() {
}
