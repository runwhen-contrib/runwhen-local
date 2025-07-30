import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateInstanceEventWindowCommand, se_CreateInstanceEventWindowCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateInstanceEventWindowCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateInstanceEventWindow", {})
    .n("EC2Client", "CreateInstanceEventWindowCommand")
    .f(void 0, void 0)
    .ser(se_CreateInstanceEventWindowCommand)
    .de(de_CreateInstanceEventWindowCommand)
    .build() {
}
