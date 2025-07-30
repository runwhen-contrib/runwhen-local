import { getCopySnapshotPresignedUrlPlugin } from "@aws-sdk/middleware-sdk-ec2";
import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CopySnapshotRequestFilterSensitiveLog } from "../models/models_1";
import { de_CopySnapshotCommand, se_CopySnapshotCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CopySnapshotCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
        getCopySnapshotPresignedUrlPlugin(config),
    ];
})
    .s("AmazonEC2", "CopySnapshot", {})
    .n("EC2Client", "CopySnapshotCommand")
    .f(CopySnapshotRequestFilterSensitiveLog, void 0)
    .ser(se_CopySnapshotCommand)
    .de(de_CopySnapshotCommand)
    .build() {
}
