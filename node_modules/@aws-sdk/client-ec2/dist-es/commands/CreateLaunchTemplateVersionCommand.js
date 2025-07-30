import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CreateLaunchTemplateVersionRequestFilterSensitiveLog, CreateLaunchTemplateVersionResultFilterSensitiveLog, } from "../models/models_1";
import { de_CreateLaunchTemplateVersionCommand, se_CreateLaunchTemplateVersionCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateLaunchTemplateVersionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateLaunchTemplateVersion", {})
    .n("EC2Client", "CreateLaunchTemplateVersionCommand")
    .f(CreateLaunchTemplateVersionRequestFilterSensitiveLog, CreateLaunchTemplateVersionResultFilterSensitiveLog)
    .ser(se_CreateLaunchTemplateVersionCommand)
    .de(de_CreateLaunchTemplateVersionCommand)
    .build() {
}
