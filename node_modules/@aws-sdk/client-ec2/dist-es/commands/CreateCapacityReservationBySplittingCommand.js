import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateCapacityReservationBySplittingCommand, se_CreateCapacityReservationBySplittingCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class CreateCapacityReservationBySplittingCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateCapacityReservationBySplitting", {})
    .n("EC2Client", "CreateCapacityReservationBySplittingCommand")
    .f(void 0, void 0)
    .ser(se_CreateCapacityReservationBySplittingCommand)
    .de(de_CreateCapacityReservationBySplittingCommand)
    .build() {
}
