import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifySecurityGroupRulesCommand, se_ModifySecurityGroupRulesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifySecurityGroupRulesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifySecurityGroupRules", {})
    .n("EC2Client", "ModifySecurityGroupRulesCommand")
    .f(void 0, void 0)
    .ser(se_ModifySecurityGroupRulesCommand)
    .de(de_ModifySecurityGroupRulesCommand)
    .build() {
}
