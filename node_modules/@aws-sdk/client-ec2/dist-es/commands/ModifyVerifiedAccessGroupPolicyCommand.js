import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyVerifiedAccessGroupPolicyCommand, se_ModifyVerifiedAccessGroupPolicyCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVerifiedAccessGroupPolicyCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVerifiedAccessGroupPolicy", {})
    .n("EC2Client", "ModifyVerifiedAccessGroupPolicyCommand")
    .f(void 0, void 0)
    .ser(se_ModifyVerifiedAccessGroupPolicyCommand)
    .de(de_ModifyVerifiedAccessGroupPolicyCommand)
    .build() {
}
