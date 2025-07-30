import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeCoipPoolsCommand, se_DescribeCoipPoolsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeCoipPoolsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeCoipPools", {})
    .n("EC2Client", "DescribeCoipPoolsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeCoipPoolsCommand)
    .de(de_DescribeCoipPoolsCommand)
    .build() {
}
