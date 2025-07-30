import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteTrafficMirrorFilterCommand, se_DeleteTrafficMirrorFilterCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteTrafficMirrorFilterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteTrafficMirrorFilter", {})
    .n("EC2Client", "DeleteTrafficMirrorFilterCommand")
    .f(void 0, void 0)
    .ser(se_DeleteTrafficMirrorFilterCommand)
    .de(de_DeleteTrafficMirrorFilterCommand)
    .build() {
}
