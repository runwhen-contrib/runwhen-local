import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ResetInstanceAttributeCommand, se_ResetInstanceAttributeCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ResetInstanceAttributeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ResetInstanceAttribute", {})
    .n("EC2Client", "ResetInstanceAttributeCommand")
    .f(void 0, void 0)
    .ser(se_ResetInstanceAttributeCommand)
    .de(de_ResetInstanceAttributeCommand)
    .build() {
}
