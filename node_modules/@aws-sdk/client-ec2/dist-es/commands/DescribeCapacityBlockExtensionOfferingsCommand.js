import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeCapacityBlockExtensionOfferingsCommand, se_DescribeCapacityBlockExtensionOfferingsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeCapacityBlockExtensionOfferingsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeCapacityBlockExtensionOfferings", {})
    .n("EC2Client", "DescribeCapacityBlockExtensionOfferingsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeCapacityBlockExtensionOfferingsCommand)
    .de(de_DescribeCapacityBlockExtensionOfferingsCommand)
    .build() {
}
