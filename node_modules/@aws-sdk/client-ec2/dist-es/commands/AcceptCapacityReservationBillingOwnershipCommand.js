import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AcceptCapacityReservationBillingOwnershipCommand, se_AcceptCapacityReservationBillingOwnershipCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class AcceptCapacityReservationBillingOwnershipCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AcceptCapacityReservationBillingOwnership", {})
    .n("EC2Client", "AcceptCapacityReservationBillingOwnershipCommand")
    .f(void 0, void 0)
    .ser(se_AcceptCapacityReservationBillingOwnershipCommand)
    .de(de_AcceptCapacityReservationBillingOwnershipCommand)
    .build() {
}
