import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeFlowLogsCommand, se_DescribeFlowLogsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeFlowLogsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeFlowLogs", {})
    .n("EC2Client", "DescribeFlowLogsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeFlowLogsCommand)
    .de(de_DescribeFlowLogsCommand)
    .build() {
}
