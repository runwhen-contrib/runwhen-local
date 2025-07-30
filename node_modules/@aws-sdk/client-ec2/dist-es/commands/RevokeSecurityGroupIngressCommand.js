import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RevokeSecurityGroupIngressCommand, se_RevokeSecurityGroupIngressCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RevokeSecurityGroupIngressCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RevokeSecurityGroupIngress", {})
    .n("EC2Client", "RevokeSecurityGroupIngressCommand")
    .f(void 0, void 0)
    .ser(se_RevokeSecurityGroupIngressCommand)
    .de(de_RevokeSecurityGroupIngressCommand)
    .build() {
}
