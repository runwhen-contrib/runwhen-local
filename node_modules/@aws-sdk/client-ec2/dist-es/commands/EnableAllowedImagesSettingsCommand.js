import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_EnableAllowedImagesSettingsCommand, se_EnableAllowedImagesSettingsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class EnableAllowedImagesSettingsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "EnableAllowedImagesSettings", {})
    .n("EC2Client", "EnableAllowedImagesSettingsCommand")
    .f(void 0, void 0)
    .ser(se_EnableAllowedImagesSettingsCommand)
    .de(de_EnableAllowedImagesSettingsCommand)
    .build() {
}
