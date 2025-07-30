import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CreateVerifiedAccessTrustProviderRequestFilterSensitiveLog, CreateVerifiedAccessTrustProviderResultFilterSensitiveLog, } from "../models/models_2";
import { de_CreateVerifiedAccessTrustProviderCommand, se_CreateVerifiedAccessTrustProviderCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class CreateVerifiedAccessTrustProviderCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateVerifiedAccessTrustProvider", {})
    .n("EC2Client", "CreateVerifiedAccessTrustProviderCommand")
    .f(CreateVerifiedAccessTrustProviderRequestFilterSensitiveLog, CreateVerifiedAccessTrustProviderResultFilterSensitiveLog)
    .ser(se_CreateVerifiedAccessTrustProviderCommand)
    .de(de_CreateVerifiedAccessTrustProviderCommand)
    .build() {
}
