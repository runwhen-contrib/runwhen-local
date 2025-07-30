import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeReservedInstancesModificationsCommand, se_DescribeReservedInstancesModificationsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeReservedInstancesModificationsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeReservedInstancesModifications", {})
    .n("EC2Client", "DescribeReservedInstancesModificationsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeReservedInstancesModificationsCommand)
    .de(de_DescribeReservedInstancesModificationsCommand)
    .build() {
}
