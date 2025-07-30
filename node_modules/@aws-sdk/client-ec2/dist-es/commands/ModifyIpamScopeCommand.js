import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyIpamScopeCommand, se_ModifyIpamScopeCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyIpamScopeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyIpamScope", {})
    .n("EC2Client", "ModifyIpamScopeCommand")
    .f(void 0, void 0)
    .ser(se_ModifyIpamScopeCommand)
    .de(de_ModifyIpamScopeCommand)
    .build() {
}
