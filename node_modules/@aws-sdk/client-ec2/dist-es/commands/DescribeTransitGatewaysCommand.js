import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTransitGatewaysCommand, se_DescribeTransitGatewaysCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTransitGatewaysCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTransitGateways", {})
    .n("EC2Client", "DescribeTransitGatewaysCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTransitGatewaysCommand)
    .de(de_DescribeTransitGatewaysCommand)
    .build() {
}
