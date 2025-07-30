import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ExportVerifiedAccessInstanceClientConfigurationResultFilterSensitiveLog, } from "../models/models_6";
import { de_ExportVerifiedAccessInstanceClientConfigurationCommand, se_ExportVerifiedAccessInstanceClientConfigurationCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ExportVerifiedAccessInstanceClientConfigurationCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ExportVerifiedAccessInstanceClientConfiguration", {})
    .n("EC2Client", "ExportVerifiedAccessInstanceClientConfigurationCommand")
    .f(void 0, ExportVerifiedAccessInstanceClientConfigurationResultFilterSensitiveLog)
    .ser(se_ExportVerifiedAccessInstanceClientConfigurationCommand)
    .de(de_ExportVerifiedAccessInstanceClientConfigurationCommand)
    .build() {
}
