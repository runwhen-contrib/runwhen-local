import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeTransitGatewayAttachmentsCommand, se_DescribeTransitGatewayAttachmentsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeTransitGatewayAttachmentsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeTransitGatewayAttachments", {})
    .n("EC2Client", "DescribeTransitGatewayAttachmentsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeTransitGatewayAttachmentsCommand)
    .de(de_DescribeTransitGatewayAttachmentsCommand)
    .build() {
}
