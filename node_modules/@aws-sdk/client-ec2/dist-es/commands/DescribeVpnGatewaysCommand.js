import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeVpnGatewaysCommand, se_DescribeVpnGatewaysCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeVpnGatewaysCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeVpnGateways", {})
    .n("EC2Client", "DescribeVpnGatewaysCommand")
    .f(void 0, void 0)
    .ser(se_DescribeVpnGatewaysCommand)
    .de(de_DescribeVpnGatewaysCommand)
    .build() {
}
