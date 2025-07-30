import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeHostReservationsCommand, se_DescribeHostReservationsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeHostReservationsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeHostReservations", {})
    .n("EC2Client", "DescribeHostReservationsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeHostReservationsCommand)
    .de(de_DescribeHostReservationsCommand)
    .build() {
}
