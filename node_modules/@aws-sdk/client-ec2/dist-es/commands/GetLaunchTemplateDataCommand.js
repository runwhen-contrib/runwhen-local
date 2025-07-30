import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetLaunchTemplateDataResultFilterSensitiveLog, } from "../models/models_6";
import { de_GetLaunchTemplateDataCommand, se_GetLaunchTemplateDataCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetLaunchTemplateDataCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetLaunchTemplateData", {})
    .n("EC2Client", "GetLaunchTemplateDataCommand")
    .f(void 0, GetLaunchTemplateDataResultFilterSensitiveLog)
    .ser(se_GetLaunchTemplateDataCommand)
    .de(de_GetLaunchTemplateDataCommand)
    .build() {
}
