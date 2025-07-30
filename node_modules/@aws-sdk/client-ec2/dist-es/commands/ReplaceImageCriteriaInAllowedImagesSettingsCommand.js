import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ReplaceImageCriteriaInAllowedImagesSettingsCommand, se_ReplaceImageCriteriaInAllowedImagesSettingsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ReplaceImageCriteriaInAllowedImagesSettingsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ReplaceImageCriteriaInAllowedImagesSettings", {})
    .n("EC2Client", "ReplaceImageCriteriaInAllowedImagesSettingsCommand")
    .f(void 0, void 0)
    .ser(se_ReplaceImageCriteriaInAllowedImagesSettingsCommand)
    .de(de_ReplaceImageCriteriaInAllowedImagesSettingsCommand)
    .build() {
}
