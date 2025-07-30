import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeImportSnapshotTasksResultFilterSensitiveLog, } from "../models/models_4";
import { de_DescribeImportSnapshotTasksCommand, se_DescribeImportSnapshotTasksCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeImportSnapshotTasksCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeImportSnapshotTasks", {})
    .n("EC2Client", "DescribeImportSnapshotTasksCommand")
    .f(void 0, DescribeImportSnapshotTasksResultFilterSensitiveLog)
    .ser(se_DescribeImportSnapshotTasksCommand)
    .de(de_DescribeImportSnapshotTasksCommand)
    .build() {
}
