import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DetachVerifiedAccessTrustProviderResultFilterSensitiveLog, } from "../models/models_5";
import { de_DetachVerifiedAccessTrustProviderCommand, se_DetachVerifiedAccessTrustProviderCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DetachVerifiedAccessTrustProviderCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DetachVerifiedAccessTrustProvider", {})
    .n("EC2Client", "DetachVerifiedAccessTrustProviderCommand")
    .f(void 0, DetachVerifiedAccessTrustProviderResultFilterSensitiveLog)
    .ser(se_DetachVerifiedAccessTrustProviderCommand)
    .de(de_DetachVerifiedAccessTrustProviderCommand)
    .build() {
}
