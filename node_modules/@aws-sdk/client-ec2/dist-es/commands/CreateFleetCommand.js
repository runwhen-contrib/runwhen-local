import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateFleetCommand, se_CreateFleetCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateFleetCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateFleet", {})
    .n("EC2Client", "CreateFleetCommand")
    .f(void 0, void 0)
    .ser(se_CreateFleetCommand)
    .de(de_CreateFleetCommand)
    .build() {
}
