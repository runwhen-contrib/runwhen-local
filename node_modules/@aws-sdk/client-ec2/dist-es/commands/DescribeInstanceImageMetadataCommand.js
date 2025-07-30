import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeInstanceImageMetadataCommand, se_DescribeInstanceImageMetadataCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeInstanceImageMetadataCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeInstanceImageMetadata", {})
    .n("EC2Client", "DescribeInstanceImageMetadataCommand")
    .f(void 0, void 0)
    .ser(se_DescribeInstanceImageMetadataCommand)
    .de(de_DescribeInstanceImageMetadataCommand)
    .build() {
}
