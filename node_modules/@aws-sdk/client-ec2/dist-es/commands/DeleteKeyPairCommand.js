import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteKeyPairCommand, se_DeleteKeyPairCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteKeyPairCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteKeyPair", {})
    .n("EC2Client", "DeleteKeyPairCommand")
    .f(void 0, void 0)
    .ser(se_DeleteKeyPairCommand)
    .de(de_DeleteKeyPairCommand)
    .build() {
}
