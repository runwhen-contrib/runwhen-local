import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteTrafficMirrorFilterRuleCommand, se_DeleteTrafficMirrorFilterRuleCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteTrafficMirrorFilterRuleCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteTrafficMirrorFilterRule", {})
    .n("EC2Client", "DeleteTrafficMirrorFilterRuleCommand")
    .f(void 0, void 0)
    .ser(se_DeleteTrafficMirrorFilterRuleCommand)
    .de(de_DeleteTrafficMirrorFilterRuleCommand)
    .build() {
}
