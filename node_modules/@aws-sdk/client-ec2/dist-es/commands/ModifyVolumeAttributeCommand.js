import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyVolumeAttributeCommand, se_ModifyVolumeAttributeCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVolumeAttributeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVolumeAttribute", {})
    .n("EC2Client", "ModifyVolumeAttributeCommand")
    .f(void 0, void 0)
    .ser(se_ModifyVolumeAttributeCommand)
    .de(de_ModifyVolumeAttributeCommand)
    .build() {
}
