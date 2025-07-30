import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateCoipCidrCommand, se_CreateCoipCidrCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateCoipCidrCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateCoipCidr", {})
    .n("EC2Client", "CreateCoipCidrCommand")
    .f(void 0, void 0)
    .ser(se_CreateCoipCidrCommand)
    .de(de_CreateCoipCidrCommand)
    .build() {
}
