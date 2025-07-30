import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { ImportInstanceRequestFilterSensitiveLog, ImportInstanceResultFilterSensitiveLog, } from "../models/models_7";
import { de_ImportInstanceCommand, se_ImportInstanceCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ImportInstanceCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ImportInstance", {})
    .n("EC2Client", "ImportInstanceCommand")
    .f(ImportInstanceRequestFilterSensitiveLog, ImportInstanceResultFilterSensitiveLog)
    .ser(se_ImportInstanceCommand)
    .de(de_ImportInstanceCommand)
    .build() {
}
