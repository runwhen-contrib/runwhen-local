import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeIdFormatCommand, se_DescribeIdFormatCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeIdFormatCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeIdFormat", {})
    .n("EC2Client", "DescribeIdFormatCommand")
    .f(void 0, void 0)
    .ser(se_DescribeIdFormatCommand)
    .de(de_DescribeIdFormatCommand)
    .build() {
}
