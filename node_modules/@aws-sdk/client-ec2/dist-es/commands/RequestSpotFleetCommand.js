import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { RequestSpotFleetRequestFilterSensitiveLog, } from "../models/models_7";
import { de_RequestSpotFleetCommand, se_RequestSpotFleetCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RequestSpotFleetCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RequestSpotFleet", {})
    .n("EC2Client", "RequestSpotFleetCommand")
    .f(RequestSpotFleetRequestFilterSensitiveLog, void 0)
    .ser(se_RequestSpotFleetCommand)
    .de(de_RequestSpotFleetCommand)
    .build() {
}
