import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeVpcPeeringConnectionsCommand, se_DescribeVpcPeeringConnectionsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeVpcPeeringConnectionsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeVpcPeeringConnections", {})
    .n("EC2Client", "DescribeVpcPeeringConnectionsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeVpcPeeringConnectionsCommand)
    .de(de_DescribeVpcPeeringConnectionsCommand)
    .build() {
}
