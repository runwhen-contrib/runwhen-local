import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ExportClientVpnClientCertificateRevocationListCommand, se_ExportClientVpnClientCertificateRevocationListCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ExportClientVpnClientCertificateRevocationListCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ExportClientVpnClientCertificateRevocationList", {})
    .n("EC2Client", "ExportClientVpnClientCertificateRevocationListCommand")
    .f(void 0, void 0)
    .ser(se_ExportClientVpnClientCertificateRevocationListCommand)
    .de(de_ExportClientVpnClientCertificateRevocationListCommand)
    .build() {
}
