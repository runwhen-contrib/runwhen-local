import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CreateLaunchTemplateRequestFilterSensitiveLog, } from "../models/models_1";
import { de_CreateLaunchTemplateCommand, se_CreateLaunchTemplateCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateLaunchTemplateCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateLaunchTemplate", {})
    .n("EC2Client", "CreateLaunchTemplateCommand")
    .f(CreateLaunchTemplateRequestFilterSensitiveLog, void 0)
    .ser(se_CreateLaunchTemplateCommand)
    .de(de_CreateLaunchTemplateCommand)
    .build() {
}
