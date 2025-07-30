import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyVpnTunnelCertificateResultFilterSensitiveLog, } from "../models/models_7";
import { de_ModifyVpnTunnelCertificateCommand, se_ModifyVpnTunnelCertificateCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVpnTunnelCertificateCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVpnTunnelCertificate", {})
    .n("EC2Client", "ModifyVpnTunnelCertificateCommand")
    .f(void 0, ModifyVpnTunnelCertificateResultFilterSensitiveLog)
    .ser(se_ModifyVpnTunnelCertificateCommand)
    .de(de_ModifyVpnTunnelCertificateCommand)
    .build() {
}
