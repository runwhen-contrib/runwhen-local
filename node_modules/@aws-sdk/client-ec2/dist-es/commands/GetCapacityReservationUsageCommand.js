import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetCapacityReservationUsageCommand, se_GetCapacityReservationUsageCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetCapacityReservationUsageCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetCapacityReservationUsage", {})
    .n("EC2Client", "GetCapacityReservationUsageCommand")
    .f(void 0, void 0)
    .ser(se_GetCapacityReservationUsageCommand)
    .de(de_GetCapacityReservationUsageCommand)
    .build() {
}
