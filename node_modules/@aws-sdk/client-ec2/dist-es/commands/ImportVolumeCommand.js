import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ImportVolumeRequestFilterSensitiveLog, ImportVolumeResultFilterSensitiveLog, } from "../models/models_7";
import { de_ImportVolumeCommand, se_ImportVolumeCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ImportVolumeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ImportVolume", {})
    .n("EC2Client", "ImportVolumeCommand")
    .f(ImportVolumeRequestFilterSensitiveLog, ImportVolumeResultFilterSensitiveLog)
    .ser(se_ImportVolumeCommand)
    .de(de_ImportVolumeCommand)
    .build() {
}
