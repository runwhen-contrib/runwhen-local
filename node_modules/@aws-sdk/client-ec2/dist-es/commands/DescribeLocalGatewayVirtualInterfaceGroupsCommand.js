import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeLocalGatewayVirtualInterfaceGroupsCommand, se_DescribeLocalGatewayVirtualInterfaceGroupsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeLocalGatewayVirtualInterfaceGroupsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeLocalGatewayVirtualInterfaceGroups", {})
    .n("EC2Client", "DescribeLocalGatewayVirtualInterfaceGroupsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeLocalGatewayVirtualInterfaceGroupsCommand)
    .de(de_DescribeLocalGatewayVirtualInterfaceGroupsCommand)
    .build() {
}
