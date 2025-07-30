import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ImportSnapshotRequestFilterSensitiveLog, ImportSnapshotResultFilterSensitiveLog, } from "../models/models_7";
import { de_ImportSnapshotCommand, se_ImportSnapshotCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ImportSnapshotCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ImportSnapshot", {})
    .n("EC2Client", "ImportSnapshotCommand")
    .f(ImportSnapshotRequestFilterSensitiveLog, ImportSnapshotResultFilterSensitiveLog)
    .ser(se_ImportSnapshotCommand)
    .de(de_ImportSnapshotCommand)
    .build() {
}
