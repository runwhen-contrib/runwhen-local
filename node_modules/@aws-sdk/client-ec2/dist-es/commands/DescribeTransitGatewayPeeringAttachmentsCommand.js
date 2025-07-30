import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTransitGatewayPeeringAttachmentsCommand, se_DescribeTransitGatewayPeeringAttachmentsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTransitGatewayPeeringAttachmentsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTransitGatewayPeeringAttachments", {})
    .n("EC2Client", "DescribeTransitGatewayPeeringAttachmentsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTransitGatewayPeeringAttachmentsCommand)
    .de(de_DescribeTransitGatewayPeeringAttachmentsCommand)
    .build() {
}
