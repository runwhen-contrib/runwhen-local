import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ImportImageRequestFilterSensitiveLog, ImportImageResultFilterSensitiveLog, } from "../models/models_6";
import { de_ImportImageCommand, se_ImportImageCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ImportImageCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ImportImage", {})
    .n("EC2Client", "ImportImageCommand")
    .f(ImportImageRequestFilterSensitiveLog, ImportImageResultFilterSensitiveLog)
    .ser(se_ImportImageCommand)
    .de(de_ImportImageCommand)
    .build() {
}
