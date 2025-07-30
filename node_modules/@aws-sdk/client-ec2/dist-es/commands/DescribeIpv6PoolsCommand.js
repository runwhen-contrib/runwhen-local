import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeIpv6PoolsCommand, se_DescribeIpv6PoolsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeIpv6PoolsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeIpv6Pools", {})
    .n("EC2Client", "DescribeIpv6PoolsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeIpv6PoolsCommand)
    .de(de_DescribeIpv6PoolsCommand)
    .build() {
}
