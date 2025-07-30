import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeNetworkInterfaceAttributeCommand, se_DescribeNetworkInterfaceAttributeCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeNetworkInterfaceAttributeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeNetworkInterfaceAttribute", {})
    .n("EC2Client", "DescribeNetworkInterfaceAttributeCommand")
    .f(void 0, void 0)
    .ser(se_DescribeNetworkInterfaceAttributeCommand)
    .de(de_DescribeNetworkInterfaceAttributeCommand)
    .build() {
}
