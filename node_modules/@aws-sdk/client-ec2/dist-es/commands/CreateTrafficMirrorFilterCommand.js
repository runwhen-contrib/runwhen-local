import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateTrafficMirrorFilterCommand, se_CreateTrafficMirrorFilterCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateTrafficMirrorFilterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateTrafficMirrorFilter", {})
    .n("EC2Client", "CreateTrafficMirrorFilterCommand")
    .f(void 0, void 0)
    .ser(se_CreateTrafficMirrorFilterCommand)
    .de(de_CreateTrafficMirrorFilterCommand)
    .build() {
}
