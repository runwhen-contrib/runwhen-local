import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeIpamsCommand, se_DescribeIpamsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeIpamsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeIpams", {})
    .n("EC2Client", "DescribeIpamsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeIpamsCommand)
    .de(de_DescribeIpamsCommand)
    .build() {
}
