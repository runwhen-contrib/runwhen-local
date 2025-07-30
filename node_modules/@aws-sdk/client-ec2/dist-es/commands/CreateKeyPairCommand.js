import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { KeyPairFilterSensitiveLog } from "../models/models_1";
import { de_CreateKeyPairCommand, se_CreateKeyPairCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateKeyPairCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateKeyPair", {})
    .n("EC2Client", "CreateKeyPairCommand")
    .f(void 0, KeyPairFilterSensitiveLog)
    .ser(se_CreateKeyPairCommand)
    .de(de_CreateKeyPairCommand)
    .build() {
}
