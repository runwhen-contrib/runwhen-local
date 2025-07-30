import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { GetPasswordDataResultFilterSensitiveLog, } from "../models/models_6";
import { de_GetPasswordDataCommand, se_GetPasswordDataCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetPasswordDataCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetPasswordData", {})
    .n("EC2Client", "GetPasswordDataCommand")
    .f(void 0, GetPasswordDataResultFilterSensitiveLog)
    .ser(se_GetPasswordDataCommand)
    .de(de_GetPasswordDataCommand)
    .build() {
}
