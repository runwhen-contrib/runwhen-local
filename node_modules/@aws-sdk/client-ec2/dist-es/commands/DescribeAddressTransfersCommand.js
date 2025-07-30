import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeAddressTransfersCommand, se_DescribeAddressTransfersCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeAddressTransfersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeAddressTransfers", {})
    .n("EC2Client", "DescribeAddressTransfersCommand")
    .f(void 0, void 0)
    .ser(se_DescribeAddressTransfersCommand)
    .de(de_DescribeAddressTransfersCommand)
    .build() {
}
