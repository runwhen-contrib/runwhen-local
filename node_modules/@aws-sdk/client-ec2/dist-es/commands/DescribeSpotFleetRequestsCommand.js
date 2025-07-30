import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeSpotFleetRequestsResponseFilterSensitiveLog, } from "../models/models_5";
import { de_DescribeSpotFleetRequestsCommand, se_DescribeSpotFleetRequestsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeSpotFleetRequestsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeSpotFleetRequests", {})
    .n("EC2Client", "DescribeSpotFleetRequestsCommand")
    .f(void 0, DescribeSpotFleetRequestsResponseFilterSensitiveLog)
    .ser(se_DescribeSpotFleetRequestsCommand)
    .de(de_DescribeSpotFleetRequestsCommand)
    .build() {
}
