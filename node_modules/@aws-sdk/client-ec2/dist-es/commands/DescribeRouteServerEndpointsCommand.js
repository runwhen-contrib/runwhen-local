import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeRouteServerEndpointsCommand, se_DescribeRouteServerEndpointsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeRouteServerEndpointsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeRouteServerEndpoints", {})
    .n("EC2Client", "DescribeRouteServerEndpointsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeRouteServerEndpointsCommand)
    .de(de_DescribeRouteServerEndpointsCommand)
    .build() {
}
