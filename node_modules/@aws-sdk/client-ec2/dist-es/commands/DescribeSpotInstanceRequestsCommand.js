import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeSpotInstanceRequestsResultFilterSensitiveLog, } from "../models/models_5";
import { de_DescribeSpotInstanceRequestsCommand, se_DescribeSpotInstanceRequestsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeSpotInstanceRequestsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeSpotInstanceRequests", {})
    .n("EC2Client", "DescribeSpotInstanceRequestsCommand")
    .f(void 0, DescribeSpotInstanceRequestsResultFilterSensitiveLog)
    .ser(se_DescribeSpotInstanceRequestsCommand)
    .de(de_DescribeSpotInstanceRequestsCommand)
    .build() {
}
