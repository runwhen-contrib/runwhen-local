import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateTrafficMirrorTargetCommand, se_CreateTrafficMirrorTargetCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateTrafficMirrorTargetCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateTrafficMirrorTarget", {})
    .n("EC2Client", "CreateTrafficMirrorTargetCommand")
    .f(void 0, void 0)
    .ser(se_CreateTrafficMirrorTargetCommand)
    .de(de_CreateTrafficMirrorTargetCommand)
    .build() {
}
