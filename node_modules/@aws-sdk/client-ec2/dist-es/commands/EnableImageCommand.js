import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_EnableImageCommand, se_EnableImageCommand } from "../protocols/Aws_ec2";
export { $Command };
export class EnableImageCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "EnableImage", {})
    .n("EC2Client", "EnableImageCommand")
    .f(void 0, void 0)
    .ser(se_EnableImageCommand)
    .de(de_EnableImageCommand)
    .build() {
}
