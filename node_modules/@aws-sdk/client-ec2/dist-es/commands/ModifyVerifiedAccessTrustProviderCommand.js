import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ModifyVerifiedAccessTrustProviderRequestFilterSensitiveLog, ModifyVerifiedAccessTrustProviderResultFilterSensitiveLog, } from "../models/models_7";
import { de_ModifyVerifiedAccessTrustProviderCommand, se_ModifyVerifiedAccessTrustProviderCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVerifiedAccessTrustProviderCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVerifiedAccessTrustProvider", {})
    .n("EC2Client", "ModifyVerifiedAccessTrustProviderCommand")
    .f(ModifyVerifiedAccessTrustProviderRequestFilterSensitiveLog, ModifyVerifiedAccessTrustProviderResultFilterSensitiveLog)
    .ser(se_ModifyVerifiedAccessTrustProviderCommand)
    .de(de_ModifyVerifiedAccessTrustProviderCommand)
    .build() {
}
