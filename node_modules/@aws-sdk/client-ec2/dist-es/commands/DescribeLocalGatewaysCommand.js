import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeLocalGatewaysCommand, se_DescribeLocalGatewaysCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeLocalGatewaysCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeLocalGateways", {})
    .n("EC2Client", "DescribeLocalGatewaysCommand")
    .f(void 0, void 0)
    .ser(se_DescribeLocalGatewaysCommand)
    .de(de_DescribeLocalGatewaysCommand)
    .build() {
}
