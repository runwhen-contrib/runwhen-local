import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { CancelBundleTaskResultFilterSensitiveLog, } from "../models/models_0";
import { de_CancelBundleTaskCommand, se_CancelBundleTaskCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CancelBundleTaskCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CancelBundleTask", {})
    .n("EC2Client", "CancelBundleTaskCommand")
    .f(void 0, CancelBundleTaskResultFilterSensitiveLog)
    .ser(se_CancelBundleTaskCommand)
    .de(de_CancelBundleTaskCommand)
    .build() {
}
