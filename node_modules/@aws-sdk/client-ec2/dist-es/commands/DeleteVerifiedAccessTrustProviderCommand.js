import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DeleteVerifiedAccessTrustProviderResultFilterSensitiveLog, } from "../models/models_3";
import { de_DeleteVerifiedAccessTrustProviderCommand, se_DeleteVerifiedAccessTrustProviderCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteVerifiedAccessTrustProviderCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteVerifiedAccessTrustProvider", {})
    .n("EC2Client", "DeleteVerifiedAccessTrustProviderCommand")
    .f(void 0, DeleteVerifiedAccessTrustProviderResultFilterSensitiveLog)
    .ser(se_DeleteVerifiedAccessTrustProviderCommand)
    .de(de_DeleteVerifiedAccessTrustProviderCommand)
    .build() {
}
