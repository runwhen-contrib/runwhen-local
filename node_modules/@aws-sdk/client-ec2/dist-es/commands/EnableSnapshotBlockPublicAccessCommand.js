import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_EnableSnapshotBlockPublicAccessCommand, se_EnableSnapshotBlockPublicAccessCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class EnableSnapshotBlockPublicAccessCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "EnableSnapshotBlockPublicAccess", {})
    .n("EC2Client", "EnableSnapshotBlockPublicAccessCommand")
    .f(void 0, void 0)
    .ser(se_EnableSnapshotBlockPublicAccessCommand)
    .de(de_EnableSnapshotBlockPublicAccessCommand)
    .build() {
}
