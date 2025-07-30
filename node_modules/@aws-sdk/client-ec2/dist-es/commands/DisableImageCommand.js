import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DisableImageCommand, se_DisableImageCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DisableImageCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DisableImage", {})
    .n("EC2Client", "DisableImageCommand")
    .f(void 0, void 0)
    .ser(se_DisableImageCommand)
    .de(de_DisableImageCommand)
    .build() {
}
