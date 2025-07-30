import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeImportImageTasksResultFilterSensitiveLog, } from "../models/models_4";
import { de_DescribeImportImageTasksCommand, se_DescribeImportImageTasksCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeImportImageTasksCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeImportImageTasks", {})
    .n("EC2Client", "DescribeImportImageTasksCommand")
    .f(void 0, DescribeImportImageTasksResultFilterSensitiveLog)
    .ser(se_DescribeImportImageTasksCommand)
    .de(de_DescribeImportImageTasksCommand)
    .build() {
}
