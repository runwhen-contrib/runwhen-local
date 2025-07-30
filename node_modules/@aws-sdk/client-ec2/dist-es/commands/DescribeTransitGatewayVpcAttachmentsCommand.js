import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTransitGatewayVpcAttachmentsCommand, se_DescribeTransitGatewayVpcAttachmentsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTransitGatewayVpcAttachmentsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTransitGatewayVpcAttachments", {})
    .n("EC2Client", "DescribeTransitGatewayVpcAttachmentsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTransitGatewayVpcAttachmentsCommand)
    .de(de_DescribeTransitGatewayVpcAttachmentsCommand)
    .build() {
}
