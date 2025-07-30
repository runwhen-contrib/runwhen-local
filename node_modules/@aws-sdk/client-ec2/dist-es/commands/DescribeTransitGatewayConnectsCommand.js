import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTransitGatewayConnectsCommand, se_DescribeTransitGatewayConnectsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTransitGatewayConnectsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTransitGatewayConnects", {})
    .n("EC2Client", "DescribeTransitGatewayConnectsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTransitGatewayConnectsCommand)
    .de(de_DescribeTransitGatewayConnectsCommand)
    .build() {
}
