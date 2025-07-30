import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { AttachVerifiedAccessTrustProviderResultFilterSensitiveLog, } from "../models/models_0";
import { de_AttachVerifiedAccessTrustProviderCommand, se_AttachVerifiedAccessTrustProviderCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class AttachVerifiedAccessTrustProviderCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AttachVerifiedAccessTrustProvider", {})
    .n("EC2Client", "AttachVerifiedAccessTrustProviderCommand")
    .f(void 0, AttachVerifiedAccessTrustProviderResultFilterSensitiveLog)
    .ser(se_AttachVerifiedAccessTrustProviderCommand)
    .de(de_AttachVerifiedAccessTrustProviderCommand)
    .build() {
}
