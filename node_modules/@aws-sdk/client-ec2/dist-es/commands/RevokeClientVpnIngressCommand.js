import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RevokeClientVpnIngressCommand, se_RevokeClientVpnIngressCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RevokeClientVpnIngressCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RevokeClientVpnIngress", {})
    .n("EC2Client", "RevokeClientVpnIngressCommand")
    .f(void 0, void 0)
    .ser(se_RevokeClientVpnIngressCommand)
    .de(de_RevokeClientVpnIngressCommand)
    .build() {
}
