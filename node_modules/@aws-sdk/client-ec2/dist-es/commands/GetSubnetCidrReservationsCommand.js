import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetSubnetCidrReservationsCommand, se_GetSubnetCidrReservationsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetSubnetCidrReservationsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetSubnetCidrReservations", {})
    .n("EC2Client", "GetSubnetCidrReservationsCommand")
    .f(void 0, void 0)
    .ser(se_GetSubnetCidrReservationsCommand)
    .de(de_GetSubnetCidrReservationsCommand)
    .build() {
}
