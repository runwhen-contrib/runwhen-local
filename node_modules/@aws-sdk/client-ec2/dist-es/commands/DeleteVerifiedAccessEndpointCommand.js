import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteVerifiedAccessEndpointCommand, se_DeleteVerifiedAccessEndpointCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteVerifiedAccessEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteVerifiedAccessEndpoint", {})
    .n("EC2Client", "DeleteVerifiedAccessEndpointCommand")
    .f(void 0, void 0)
    .ser(se_DeleteVerifiedAccessEndpointCommand)
    .de(de_DeleteVerifiedAccessEndpointCommand)
    .build() {
}
