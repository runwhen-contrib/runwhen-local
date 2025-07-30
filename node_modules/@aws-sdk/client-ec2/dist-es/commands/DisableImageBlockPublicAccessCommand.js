import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DisableImageBlockPublicAccessCommand, se_DisableImageBlockPublicAccessCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DisableImageBlockPublicAccessCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DisableImageBlockPublicAccess", {})
    .n("EC2Client", "DisableImageBlockPublicAccessCommand")
    .f(void 0, void 0)
    .ser(se_DisableImageBlockPublicAccessCommand)
    .de(de_DisableImageBlockPublicAccessCommand)
    .build() {
}
