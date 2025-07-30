import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeBundleTasksResultFilterSensitiveLog, } from "../models/models_3";
import { de_DescribeBundleTasksCommand, se_DescribeBundleTasksCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeBundleTasksCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeBundleTasks", {})
    .n("EC2Client", "DescribeBundleTasksCommand")
    .f(void 0, DescribeBundleTasksResultFilterSensitiveLog)
    .ser(se_DescribeBundleTasksCommand)
    .de(de_DescribeBundleTasksCommand)
    .build() {
}
