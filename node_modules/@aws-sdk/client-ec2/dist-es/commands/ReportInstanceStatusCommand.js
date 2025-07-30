import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ReportInstanceStatusRequestFilterSensitiveLog } from "../models/models_7";
import { de_ReportInstanceStatusCommand, se_ReportInstanceStatusCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ReportInstanceStatusCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ReportInstanceStatus", {})
    .n("EC2Client", "ReportInstanceStatusCommand")
    .f(ReportInstanceStatusRequestFilterSensitiveLog, void 0)
    .ser(se_ReportInstanceStatusCommand)
    .de(de_ReportInstanceStatusCommand)
    .build() {
}
