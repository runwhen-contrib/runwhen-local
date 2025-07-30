import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeReservedInstancesOfferingsCommand, se_DescribeReservedInstancesOfferingsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeReservedInstancesOfferingsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeReservedInstancesOfferings", {})
    .n("EC2Client", "DescribeReservedInstancesOfferingsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeReservedInstancesOfferingsCommand)
    .de(de_DescribeReservedInstancesOfferingsCommand)
    .build() {
}
