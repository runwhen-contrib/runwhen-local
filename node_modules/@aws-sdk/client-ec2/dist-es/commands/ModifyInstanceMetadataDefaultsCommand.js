import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyInstanceMetadataDefaultsCommand, se_ModifyInstanceMetadataDefaultsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyInstanceMetadataDefaultsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyInstanceMetadataDefaults", {})
    .n("EC2Client", "ModifyInstanceMetadataDefaultsCommand")
    .f(void 0, void 0)
    .ser(se_ModifyInstanceMetadataDefaultsCommand)
    .de(de_ModifyInstanceMetadataDefaultsCommand)
    .build() {
}
